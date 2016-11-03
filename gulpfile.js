var gulp = require('gulp');
var path = require('path');
var uglify = require('gulp-uglify');
var pump = require('pump');
var concat = require('gulp-concat');

gulp.task('js', function (cb) {
	pump([
		gulp.src([
			'./bower_components/js-md5/build/md5.min.js',
			'./bower_components/async/dist/async.min.js',
			'./bower_components/jquery/dist/jquery.min.js',
			'./src/difflib.js',
			'./src/diffview.js',
			'./src/jsBotClient.js'
		]),
		//uglify(),
		concat('jsBotClient.min.js'),
		gulp.dest('./')
	],cb);
});

gulp.task('default', ['js'], function() {});

gulp.task('watch', function() {
	var watcher = gulp.watch('./src/**.js',['js']);
	watcher.on('change', function(event) {
		console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
	});
});
