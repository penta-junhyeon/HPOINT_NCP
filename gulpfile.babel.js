const gulp = require('gulp')
const scss = require('gulp-sass')(require('sass'))
const babel = require('gulp-babel')
const sourcemaps = require('gulp-sourcemaps')
const fileinclude = require('gulp-file-include')
const htmlbeautify = require('gulp-html-beautify')
const ejs = require('gulp-ejs')
const concat = require('gulp-concat')
const uglify = require('gulp-uglify')
const autoprefixer = require('gulp-autoprefixer')
const rename = require('gulp-rename')
const browserSync = require('browser-sync').create()
const del = require('del')

const SRC_FOLDER = './src/'
const DIST_FOLDER = './dist'

const SRC_PATH = {
    ASSETS: {
        FONTS: './src/assets/fonts',
        IMAGES: './src/assets/images',
        VIDEOS: './src/assets/videos',
        SAMPLE: './src/assets/sample',
        SCSS: './src/assets/scss',
        JS: './src/assets/js',
        LIB: './src/assets/lib',
        JSON: './src/assets/json'
    },
    EJS: './src/pages'
},
    DEST_PATH = {
        ASSETS: {
            FONTS: './dist/assets/fonts',
            IMAGES: './dist/assets/images',
            VIDEOS: './dist/assets/videos',
            SAMPLE: './dist/assets/sample',
            CSS: './dist/assets/css',
            JS: './dist/assets/js',
            LIB: './dist/assets/lib',
            JSON: './dist/assets/json'
        }
    },
    // 옵션
    OPTIONS = {
        outputStyle: 'expanded',
        indentType: 'space',
        indentWidth: 4,
        precision: 8
    }

gulp.task('clean', function () {
    return del(['dist'])
})

gulp.task('html', () => {
    return gulp
        .src([SRC_FOLDER + '**/*.html'], {
            base: SRC_FOLDER,
            since: gulp.lastRun('html')
        })
        .pipe(gulp.dest(DIST_FOLDER))
        .pipe(browserSync.stream())
})

gulp.task('ejs', function () {
    return gulp
        .src([SRC_FOLDER + '/pages/**/!(_)*.ejs', SRC_FOLDER + '/*.ejs'])
        .pipe(ejs())
        .pipe(rename({ extname: '.html' }))
        .pipe(
            fileinclude({
                prefix: '@@',
                basepath: '@file'
            })
        )
        .pipe(htmlbeautify({ indentSize: 2 }))
        .pipe(gulp.dest(DIST_FOLDER + '/pages'))
        .pipe(browserSync.stream())
})

gulp.task('scss:compile', function () {
    return gulp
        .src(SRC_PATH.ASSETS.SCSS + '/style.scss')
        .pipe(scss({ silenceDeprecations: ['legacy-js-api'] }).on('error', scss.logError))
        .pipe(autoprefixer())
        .pipe(gulp.dest(DEST_PATH.ASSETS.CSS))
        .pipe(browserSync.stream())
})

gulp.task('js', () => {
    return gulp
        .src(SRC_PATH.ASSETS.JS + '/**/*.js')
        .pipe(babel())
        .pipe(uglify())
        .pipe(gulp.dest(DEST_PATH.ASSETS.JS))
        .pipe(browserSync.stream())
})
gulp.task('lib', () => {
    return gulp
        .src(SRC_PATH.ASSETS.LIB + '/**/*.+(js|css)')
        .pipe(gulp.dest(DEST_PATH.ASSETS.LIB))
        .pipe(browserSync.stream())
})
gulp.task('json', () => {
    return gulp
        .src(SRC_PATH.ASSETS.JSON + '/**/*.+(json)')
        .pipe(gulp.dest(DEST_PATH.ASSETS.JSON))
        .pipe(browserSync.stream())
})

gulp.task('svg', () => {
    return gulp
        .src(SRC_PATH.ASSETS.IMAGES + '/**/*.svg')
        .pipe(gulp.dest(DEST_PATH.ASSETS.IMAGES))
        .pipe(browserSync.stream())
})

gulp.task('images', async function () {
    const imagemin = (await import('gulp-imagemin')).default;
    return gulp.src(SRC_PATH.ASSETS.IMAGES + '/**/*.+(png|jpg|jpeg|gif|ico)')
        .pipe(imagemin())
        .pipe(gulp.dest(DEST_PATH.ASSETS.IMAGES))
        .pipe(browserSync.stream())
});
gulp.task('fonts', () => {
    return gulp
        .src(SRC_PATH.ASSETS.FONTS + '/**/*.+(eot|otf|svg|ttf|woff|woff2)')
        .pipe(gulp.dest(DEST_PATH.ASSETS.FONTS))
        .pipe(browserSync.stream())
})

gulp.task('videos', () => {
    return gulp
        .src(SRC_PATH.ASSETS.VIDEOS + '/*')
        .pipe(gulp.dest(DEST_PATH.ASSETS.VIDEOS))
        .pipe(browserSync.stream())
})
gulp.task('sample', () => {
    return gulp
        .src(SRC_PATH.ASSETS.SAMPLE + '/*')
        .pipe(gulp.dest(DEST_PATH.ASSETS.SAMPLE))
        .pipe(browserSync.stream())
})

gulp.task('watch', function () {
    gulp.watch(SRC_PATH.EJS + '/**/*.ejs', gulp.series('ejs'))
    gulp.watch(SRC_PATH.ASSETS.SCSS + '/**/*.scss', gulp.series('scss:compile'))
    gulp.watch(SRC_PATH.ASSETS.JS + '/**/*.js', gulp.series('js'))
    gulp.watch(SRC_PATH.ASSETS.LIB + '/**/*.+(js|css)', gulp.series('lib'))
    gulp.watch(SRC_PATH.ASSETS.JSON + '/**/*.+(json)', gulp.series('json'))
    gulp.watch(SRC_PATH.ASSETS.IMAGES + '/**/*.+(png|jpg|jpeg|gif|ico)', gulp.series('images'))
    gulp.watch(SRC_PATH.ASSETS.IMAGES + '/**/*.svg', gulp.series('svg'))
    gulp.watch(SRC_PATH.ASSETS.FONTS + '/**/*.+(eot|otf|svg|ttf|woff|woff2)', gulp.series('fonts'))
    gulp.watch(SRC_PATH.ASSETS.MOVIES + '/*', gulp.series('videos'))
    gulp.watch(SRC_PATH.ASSETS.SAMPLE + '/*', gulp.series('sample'))
})

gulp.task('browserSync', function () {
    browserSync.init({
        port: 3000,
        startPath: '/dist/pages/main.html',
        server: {
            baseDir: './',
            open: true
        }
    })
})

gulp.task(
    'build',
    gulp.series(
        'html',
        'ejs',
        'scss:compile',
        'js',
        'lib',
        'json',
        'images',
        'svg',
        'fonts',
        'videos',
        'sample',
        gulp.parallel('browserSync', 'watch')
    )
)

gulp.task('default', gulp.series('clean', 'build', gulp.parallel('browserSync', 'watch')))
