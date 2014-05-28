var validation = require('./validation');
var asyncTask = require("grunt-promise-q");

module.exports = function(grunt) {

    //async task.

    asyncTask.register(grunt,'default','translation json files validation', function () {
        return validation ('./files',['en','de'])
            .then(function(er,data){
                grunt.log.write('All translation json files do have the ' +
                    'same number of collections and keys with matching names   --> grunt task ').ok();

            },function(err){
                grunt.fail.warn(err);
            });
    });

};