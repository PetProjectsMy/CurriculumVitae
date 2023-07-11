import _browserSync from "browser-sync";
import { deleteAsync } from "del";
import gulp from "gulp";
import copy from "gulp-copy";
import beautify from "gulp-jsbeautifier";
import nunjucksRender from "gulp-nunjucks-render";
import gulpSass from "gulp-sass";
import * as sass from "sass";

const { dest, parallel, series, src, watch } = gulp;
const scss = gulpSass(sass);
const browserSync = _browserSync.create();

function buildStyles() {
  return src("styles/styles.scss")
    .pipe(scss())
    .on("error", scss.logError)
    .pipe(dest("build/"))
    .pipe(browserSync.stream());
}

function buildHTML() {
  return src("html/templates/cv.njk")
    .pipe(
      nunjucksRender({
        path: "html/templates",
        envOptions: {
          trimBlocks: true,
        },
      })
    )
    .pipe(
      beautify({
        indent_size: 2,
        preserve_newlines: false,
        end_with_newline: true,
      })
    )
    .pipe(dest("build/"));
}

function clean() {
  console.log(`CLEAN OLD BUILD`);
  return deleteAsync(["build/"]);
}

function copyAssets() {
  return src("assets/*").pipe(copy("build/"));
}

function serve() {
  browserSync.init({
    open: false,
    server: {
      injectChanges: true,
      baseDir: "./build",
      index: "cv.html",
    },
  });

  watch(["styles/**/*.scss"], buildStyles);
  watch(["html/**/*.njk"], buildHTML);
  watch(["build/*.html"]).on("change", browserSync.reload);
}

export default series(
  clean,
  parallel(buildStyles, buildHTML, copyAssets),
  serve
);
