module.exports = (grunt) ->
  grunt.loadNpmTasks "grunt-contrib-uglify"
  grunt.initConfig
    pkg: grunt.file.readJSON "package.json"
    uglify: 
      options: 
        banner: '/*! <%= pkg.title || pkg.name %> <%= pkg.version %>, <%= grunt.template.today("yyyy-mm-dd") %>\n' +
                    '<%= pkg.homepage ? " *  " + pkg.homepage + "\\n" : "" %>' +
                    ' *  Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>\n' +
                    ' *  Licensed under the <%= pkg.license %> License */\n'
      build:
        files: "topbar.min.js": ["topbar.js"]
  grunt.registerTask "default", "uglify"