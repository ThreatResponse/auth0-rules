'use strict';
import gulp from 'gulp';
import babel from 'gulp-babel';
import flatmap from 'gulp-flatmap';
import fs from 'fs';
import mocha from 'gulp-mocha'
import path from 'path';
import gutil from 'gulp-util'

let environment = process.env.NODE_ENV || 'development';

const auth0Bundler = require('auth0-bundler');

const config = {
  baseUrl: 'https://ephemeralsystems.auth0.com'
}

const dirs = {
  src: 'rules',
  dest: 'dist'
};

gulp.task('copy-auth0-json', () => {
  return gulp.src(dirs.src + '/*.json')
    .pipe(gulp.dest(dirs.dest));
});

gulp.task('babel-rules', () => {
  return gulp.src(dirs.src + '/*.js')
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(flatmap((stream, file) => {
      console.log('Building rule: ' + path.basename(file.path))
      auth0Bundler
        .bundleRule(config, file.path)
        .then((results, filename) => {
          fs.writeFile(`dist/${path.basename(file.path)}`, results, 'utf-8');
        })
      return stream
    }))
})

gulp.task('mocha', () => {
  return gulp.src(['test/*.js'])
    .pipe(mocha({require: 'babel-register'}))
    // .on('error', gutil.log)
})

const build = gulp.series('copy-auth0-json', 'babel-rules');

gulp.task('watch', () => {
  gulp.watch(['rules/*.*', 'common/*.js', 'test/*.js', 'test/**/*.*'], gulp.series('copy-auth0-json', 'babel-rules', 'mocha'));
})

gulp.task('default', build)
