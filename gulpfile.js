'use strict';
var gulp 			= require('gulp');
var inject 			= require('gulp-inject');
var concat 			= require('gulp-concat');
var filter 			= require('gulp-filter');
var plumber 		= require('gulp-plumber');
var notify 			= require('gulp-notify');
var uglify 			= require('gulp-uglify');
var cleanCSS 		= require('gulp-clean-css');
var browserify 		= require('gulp-browserify');
var flatten 		= require('gulp-flatten');
var sass 			= require('gulp-sass');
var mainBowerFiles 	= require('gulp-main-bower-files');

gulp.task('default', function() {

});

gulp.task('app', function() {

        var filters = {
                "css": filter('**/*.css', {restore: true}),
                "sass": filter('**/*.scss', {restore: true}),
                "js": filter('**/*.js', {restore: true})
        }

        return gulp.src('./src/**/*')
                .pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
                .pipe(filters.sass)
                .pipe(sass())
                .pipe(filters.sass.restore)
                .pipe(filters.css)
                .pipe(concat('app.css'))
                .pipe(cleanCSS())
                .pipe(gulp.dest('./styles'))
                .pipe(filters.css.restore)

                .pipe(filters.js)
                .pipe(concat('app.js'))
                .pipe(uglify())
                .pipe(gulp.dest('./scripts'))
                .pipe(filters.js.restore);
});

gulp.task('vendor', function() {
	var filters = {
		'css': filter('**/*.css', {restore: true}),
		'sass': filter(['**/*.scss', '**/*.sass'], {restore: true}),
		'js': filter('**/*.js', {restore: true})
	}

	return gulp.src('bower.json')
		.pipe(mainBowerFiles())
		.pipe(plumber({errorHandler: notify.onError("Error: <%= error.message %>")}))
		.pipe(filters.sass)
		.pipe(sass())
		.pipe(filters.sass.restore)
		.pipe(filters.css)
		.pipe(concat('vendor.css'))
		.pipe(cleanCSS())
		.pipe(gulp.dest('./styles'))
		.pipe(filters.css.restore)
		.pipe(filters.js)
		.pipe(concat('vendor.js'))
		.pipe(uglify())
		.pipe(gulp.dest('./scripts'))
		.pipe(filters.js.restore);
});

gulp.task('watch', ['app'], function() {
        gulp.watch('./src/**/*', ['app']);
});
