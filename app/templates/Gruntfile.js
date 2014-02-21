"use strict";

module.exports = function (grunt) {

    // Load grunt tasks automatically
    require("load-grunt-tasks")(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require("time-grunt")(grunt);

    // Project configuration object
    var project = grunt.file.readJSON("project.json") || grunt.fatal("project.json not found");

    // Settings for files watcher
    var pages = [ "index", "404" ],
        // Tech for watch
        build_techs = [ "browser.js", "css", "bemhtml", "deps.js", "bemjson.js" ],
        // Paths for watch
        watch_paths = function() {
            return build_techs.map(function(tech) {
               return "*.blocks/**/{,*/}*." + tech;
            }).concat("*.bundles/**/*.bemjson.js");
        };

    // Tasks configuration
    var tasks = {

        project: project,
        pages: pages,

        watch: {
            blocks: {
                files: watch_paths(),
                tasks: [ "default" ]
            },
            gruntfile: {
                files: [ "Gruntfile.js" ]
            }
        },

        bem: {
            options: {
                require: "./node_modules/bem"
            },
            // Build bundles for pages with BEM methodology (bem-tools)
            bundles: {
                method: "make",
                targets: "<%= project.projectBundles %>"
            }
        },

        shell: {
            mkdirs: {
                command: "mkdir -p <%= project.styles %> && mkdir -p <%= project.scripts %>"
            },
            concat_css: {
                command: "cat <%= pages.map( function(page) { return project.projectBundles + '/' + page + '/' + page + '.css' }).join(' ') %> > <%= project.styles %>/pages.css"
            },
            concat_js: {
                command: "cat <%= pages.map( function(page) { return project.projectBundles + '/' + page + '/' + page + '.js' }).join(' ') %> > <%= project.scripts %>/pages.js"
            },
            borschik_csso: {
                command: "node_modules/.bin/borschik -i <%= project.styles %>/pages.css -o <%= project.styles %>/pages.min.css -m <%= project.compress %> -c <%= project.comments %>"
            },
            borschik_uglify: {
                command: "node_modules/.bin/borschik -i <%= project.scripts %>/pages.js -o <%= project.scripts %>/pages.min.js -m <%= project.compress %> -c <%= project.comments %>"
            }
        },

        copy: {
            // Copy html pages to distribution folder
            bundles: {
                files: [{
                    expand: true,
                    flatten: true,
                    filter: "isFile",
                    dest: "<%= project.dist %>",
                    src: "<%= project.projectBundles %>/**/*.html"
                }]
            },
            // Copy assets (fonts, images, favicon, robots.txt and etc)
            assets: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: "<%= project.assets %>/",
                    src: "**",
                    dest: "<%= project.dist %>/"
                }]
            }
        },

        csscomb: {
            dist: {
                options: {
                    config: '.csscomb.json'
                },
                files: {
                    "<%= project.styles %>/pages.min.css": ["<%= project.styles %>/pages.min.css"]
                }
            }
        }
    }

    grunt.initConfig(tasks);

    grunt.registerTask("serve", function(){

        grunt.task.run([
            "watch"
        ]);

    });

    grunt.registerTask("default", [
        "bem:bundles",
        "copy:bundles",
        "copy:assets",
        "shell:mkdirs",
        "shell:concat_css",
        "shell:concat_js",
        "shell:borschik_csso",
        "shell:borschik_uglify"
    ]);
};

