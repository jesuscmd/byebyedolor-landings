const { series, src, dest, watch } = require("gulp");
const browserSync = require("browser-sync").create();
const sass = require("gulp-sass");

const clean = require("gulp-clean");
const del = require("del");
const rename = require("gulp-rename");
const removeHtmlComments = require("gulp-remove-html-comments");
const connect = require("gulp-connect-php");
const concat = require("gulp-concat");
const uglify = require("gulp-uglify");
const pipeline = require("readable-stream").pipeline;
const htmlreplace = require("gulp-html-replace");
const htmlmin = require("gulp-htmlmin");
const foreach = require("gulp-foreach");

const fs = require("fs");
const chalk = require("chalk");
const log = require("fancy-log");

const sourcemaps = require("gulp-sourcemaps");
const twig = require("gulp-twig");

const srcAssets = "./src/landings-assets/";
const distAssets = "./dist/landings-assets/";
const imagemin = require("gulp-imagemin");

const imageminOptions = [
  imagemin.mozjpeg({ quality: 85, progressive: true }),
  imagemin.svgo({
    plugins: [{ removeViewBox: false }, { cleanupIDs: false }],
  }),
];

const landingPages = [
  "artritis",
  "dolor-de-pie",
  "dolor-muscular",
  "dolor-de-espalda",
  "dolor-de-cabeza",
];

function copyGeneralImages(cb) {
  src(`${srcAssets}imgs/**/*.*`)
    .pipe(imagemin(imageminOptions))
    .pipe(dest(`${distAssets}imgs/`))
    .on("end", cb)
    .on("error", cb);
  browserSync.reload();
  return true;
}

function copyJS(cb) {
  src(`${srcAssets}js/**/*.*`)
    .pipe(dest(`${distAssets}js/`))
    .on("end", cb)
    .on("error", cb);
  browserSync.reload();
  return true;
}

function resetDist() {
  return del("dist/**/*", { force: true });
}

function cleanDist(cb) {
  return src("./dist/**/*", { read: false })
    .pipe(clean({ force: true }))
    .on("end", () => {
      log.info(chalk.red("Borrando carpeta dist"));
    })
    .on("error", cb);
}

function compileSass(cb) {
  return (
    src(`src/landings-assets/scss/*.scss`)
      // .pipe(sourcemaps.init())
      .pipe(sass({ outputStyle: "compressed" }).on("error", sass.logError))
      .pipe(rename("main.min.css"))
      // .pipe(sourcemaps.write())
      .pipe(dest(`dist/landings-assets/css`))
      .on("end", () => {
        log.info(chalk.magenta("CSS creado"));
      })
      .on("error", cb)
  );
}

function createLocalCSS(currentLanding, cb) {
  return (
    src(`src/general-scss/*.scss`)
      // .pipe(sourcemaps.init())
      .pipe(sass({ outputStyle: "compressed" }).on("error", sass.logError))
      .pipe(rename("main.min.css"))
      // .pipe(sourcemaps.write())
      .pipe(dest(`dist/${currentLanding}/css`))
      .on("end", () => {
        log.info(chalk.magenta("CSS creado"));
      })
      .on("error", cb)
  );
}

function reload(done) {
  browserSync.reload();
  done();
}

// function fixDistHtml(cb) {
//   return src(`${distAssets}*.html`)
//     .pipe(
//       prettyHtml({
//         indent_size: 1,
//         brace_style: "collapse",
//         indent_with_tabs: true,
//         max_preserve_newlines: 0,
//         break_chained_membedSvgethods: true,
//         preserve_newlines: false,
//       })
//     )
//     .pipe(removeHtmlComments())
//     .pipe(dest("dist"))
//     .on("end", cb)
//     .on("error", cb);
// }

// function fixHtml(cb) {
//   return src("src/**/*.html")
//     .pipe(
//       prettyHtml({
//         indent_size: 1,
//         brace_style: "collapse",
//         indent_with_tabs: true,
//         max_preserve_newlines: 0,
//         break_chained_membedSvgethods: true,
//         preserve_newlines: false,
//       })
//     )
//     .pipe(removeHtmlComments())
//     .pipe(dest("dist"))
//     .on("end", cb)
//     .on("error", cb);
// }

