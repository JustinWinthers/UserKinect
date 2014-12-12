module.exports = function(grunt) {

    // load all grunt tasks dynamically
    require('load-grunt-tasks')(grunt);

    // measures the time each task takes
    require('time-grunt')(grunt);


    grunt.initConfig({
        pkg: require('./package.json'),

        // run JS hint on javascript files
        jshint: {
            jiraConnect: {
                src: ['dist/jiraConnect.js']
            }
        },


        // compress all files
        imagemin: {
            dynamic: {
                files: [{
                    expand: true,                  // Enable dynamic expansion
                    cwd: 'www/',                   // Src matches are relative to this path
                    src: ['**.{png,jpg,gif}'],   // Actual patterns to match
                    dest: 'www/images/'            // Destination path prefix
                }]
            }
        },


        // uses http://caniuse.com to perform auto previxing
        autoprefixer: {
            options: {
                browsers: ['last 4 versions', 'ie 8', 'ie 9', 'Opera 12.1', 'Safari 5.1']
            },
            dist: {
                src: 'www/css/style.css',
                dest: 'www/css/style-prefixed.css'
            }
        },


        // run watch command on certain tasks
        watch: {
            mochaTests: {
                files: ['tests/*'],
                options: {
                    livereload: true
                }
            },
            lintTheJS: {
                files: ['dist/jiraConnect.js'],
                tasks: ['jshint:jiraConnect'],
                options: {
                    livereload: true
                }
            }
        },


        // monitor node server changes
        nodemon: {
            dev: {
                script: 'server.js'
            }
        },


        // run concurrent tasks
        concurrent: {
            dev: {
                tasks:['watch', 'nodemon'],
                options: {
                    logConcurrentOutput: true
                }
            },
            build: ['jshint', 'imagemin', 'autoprefixer']
        }

    });

    // Default task(s).
    grunt.registerTask('build', ['concurrent:build']);

    //tasks to run while developing
    grunt.registerTask('dev', ['concurrent:dev']);


};