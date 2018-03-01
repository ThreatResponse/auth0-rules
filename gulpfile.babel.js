'use strict';
import gulp from 'gulp';
import babel from 'babel';
import flatmap from 'gulp-flatmap';
import fs from 'fs';
import path from 'path';

let environment = process.env.NODE_ENV || 'development';

const auth0Bundler = require('auth0-bundler');

const config = {
  baseUrl: 'https://ephemeralsystems.auth0.com'
}

const dirs = {
  src: 'rules-es',
  dest: 'dist'
};

gulp.task('copy-auth0-json', () => {
  return gulp.src(dirs.src + '/*.json')
    .pipe(gulp.dest(dirs.dest));
});

gulp.task('babel-rules', () => {
  return gulp.src(dirs.src + '/*.js')
  .pipe(flatmap(function(stream, file){
    console.log('Building rule: ' + path.basename(file.path))
    auth0Bundler
      .bundleRule(config, file.path)
      .then((results, filename) => {
        var filename = path.basename(file.path);
        fs.writeFile('dist/' + filename, results, 'utf-8');
      })
    return stream
  }))
  //.pipe(gulp.dest(config.dest))
});

let build = gulp.series('copy-auth0-json', 'babel-rules');
gulp.task('default', build)
