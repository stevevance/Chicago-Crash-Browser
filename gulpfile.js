var gulp = require('gulp');
var del = require('del');
var sourcemaps = require('gulp-sourcemaps');
var concatCss = require('gulp-concat-css');
var webpack = require('gulp-webpack');

const outputFolder = 'dist';

gulp.task('default', ['clean'], function () {
  gulp.src([
      'bower_components/leaflet-dist/leaflet.css',
      'bower_components/leaflet.markerclusterer/dist/*.css',
      'bower_components/leaflet-locatecontrol/src/*.css',
      'bower_components/leaflet.draw/dist/*.css',
      'stylesheets/index.css']
    )
    .pipe(concatCss('bundle.css'))
    .pipe(gulp.dest(outputFolder));

  gulp.src('images/**/*')
    .pipe(gulp.dest(outputFolder + '/images'));

  gulp.src(['bower_components/**/leaflet-locatecontrol/src/images/locate.png',
    'bower_components/**/leaflet.draw/dist/images/spritesheet-2x.png'])
    .pipe(gulp.dest(outputFolder))

  gulp.src('index.html')
    .pipe(gulp.dest(outputFolder));

  return gulp.src('js/crashbrowser.js')
    .pipe(webpack( require('./webpack.config.js') ))
    .pipe(gulp.dest(outputFolder));
});

gulp.task('clean', function () {
  return del([outputFolder]);
})