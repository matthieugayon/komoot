var fs = require('fs'),
    _ = require('underscore'),
    path = require('path'),
    Q = require('q'),
    fs_readdir = Q.denodeify(fs.readdir),
    fs_readFile = Q.denodeify(fs.readFile)



module.exports = function (dir,languages) {

    // The asynchronous fs.readdir node.js method has been previously "denodeified"
    // with the Q module so that the function can return a promise
    return fs_readdir(dir)
        .then(function (files){

            // create our array of "readFile" promises with the resulted paths
            // we already "promised" our fs.readFile node function with Q.denodeify
            var promises = files.map(function (file) {
                return fs_readFile(path.join(dir,file))
            })

            // Q.all runs all the readFile calls in parallel
            return Q.all(promises).then(function (content) {
                return [files, content] // content passed to the next then function
            })
        })
        .then(function (data) {

            var files = data[0];
            var contents = data[1];

            /******************************  translation names check  *****************************/

            // create a "double letter languages names" array from available json files
            var translations = files.map(function (file) {
                return path.basename(file,'.json')
            });

            // check if specified languages are supported
            languages.forEach(function(language){
                var supportedLanguage = _.find(translations, function(item){ return item === language;});
                if(!supportedLanguage){
                    throw new Error(language.toUpperCase()+" language not supported")
                }
            });


            /******************************  keys number and names check  *************************/

            // parse every read files json content
            var jsons = contents.map(function (file) {
                return JSON.parse(file)
            });

            // check collections number and names match
            keysMatch(jsons, 'json');

            // The json objects do have the right collections number and names,
            // so we can take the first one as model
            var jsonModel = jsons[0];

            //loop throughout the model's collections
            for (var key in jsonModel) {
                var sameCollectionsArray = [];

                // push every matching collections in a new array
                jsons.forEach(function(json){
                    sameCollectionsArray.push(json[key])
                });

                // check keys number and names match
                keysMatch(sameCollectionsArray,key,'collection');
            }

            return ;
        })
}



function keysMatch (arrayOfObjects,id,type) {

    // keep only the keys and get rid of the values
    var collections = arrayOfObjects.map(function (obj){
        return Object.keys(obj)
    });

    // check collections size (number of keys)
    var sameSize = collections.every(function(element, index, array){
        if (_.size(element) == _.size(collections[0])) return true
        else return false
    });

    // error handling
    if (!sameSize) {
        // type undefined means the current function is being called when checking the json''s collections
        if (type == undefined) {
            throw new Error("The "+id+ " objects don't have the same number of collections accross the different files")
        }
        else {
            throw new Error("The "+id+ " collection doesn't have the same number of keys accross the different files")
        }
    }

    // after getting rid of the values, we only kept an array of keys arrays
    // so if we concatenate all the keys string, we can compare the resulted string,
    // if they differ between the different json files,
    // that means we've got a problem with the keys names
    var duplicateFreeCollections = _.uniq(collections,false,function(item){
        return item.reduce(function(previousValue, currentValue, index, array){
            return previousValue + currentValue;
        })
    });

    // error handling
    if (duplicateFreeCollections.length != 1) {
        // type undefined means the current function is being called when checking the json''s collections
        if (type == undefined) {
            throw new Error("some of the collections names don't match accross the different files");
        }
        else {
            throw new Error("some of the key names inside the "+id+" collection don't match accross the different files");
        }
    }
}