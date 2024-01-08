/* eslint-disable @typescript-eslint/no-var-requires */
var path = require('path');
var gulp = require('gulp');
var clean = require('gulp-clean');
var merge = require('merge-stream');
var fs = require('fs');

const DIST = path.resolve(__dirname, 'dist');
const DIST_NEW = path.resolve(__dirname, 'dist-new');

// 清除 dist 目录
gulp.task('clean', () => {
  // 判断 dist 目录是否存在
  if (!fs.existsSync(DIST)) {
    fs.mkdirSync(DIST);
  }
  return gulp.src(DIST, { read: false }).pipe(clean());
});

// 清除 dist-new 目录
gulp.task('cleanNew', () => {
  // 判断 dist-new 目录是否存在
  if (!fs.existsSync(DIST_NEW)) {
    fs.mkdirSync(DIST_NEW);
  }
  return gulp.src(DIST_NEW, { read: false }).pipe(clean());
});

// 复制dist及文件到 dist-new 目录
gulp.task('copy', () => {
  return merge([
    gulp
      .src([
        'package.json',
        'package-lock.json',
        'pnpm-lock.yaml',
        '.env.development',
        '.env.production',
        '.npmrc',
      ])
      .pipe(gulp.dest(DIST_NEW)),
    gulp.src(['dist/**/*']).pipe(gulp.dest(DIST_NEW + '/dist')),
  ]);
});

gulp.task('default', gulp.series('cleanNew', 'copy'));
