'use strict';

var gulp = require('gulp');
var less = require('gulp-less');// для сборки стилей
var cssmin = require('gulp-cssmin');//сжатие css
var prefixer = require('gulp-autoprefixer'); // добавляем префиксы в css
var concat = require('gulp-concat'); // склеивание файлов в один
var rename = require('gulp-rename'); // переименовывание файла
var debug = require('gulp-debug'); // дебаг работы галп
var sourcemaps = require('gulp-sourcemaps'); // карта измнений, что было и что стало
var gulpIf = require('gulp-if'); // В зависмости от условий пускать управление в тот или иной поток
var rimraf = require('rimraf'); // Очистка директории
var rigger = require('gulp-rigger'); // Для импорта html файлов
var newer =  require('gulp-newer'); // директория в которую мы хотим копировать, смотри если есть такой же фаил то он просто не пропускает его дальше
var imagemin = require('gulp-imagemin'); // минификация изображений
var pngquant = require('imagemin-pngquant'); // работа с png
var remember = require('gulp-remember'); // Пропускает файлы через себя и смотрит дату модификации
var p = require('path'); // Преобразование пути
var browserSync = require("browser-sync").create();
var reload = browserSync.reload;// перезагружаем страничку
var notify = require('gulp-notify'); // для вывода сообщений об ошибке
var uglify = require('gulp-uglify'); // для склейки js
var babelify   = require('babelify'); //
var browserify = require('browserify'); //
var buffer = require('vinyl-buffer'); //
var source = require('vinyl-source-stream');//

// задачи
gulp.task('task1', function (callback) {
    console.log('task1');
    callback();
});
gulp.task('task2', function (callback) {
    console.log('task2');
    callback();
});
gulp.task('task3', function (callback) {
    console.log('task3');
    callback();
});
// последовательное выполнение задач, то есть установка зависимостей
// task3 -> task1 -> task2 -> task4
gulp.task('task4',['task3','task1','task2'], function (callback) {
    console.log('task4');
    callback();
});

// пути
var path = {
    source: { //Пути откуда брать исходники
        html: 'source/html/index.html',
        js: 'source/js/main.js',
        styles: 'source/less/style.less',
        images: 'source/images/**/*.*' //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
    },
    dest: { //Тут мы укажем куда складывать готовые после сборки файлы
        html: 'public/',
        js: 'public/js/',
        styles: 'public/css/',
        images: 'public/images/'
    },
    clean: './public',
    watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
        html: 'source/**/*.html',
        js: 'source/js/**/*.js',
        styles: 'source/less/**/*.less',
        images: 'source/images/**/*.*'
    }
};
// взять файлы и скопировать куда-нибудь
gulp.task('task5', function () {
    return gulp.src(path.source.styles) //readable ищем файлы с указанным шаблоном
        .pipe(gulp.dest(path.dest.styles)); //writable рекурсивно копируем все сюда
});

// собираем css
gulp.task('css', function () {
    return gulp.src(path.source.styles) // берем препроцессорный код
        .pipe(debug({title: 'css в работе'}))
        //.pipe(remember('styles'))
        .pipe(less()) // преобразуем в css
        .on('error', notify.onError(function(err){ // обрабатываем ошибки
            return {
                title: 'Styles compilation error',
                message: err.message
            }
        }))
        .pipe(prefixer()) // добавляем префиксы
        .pipe(cssmin()) // сжимаем
        .pipe(rename("style.min.css")) // переименовываем
        .pipe(gulp.dest(path.dest.styles)) // и пишем в public
        .pipe(reload({stream: true})); // перезагрузим сервер
});

// дебаг работы галп, можно разбирать ставить метки что и где происходит
gulp.task('debug', function () {
    return gulp.src(path.source.styles)
        .pipe(debug({title: 'В css'}))
        .pipe(less()) // преобразуем в css
        .pipe(debug({title: 'Префиксы'}))
        .pipe(prefixer()) // добавляем префиксы
        .pipe(debug({title: 'Сжатие'}))
        .pipe(cssmin()) // сжимаем
        .pipe(debug({title: 'Пререименовываем'}))
        .pipe(rename("style.min.css")) // переименовываем
        .pipe(debug({title: 'Результат'}))
        .pipe(gulp.dest(path.dest.styles)); // и пишем в public
});

// Запуск `NODE_ENV=production gulp sourcemaps` приведет к сборке без sourcemaps
var isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development'; // если ее нет или не задано то мы в состоянии разроаботки

