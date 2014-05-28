var validation = require('./validation'); // our validation module
var asyncTask = require("grunt-promise-q"); // making grunt promise friendly

module.exports = function(grunt) {

    //async task.

    asyncTask.register(grunt,'default','translation json files validation', function () {
        return validation ('./files',['en','de'])
            .then(function(er,data){
                grunt.log.write('All translation json files do have the ' +
                    'same number of collections and keys with matching names   --> grunt task ').ok();

            },function(err){
                // in case of any errors we stop the grunt process and display the error
                grunt.fail.warn(err);
            });
    });

};