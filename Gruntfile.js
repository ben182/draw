module.exports = function (grunt) {
    
    grunt.initConfig({
        watch: {
            sass: {
                files: ['assets/**/*.sass'],
                tasks: ['sass'],
                options: {
                    spawn: false,
                },
            },
            js: {
                files: ['assets/**/*.js'],
                tasks: ['babel'],
                options: {
                    spawn: false,
                },
            },
        },
        sass: {
            options: {
                sourceMap: true,
                presets: ['env', 'stage-2'],
                plugins: ['transform-runtime']
            },
            dist: {
                files: {
                    'dist/css/app.css': 'assets/sass/app.sass'
                }
            }
        },
        babel: {
            options: {
                sourceMap: true
            },
            dist: {
                files: {
                    "dist/js/app.js": "assets/js/app.js"
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-babel');

    grunt.registerTask('default', ['watch']);

};