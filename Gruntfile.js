module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        express: {
            options: {
                // Override defaults here
            },
            dev: {
                options: {
                    script: 'app/server.js'
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
                tasks: ['express'],
                options: {
                    spawn: false
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-express-server');
    grunt.loadNpmTasks('grunt-contrib-watch');
    // Default task(s).
    grunt.registerTask('default', ['express']);

};