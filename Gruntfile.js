module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        express: {
            options: {
                // Setting to `false` will effectively just run `node path/to/server.js`
                background: false
            },
            dev: {
                options: {
                    script: 'app/server.js',
                    node_env: 'dev'
                }
            },
            prod: {
                options: {
                    script: 'app/server.js',
                    node_env: 'production'
                }
            }
        },
        watch: {
            scripts: {
                files: ['**/*.js'],
                tasks: ['express:dev'],
                options: {
                    nospawn: true //Without this option specified express won't be reloaded
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-express-server');
    grunt.loadNpmTasks('grunt-contrib-watch');
    // Default task(s).
    grunt.registerTask('default', [ 'express:dev', "watch" ]);

};