// sourcemaps, отражает изменения либо в самом файле, либо в файле определенного формата
// В интрументах разработки можно посмотреть изменения
// Прямо в файл будет записано типа /*# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInN0eWxlLmxlc3MiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUNBO0VBQ0UseUJBQUE7RUFDQSxhQUFBIiwic291cmNlc0NvbnRlbnQiOlsiLyog0KHRgtC40LvQuCAqL1xuYm9keSB7XG4gIGJhY2tncm91bmQtY29sb3I6IHJnYigyNTUsMjU1LDI1NSk7XG4gIGRpc3BsYXk6IGZsZXg7XG59Il0sImZpbGUiOiJzdHlsZS5jc3MifQ== */ при запуске по умолчанию
// запуск gulp sourcemaps генерирует soursemap пряо в исходном файле
// запуск продакшен варианта NODE_ENV=production gulp sourcemaps не будет генерировать sourceMap
gulp.task('sourcemaps', function () {
    return gulp.src(path.source.styles)
    // gulpIf(условие, что при этом делаем)
        .pipe( gulpIf(isDevelopment,sourcemaps.init()) ) // SourceMap и далее большинство плагинов знают об этом свойстве и интегрирует изменения
        .pipe(less())
        .pipe(rename("style.min.css"))
        .pipe( gulpIf(isDevelopment,sourcemaps.write()) ) // Пишем итоговую sourceMap в итоговый фаил - Это проще для разработки
        //.pipe(sourcemaps.write('.')) // Пишем итоговую sourceMap в другой файл в этот же каталог
        .pipe(gulp.dest(path.dest.styles));
});

// очищаем директорию и удаляем директорию
gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

// сборка html
gulp.task('html', function () {
    gulp.src(path.source.html,{}) //Выберем фаил по нужному пути
        .pipe(rigger()) //Прогоним через rigger который все склеит в один фаил
        //.pipe(newer('public')) // фильтр
        //.pipe(debug({title: 'Копирование html'}))
        .pipe(gulp.dest(path.dest.html)) // получи один фаил
        .pipe(reload({stream: true})); // перезагрузим сервер


});
// картинки
gulp.task('images', function () {
    gulp.src(path.source.images) //Выберем наши картинки
        .pipe(imagemin({ //Сожмем их
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(newer('public/images')) // фильтр, копируем только неизмененные картинки
        .pipe(debug({title: 'Копирование картинок'}))
        .pipe(gulp.dest(path.dest.images))
        .pipe(reload({stream: true})); // перезагрузим сервер
});

gulp.task('js', function () {
    gulp.src(path.source.js) //Найдем наш main файл
        //.pipe(rigger()) //Прогоним через rigger
        .pipe(uglify()) //Сожмем наш js
        .pipe(rename("main.min.js")) //Перименуем
        .pipe(gulp.dest(path.dest.js)) //Выплюнем готовый файл
        .pipe(reload({stream: true})); //И перезагрузим сервер
});

// Browserify + Babel
gulp.task('browserify', function () {
        var b =  browserify(path.source.js,{debug : true})// Передача входной точки для browserify
            .transform(babelify, { presets : [ 'es2015' ] });
            b.bundle()
                .pipe(source(path.source.js))
                .pipe(buffer())
                .pipe(rename("main.min.js")) //Перименуем
                .pipe(sourcemaps.init({ loadMaps : true }))
                .pipe(sourcemaps.write('.'))
                .pipe(gulp.dest(path.dest.js)) //Выплюнем готовый файл
                .pipe(reload({stream: true})); //И перезагрузим сервер
});

// слеженние за измененными файлами
// gulp.watch('js/**/*.js', ['uglify','reload']);
/*
* watch([path.watch.html], function(event, cb) {
    gulp.start('html:build');
 });
 */
gulp.task('watch', function () {
    // процеcc не завершается а продолжается наблюдение за файлами
    /*gulp.watch(path.watch.styles, ['css']).on('unlink', function (filepath) {
        remember.forget('styles' ,p.resolve(filepath));
    });*/
    gulp.watch(path.watch.styles, ['css']);
    gulp.watch(path.watch.html, ['html']);
    gulp.watch(path.watch.images, ['images']);
});
// сборка всего
gulp.task('build', [
    'html',
    'css',
    'images'
]);
// конфиг сервера
var config = {
    server: {
        baseDir: "./public"
    },
    //tunnel: true,
    host: 'localhost',
    port: 9000,
    logPrefix: "Gulp-project"
};
// browser-sinc
gulp.task('server', function () {
    browserSync.init(config);
});



gulp.task('task', function () {

});
gulp.task('default',['build', 'server', 'watch'], function() { // задача по умолчанию

});