function createLandingHTML(currentLandingPage, cb) {
  return (
    src(`src/${currentLandingPage}/index.twig`)
      .pipe(
        twig({
          data: landingPages[currentLandingPage],
        })
      )
      .pipe(
        htmlreplace({
          js: `../landings-assets/js/bundle.min.js`,
        })
      )
      .pipe(removeHtmlComments())
      // .pipe(
      //   prettyHtml({
      //     indent_size: 1,
      //     brace_style: "collapse",
      //     indent_with_tabs: true,
      //     max_preserve_newlines: 0,
      //     break_chained_membedSvgethods: true,
      //     preserve_newlines: false,
      //   })
      // )
      .pipe(htmlmin({ collapseWhitespace: true }))

      .pipe(dest(`dist/${currentLandingPage}/`))
      .on("end", cb)
      .on("error", cb)
  );
}

function copyLandingImages(currentLandingPage, cb) {
  log(chalk.yellowBright(currentLandingPage));
  src(`src/${currentLandingPage}/imgs/**/*.*`)
    .pipe(imagemin(imageminOptions))
    .pipe(dest(`dist/${currentLandingPage}/imgs/`))
    .on("end", cb)
    .on("error", cb);
  return true;
}

function processLandingPage(cb, landing) {
  // log.info(chalk.red(landing));

  if (!fs.existsSync(`dist/${landing}`)) {
    fs.mkdirSync(`dist/${landing}`);
    log.info(chalk.yellow(`📁 Landing folder created: ${landing}`));
  }
  // copyLandingImages(landing, cb);
  // createLandingHTML(landing, cb);
  // createLocalCSS(landing, cb);
  cb();
}

// function processLandingPages(cb) {
//   return src("src/**/index.twig")
//     .pipe(
//       foreach(function (stream, file) {
//         const path = file.path.split("/");
//         const currentPath = path[path.length - 2];
//         return stream.pipe(processLandingPage(cb, currentPath));
//       })
//     )
//     .pipe(dest("dist"))
//     .on("end", cb)
//     .on("error", cb);
// }

function createLandingPages(cb) {
  landingPages.forEach((landing) => {
    log.info(chalk.red(landing));

    if (!fs.existsSync(`dist/${landing}`)) {
      fs.mkdirSync(`dist/${landing}`);
      log.info(chalk.yellow(`📁 Landing folder created: ${landing}`));
    }
    copyLandingImages(landing, cb);
    createLandingHTML(landing, cb);
    createLocalCSS(landing, cb);
  });
  cb();
}

function bundleJs(cb) {
  return pipeline(
    src([
      `${srcAssets}js/lib/gsap3/gsap.min.js`,
      `${srcAssets}js/lib/scrollmagic/ScrollMagic.js`,
      `${srcAssets}js/lib/scrollmagic/plugins/animation.gsap.js`,
      `${srcAssets}js/main.js`,
    ]),
    concat("bundle.min.js"),
    uglify(),
    dest(`${distAssets}js`)
  );
}

function serve() {
  connect.server({ base: "./dist/", port: 8010, keepalive: true }, function () {
    browserSync.init({
      server: {
        baseDir: "./dist/",
      },
    });
  });

  watch(`${srcAssets}scss/*.scss`, compileSass);

  watch(
    [`src/**/*.scss`, `!${srcAssets}scss/*.scss`],
    series(createLandingPages)
  );

  watch(`src/data.json`, series(createLandingPages));

  watch(`src/**/*.twig`, series(createLandingPages));

  watch(`${srcAssets}imgs/**/*.*`, copyGeneralImages);
  watch(`${srcAssets}**/*.js`, copyJS);

  watch("dist/**/*.html", reload);
  watch("dist/**/*.css", reload);
  watch("dist/**/*.js", reload);
}

// exports.dist = series(
//   resetDist,
//   cleanDist,
//   compileSass,
//   // copyJS,
//   // copyPHP,
//   // copyOthers,
//   parallel(copyGeneralImages, copyFonts),
//   // fixHtml
// );

exports.serve = series(
  resetDist,
  cleanDist,
  compileSass,
  // copyJS,
  bundleJs,
  // copyPHP,
  copyGeneralImages,
  // copyImages,
  // copyOthers, //veamos si es necesario
  // replaceBundles,
  // fixHtml,
  createLandingPages,
  // processLandingPages,
  // changeCSSName,

  serve
);
