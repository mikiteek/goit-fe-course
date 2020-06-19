const projectFolder = "build";
const sourseFolder = "src";

const path = {
  build: {
    html: projectFolder + "/",
    css: projectFolder + "/css/",
    img: projectFolder + "/img/",
  },
  src: {
    html: [sourseFolder + "/*.html", "!" + sourseFolder + "/_*.html"], // читаем html все, исключаем с нижним подчеркиванием для построения в результат
    css: sourseFolder + "/scss/style.scss",
    img: sourseFolder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
  },
  watch: {
    html: sourseFolder + "/**/*.html",
    css: sourseFolder + "/scss/**/*.scss",
    img: sourseFolder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
  },
  clean: "./" + projectFolder + "/",
};

const { src, dest } = require("gulp"),
  gulp = require("gulp"),
  brsync = require("browser-sync").create(),
  fileinclude = require("gulp-file-include");

function browserSync(params) {
  brsync.init({
    server: {
      baseDir: "./" + projectFolder + "/",
    },
    port: 3000,
    notify: false,
  });
}

function html() {
  return src(path.src.html)
    .pipe(fileinclude())
    .pipe(dest(path.build.html)) //путь к папке результата
    .pipe(brsync.stream()); //обновим браузер вроде
}

function watchFiles(params) {
  gulp.watch([path.watch.html], html);
}

const build = gulp.series(html);
// сценарий выполнения
const watch = gulp.parallel(build, watchFiles, browserSync);

exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;
