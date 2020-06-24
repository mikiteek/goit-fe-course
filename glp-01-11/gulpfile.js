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
    js: sourseFolder + "/js/**/*.js",
    img: sourseFolder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
  },
  clean: "./" + projectFolder + "/",
};

const { src, dest } = require("gulp"),
  gulp = require("gulp"),
  brsync = require("browser-sync").create(),// browser live
  fileinclude = require("gulp-file-include"),// work with different files and include to one html, build to one html
  del = require("del"), // deteting 'dist' forder before build project
  scss = require("gulp-sass"),
  autoprefixer = require("gulp-autoprefixer"),
  groupMedia = require("gulp-group-css-media-queries"),
  cleanCss = require("gulp-clean-css"), // compress css
  rename = require("gulp-rename"), // rename extname to .min.css
  uglify = require("gulp-uglify-es").default(),
  imageMin = require("gulp-imagemin"), // shrink and optimization image
  webp = require("gulp-webp"),
  webphtml = require("gulp-webp-html"), // сгенерирует html для picture чтоб webp отображать в современных браузерах
  webpcss = require("gulp-webpcss") // для добавления свойств webp в css

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
    .pipe(webphtml())
    .pipe(dest(path.build.html)) //путь к папке результата
    .pipe(brsync.stream()); //обновим браузер вроде
}

//Function for work with css-files
function css() {
  return src(path.src.css)
    .pipe(scss({ outputStyle: "expanded"})) //чтоб без сжатия пока формировался css
    .pipe(groupMedia())
    .pipe(autoprefixer({
      overrideBrowserslist: ["last 5 versions"],
      cascade: true,
    }))
    .pipe(webpcss())
    .pipe(dest(path.build.css)) // build нашего выходного файла css BEFORE сжатием .css, указываем путь куда выгружать
    .pipe(cleanCss())
    .pipe(rename({extname: ".min.css"}))
    .pipe(dest(path.build.css)) // build нашего выходного файла css AFTER сжатия .min.css
    .pipe(brsync.stream()); //обновим браузер
}

//Function for work with js-files
function js() {
  return src(path.src.js)
    .pipe(fileinclude())
    .pipe(dest(path.build.js))
    .pipe(uglify)
    .pipe(rename({extname: ".min.js"}))
    .pipe(dest(path.build.js))
    .pipe(brsync.stream());
}

//Function for work with images
function images() {
  return src(path.src.img)
    .pipe(webp({ quality: 70}))
    .pipe(dest(path.build.img))
    .pipe(src(path.src.img)) // снова обращаемся к исходникам
    .pipe(imageMin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      interlaced: true,
      optimizationLevel: 3
    }))
    .pipe(dest(path.build.img))
    .pipe(brsync.stream());
}

// for live watching of html-partials
function watchFiles(params) {
  gulp.watch([path.watch.html], html);
  gulp.watch([path.watch.css], css);
  gulp.watch([path.watch.js], js);
  gulp.watch([path.watch.img], images);
}
// deteting 'dist' forder before build project, and create new 'dist' folder
function clean(params) {
  return del(path.clean);
}
// gulp.parallel(css, html) - параллельное выполнение ф-й в скобках
const build = gulp.series(clean, gulp.parallel(js, css, html, images));
// сценарий выполнения
const watch = gulp.parallel(build, watchFiles, browserSync);

exports.images = images;
exports.html = html;
exports.css = css;
exports.js = js;
exports.build = build;
exports.watch = watch;
exports.default = watch;
