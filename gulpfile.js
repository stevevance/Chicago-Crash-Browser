var gulp = require('gulp');
var del = require('del');
var sourcemaps = require('gulp-sourcemaps');
var concatCss = require('gulp-concat-css');
var webpack = require('webpack-stream');
var rsync = require('rsync-slim');
var secrets = require('./secrets.json');

const outputFolder = 'dist';

gulp.task('default', ['clean'], function () {
  gulp.src([
      'bower_components/leaflet-dist/leaflet.css',
      'bower_components/leaflet.markerclusterer/dist/*.css',
      'bower_components/leaflet-locatecontrol/src/*.css',
      'bower_components/leaflet.draw/dist/*.css',
      'node_modules/select2/dist/css/select2.min.css',
      'stylesheets/index.css']
    )
    .pipe(concatCss('bundle.css'))
    .pipe(gulp.dest(outputFolder));

  gulp.src('images/**/*')
    .pipe(gulp.dest(outputFolder + '/images'));

  gulp.src('api/**/*')
    .pipe(gulp.dest(outputFolder + '/api'));

  gulp.src(['bower_components/**/leaflet-locatecontrol/src/images/locate.png',
    'bower_components/**/leaflet.draw/dist/images/spritesheet-2x.png'])
    .pipe(gulp.dest(outputFolder))

  gulp.src(['index.html',
    'api2.php',
    'staticmap.php'])
    .pipe(gulp.dest(outputFolder));

  return gulp.src('js/crashbrowser.js')
    .pipe(webpack( require('./webpack.config.js') ))
    .pipe(gulp.dest(outputFolder));
});

gulp.task('clean', function () {
  return del([outputFolder]);
});

gulp.task('deploy', ['default'], function () {
  rsync({
    src: outputFolder + '/',
    dest: secrets.username + '@' + secrets.hostname + ':/var/www/chicagocrashes/htdocs',
    options: '-rvhcz --delete --progress'
  }, function (err) {
    console.error(err);
  });
});