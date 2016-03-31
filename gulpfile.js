var gulp = require('gulp');
var webpack = require('webpack-stream');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

var dest = 'dist/';
var destFonts = dest + 'fonts/';


gulp.task('default', ['webpack', 'copy-html', 'copy-fonts'], function () {

});

gulp.task('webpack', function () {

  return gulp.src('src/index.js')
             .pipe(webpack(require('./webpack.config.js')))
             .pipe(gulp.dest(dest));

});

gulp.task('copy-html', function () {

  return gulp.src('src/index.html')
             .pipe(gulp.dest(dest));

});

gulp.task('copy-fonts', function() {

  return gulp.src('src/media/fonts/**/*')
             .pipe(gulp.dest(destFonts));

});