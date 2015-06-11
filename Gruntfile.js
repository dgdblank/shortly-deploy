module.exports = function(grunt) {

  var clientFiles = [
        'public/client/*.js'
      ];

  //declare order of library files so dependencies in app get loaded properly
  var libraryFiles = [
    'public/lib/jquery.js',
    'public/lib/underscore.js',
    'public/lib/backbone.js',
    'public/lib/handlebars.js'
  ];

  var serverFiles = [
      'app/*.js',
      'app/**/*.js',
      'lib/*.js'
      ];

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';'
      },
      clientDist: {
        src: clientFiles,
        dest: 'public/dist/<%= pkg.name %>.js'
      },
      libDist: {
        src: libraryFiles,
        dest: 'public/dist/library.js'
      }
    },

    clean: ['public/dist/*.*'],

    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/**/*.js']
      }
    },

    nodemon: {
      dev: {
        script: 'server.js'
      }
    },

    uglify: {
      options: {
        // the banner is inserted at the top of the output
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n',
        mangle: false
      },
      dist: {
        files: {
          'public/dist/<%= pkg.name %>.min.js': ['<%= concat.clientDist.dest %>'],
          'public/dist/library.min.js' : ['<%= concat.libDist.dest %>']
        }
      }
    },

    jshint: {
      files: [clientFiles, serverFiles],
      options: {
        force: 'true',
        jshintrc: '.jshintrc',
        ignores: [
          'public/lib/**/*.js',
          'public/dist/**/*.js'
        ]
      }
    },

    cssmin: {
      target: {
         files: [{
           src: ['public/*.css', '!*.min.css'],
           dest: 'public/dist/styles.min.css'
           // ext: '.min.css'
         }]
       }
    },

    watch: {
      scripts: {
        files: [
          'public/client/**/*.js',
          'public/lib/**/*.js',
        ],
        tasks: [
          'build'
        ]
      },
      css: {
        files: 'public/*.css',
        tasks: ['cssmin']
      }
    },

    shell: {
      prodServer: {
        command: [
        'azure site scale mode standard shortayy',
        'git push azure master',
        'azure site browse',
        'azure site scale mode free shortayy'
        ].join('&&'),
        options: {
          stdout: true
        }
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-nodemon');

  grunt.registerTask('server-dev', function (target) {
    // Running nodejs in a different process and displaying output on the main console
    var nodemon = grunt.util.spawn({
         cmd: 'grunt',
         grunt: true,
         args: 'nodemon'
    });
    nodemon.stdout.pipe(process.stdout);
    nodemon.stderr.pipe(process.stderr);

    grunt.task.run([ 'watch' ]);
  });

  ////////////////////////////////////////////////////
  // Main grunt tasks
  ////////////////////////////////////////////////////

  // grunt.registerTask('clean', ['clean']);

  grunt.registerTask('prod', [
    'shell:prodServer'
    ]);

  grunt.registerTask('test', [
    'mochaTest'
  ]);

  grunt.registerTask('build', [
    'clean', 'jshint', 'concat', 'uglify', 'cssmin'
  ]);

  grunt.registerTask('upload', function(n) {
    if(grunt.option('prod')) {
      grunt.task.run([ 'prod' ]);
    } else {
      grunt.task.run([ 'server-dev' ]);
    }
  });

  grunt.registerTask('deploy', [
    // add your deploy tasks here
    'test', 'build', 'upload'
  ]);


};
