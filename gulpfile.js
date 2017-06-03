var gulp = require('gulp');
var gulpWebpack = require('webpack-stream');
var webpack = require('webpack');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var dest = 'dist/';
var config = require('./webpack.config.js');

gulp.task('default', ['webpack', 'copy-html'], function() {});

gulp.task('webpack', function() {
  return gulp.src('src/index.js').pipe(gulpWebpack(config, webpack)).pipe(gulp.dest(dest));
});

gulp.task('copy-html', function() {
  return gulp.src('src/index.html').pipe(gulp.dest(dest));
});
