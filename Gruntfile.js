/**
 * Created by vivaldi on 23/03/2015.
 */

'use strict';
module.exports = function(grunt) {
	require('time-grunt')(grunt);
	require('load-grunt-tasks')(grunt);
	require('jit-grunt')(grunt, {
		injector: 'grunt-asset-injector'
	});
	var ports = {
		devServ: 5000,
		prodServ: 5001,
		liveReload: 35729
	};
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		paths: {
			dev: 'react-client',
			dist: 'dist'
		},
		watch: {
			injectSass: {
				files: [
					'<%= paths.dev %>/styles/**/*.scss',
					'<%= paths.dev %>/bower_components/**/*.scss'
				],
				tasks: ['injector:sass']
			},
			sass: {
				files: [
					'<%= paths.dev %>/styles/**/*.scss',
					'<%= paths.dev %>/bower_components/**/*.{scss,sass}'
				],
				tasks: ['sass', 'autoprefixer']
			},
			injectBowerComponents: {
				files: [
					'bower.json'
				],
				tasks: ['wiredep']
			},
			gruntfile: {
				files: ['Gruntfile.js']
			}
		},
		connect: {
			options: {
				port: ports.devServ,
				livereload: ports.liveReload,
				// change this to '0.0.0.0' to access the server from outside
				hostname: 'localhost'
			},
			livereload: {
				options: {
					open: true,
					middleware: function(connect) {
						return [
							connect.static('.tmp'),
							connect().use(
								'/bower_components',
								connect.static('dev/bower_components')
							),
							connect.static('dev')
						];
					}
				}
			},
			dist: {
				options: {
					port: ports.prodServ,
					open: true,
					base: [
						'<%= paths.dist %>'
					]
				}
			}
		},
		clean: {
			dist: {
				files: [
					{
						dot: true,
						src: [
							'<%= paths.dist %>/*',
							// Running Jekyll also cleans the target directory. Exclude any
							// non-standard `keep_files` here (e.g., the generated files
							// directory from Jekyll Picture Tag).
							'!<%= paths.dist %>/.git*'
						]
					}
				]
			},
			server: [
				'.tmp'
			]
		},
		sass: {
			options: {},
			dist: {
				files: [
					{
						expand: true,
						cwd: '<%= paths.dev %>/styles',
						src: 'main.scss',
						dest: '.tmp/styles',
						ext: '.css'
					}
				]
			}
		},
		autoprefixer: {
			options: {
				browsers: ['last 2 versions']
			},
			dist: {
				files: [
					{
						expand: true,
						cwd: '.tmp',
						src: '**/*.css',
						dest: '.tmp'
					}
				]
			}
		},
		concurrent: {
			server: [
				'sass:dist'
			],


			// TODO: dist will include image optimization eventually
			dist: [
				'sass'
			]
		},

		// Automatically inject Bower components into the app
		wiredep: {
			target: {
				src: '<%= paths.dev %>/index.html',
				ignorePath: '<%= paths.dev %>/',
				exclude: [
					/bootstrap-sass-official/,
					/bootstrap.js/,
					'/json3/',
					'/es5-shim/',
					/bootstrap.css/,
					/font-awesome.css/,
					/cryptojslib/,
					/angular-mocks/
				]
			}
		},
		injector: {
			options: {},

			// Inject component scss into app.scss
			sass: {
				options: {
					transform: function(filePath) {
						filePath = filePath.replace('/react-client/styles/', '');
						return '@import \'' + filePath + '\';';
					},
					starttag: '// injector',
					endtag: '// endinjector'
				},
				files: {
					'<%= paths.dev %>/styles/main.scss': [
						'<%= paths.dev %>/styles/**/*.{scss,sass}',
						//'!cssframeworkdoc/styles/**/*.scss',
						'!<%= paths.dev %>/styles/main.{scss,sass}'
					]
				}
			}
		},

		// Copies remaining files to places other tasks can use
		copy: {
			dist: {
				files: [
					{
						expand: true,
						dot: true,
						cwd: '<%= paths.dev %>',
						dest: '<%= paths.dist %>/client',
						src: [
							'*.{ico,png,txt}',
							'.htaccess',
							'assets/images/{,*/}*.{webp}',
							'fonts/**/*',
							'assets/**/*.{svg,png}',
							'index.html',
							'js/*.swf',
							'!bower_components/**/*'
						]
					},
					{
						expand: true,
						cwd: '.tmp/images',
						dest: '<%= paths.dist %>/assets/images',
						src: ['generated/*']
					},
					{
						expand: true,
						cwd: 'server',
						dest: '<%= paths.dist %>/server',
						src: ['**/*.js', '**/*.json', '**/*.jade']
					},
					{
						expand: true,
						cwd: './',
						dest: '<%= paths.dist %>',
						src: ['package.json']
					}
				]
			},
			//styles: {
			//	expand: true,
			//	cwd: '<%= paths.dev %>',
			//	dest: '.tmp/',
			//	src: ['{app,components}/**/*.css']
			//},
			fonts: {
				expand: true,
				flatten: true,
				filter: 'isFile',
				cwd: 'bower_components',
				dest: '<%= paths.dev %>/fonts',
				src: ['**/*.{eot,svg,woff,woff2}']
			},
			zeroclipboard: {
				expand: true,
				flatten: true,
				filter: 'isFile',
				cwd: 'node_modules/zeroclipboard/dist',
				dest: '<%= paths.dev %>/js',
				src: ['ZeroClipboard.swf']

			}
		},
		// Renames files for browser caching purposes
		rev: {
			dist: {
				files: {
					src: [
						'<%= paths.dist %>/client/{,*/}*.js',
						'<%= paths.dist %>/client/{,*/}*.css',
						'<%= paths.dist %>/client/assets/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
						'<%= paths.dist %>/client/assets/fonts/*'
					]
				}
			}
		},
		useminPrepare: {
			html: '<%= paths.dev %>/index.html',
			options: {
				dest: '<%= paths.dist %>/client/'
			}
		},
		// Performs rewrites based on filerev and the useminPrepare configuration
		usemin: {
			html: ['<%= paths.dist %>/client/**/*.html'],
			css: ['<%= paths.dist %>/client/**/*.css'],
			options: {
				assetsDirs: [
					'<%= paths.dist %>/client/**/'
				]
			}
		},
		dumpRev: {
			dist: {
				options: {
					strip: '<%= paths.dist %>',
					destination: '<%= paths.dist %>/server/config/assets.config.json'
				},
				src: [
					'<%= paths.dist %>/client/**/*.css'
				]
			}
		},
		browserify: {
			options: {
				transform: ['reactify', 'envify']
			},
			dist: {
				files: {
					'.tmp/js/bundle.js': ['<%= paths.dev %>/js/**/*.js', '!<%= paths.dev %>/js/bundle.js', '!<%= paths.dev %>/js/**/__tests__/**/*.js', '!<%= paths.dev %>/js/bundle.min.js']
				}
			},
			watch: {
				files: {
					'.tmp/js/bundle.js': ['<%= paths.dev %>/js/**/*.js', '!<%= paths.dev %>/js/bundle.js', '!<%= paths.dev %>/js/**/__tests__/**/*.js', '!<%= paths.dev %>/js/bundle.min.js']
				},
				options: {
					browserifyOptions: {
						debug: true
					},
					watchifyOptions: {
						debug: true,
						verbose: true
					},
					watch: true
				}
			}
		},
		mochaTest: {
			specs: {
				options: {
					ui: 'bdd',
					reporter: 'spec',
					require: ['./test/helpers/chai']
				},
				src: ['./test/spec/**/*.test.js']
			}
		}
	});

	grunt.registerTask('inject', [
		'injector',
		'wiredep'
	]);

	grunt.registerTask('b', [
		'inject',
		'concurrent:server',
		'newer:copy:fonts',
		'autoprefixer'
	]);

	grunt.registerTask('serve', [
		'clean:server',
		'injector:sass',
		'concurrent:server',
		'injector',
		'wiredep',
		'autoprefixer',
		'connect:livereload',
		'watch'
	]);

	grunt.registerMultiTask('dumpRev', 'Dumps reved file locations into a config file', function() {
		var options = this.options();
		var out = [];
		this.files.forEach(function(pair) {
			pair.src.forEach(function(file) {
				out.push(file.replace(options.strip + '/', ''));
			});
		});

		grunt.file.write(options.destination, JSON.stringify(out));
	});

	grunt.registerTask('go', [
		'dumpRev'
	]);

	grunt.registerTask('build', [
		'clean',
		'injector:sass',
		'concurrent:dist',
		'injector',
		'wiredep',
		'useminPrepare',
		'autoprefixer',
		'browserify:dist',
		'concat',
		'cssmin',
		'copy:zeroclipboard',
		'copy:dist',
		'uglify',
		'rev',
		'usemin',
		'dumpRev:dist'
	]);

	grunt.registerTask('build-assets', [
		'clean:server',
		'wiredep',
		'copy:fonts',
		'injector:sass',
		'concurrent:server',
		'autoprefixer',
		'browserify:watch'
	]);

	grunt.registerTask('watchify', [
		'build-assets',
		'watch'
	]);
};