var gulp = require('gulp');
var del = require('del');
var sourcemaps = require('gulp-sourcemaps');
var webpack = require('gulp-webpack');

gulp.task('default', ['clean'], function () {
  return gulp.src('js/crashbrowser.js')
    .pipe(webpack( require('./webpack.config.js') ))
    .pipe(gulp.dest('build'));
});

gulp.task('clean', function () {
  return del(['build']);
})