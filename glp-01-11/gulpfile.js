const projectFolder = "dist";
const sourseFolder = "src";

const path = {
  build: {
    html: projectFolder + "/",
    css: projectFolder + "/css/",
    js: projectFolder + "/js/",
    img: projectFolder + "/img/",
  },
  src: {
    html: [sourseFolder + "/*.html", "!" + sourseFolder + "/_*.html"], // читаем html все, исключаем с нижним подчеркиванием для построения в результат
    css: sourseFolder + "/scss/style.scss",
    js: sourseFolder + "/js/script.js",
    img: sourseFolder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
  },
  watch: {
    html: sourseFolder + "/**/*.html", // everything subdirs and watch all html-files
    css: sourseFolder + "/scss/**/*.scss",
    img: sourseFolder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
  },
  clean: "./" + projectFolder + "/",
};

const { src, dest } = require("gulp"),
  gulp = require("gulp"),
  brsync = require("browser-sync").create(),
  // work with different files and include to one html, build to one html
  fileinclude = require("gulp-file-include"),
  del = require("del");

function browserSync(params) {
  brsync.init({
    server: {
      baseDir: "./" + projectFolder + "/",
    },
    port: 3000,
    notify: false, //turn off plagin notify
  });
}
//Function for work with html-files
function html() {
  return src(path.src.html)
    .pipe(fileinclude())
    .pipe(dest(path.build.html)) //путь к папке результата
    .pipe(brsync.stream()); //обновим браузер вроде
}



// for live watching of html-partials
function watchFiles(params) {
  gulp.watch([path.watch.html], html);
}
// deteting 'dist' forder before build project, and create new 'dist' folder
function clean(params) {
  return del(path.clean);
}

const build = gulp.series(clean, html);
// сценарий выполнения
const watch = gulp.parallel(build, watchFiles, browserSync);

exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;
