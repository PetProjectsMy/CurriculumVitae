const browserSync = require("browser-sync").create();

// import { deleteAsync } from "del";
const copy = require("gulp-copy");
const beautify = require("gulp-jsbeautifier");
const rename = require("gulp-rename");
const nunjucksRender = require("gulp-nunjucks-render");

const { dest, parallel, series, src, watch } = require("gulp");
const scss = require("gulp-sass")(require("sass"));

function buildStyles() {
  return src("styles/**/*.scss")
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
    .pipe(rename("index.html"))
    .pipe(
      beautify({
        indent_size: 2,
        preserve_newlines: false,
        end_with_newline: true,
      })
    )
    .pipe(dest("build/"));
}

// function clean() {
//   return deleteAsync(["build/"]);
// }

function copyAssets() {
  return src("assets/*").pipe(copy("build/"));
}

function serve() {
  browserSync.init({
    open: false,
    server: {
      injectChanges: true,
      baseDir: "./build",
    },
  });

  watch(["styles/**/*.scss"], buildStyles);
  watch(["html/**/*.njk"], buildHTML);
  watch(["build/*.html"]).on("change", browserSync.reload);
}

exports.default = series(
  // clean,
  parallel(buildStyles, buildHTML, copyAssets),
  serve
);
