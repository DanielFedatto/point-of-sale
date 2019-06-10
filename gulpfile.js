const
	{ src, dest, parallel, watch, series } = 	require('gulp')
const
    sass          	= 	require('gulp-sass')
    pug           	= 	require('gulp-pug')
	browserSync   	= 	require('browser-sync').create()
	babel			=	require('gulp-babel')
    uglifyjs      	= 	require('gulp-uglify')
    cssnano			=	require('gulp-cssnano')
	rename			=	require("gulp-rename")
	autoprefixer 	= 	require("gulp-autoprefixer")
	imagemin		=	require("gulp-imagemin")
    plumber 		= 	require('gulp-plumber')
	notify 			= 	require("gulp-notify")
	cache 			= 	require('gulp-cache')
	del 			= 	require('del')
	concat 			= 	require('gulp-concat')
	sourcemaps		=	require('gulp-sourcemaps')

// Compila o PUG
function templates() {
	return src('app/pug/*.pug')
		.pipe(pug({
			pretty: true,

		})).on('error', notify.onError({
			title: 'PUG',
			message: "<%= error.message %>"
		}))
		.pipe(dest('app/'))
		.pipe(browserSync.reload({stream: true}));
}
// Compila SASS e CSS, minifica e aplica a multiplataforma
function styles() {
	return src('app/styles/style.sass')
		.pipe(sass({outputStyle: ':nested'})).on('error', notify.onError({
			title: 'SASS',
			message:"<%= error.message %>"
		}))
		.pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8'], {cascade: false}))
		.pipe(cssnano())
		.pipe(rename({suffix: '.min'}))
		.pipe(dest('app/css'))
		.pipe(browserSync.reload({stream: true}));
}
// Minifica a aplica o Uglify no JS
function scripts() {
	return src('app/scripts/**/*.js', { sourcemaps: true })
		.pipe(plumber({
			errorHandler: notify.onError({
				title: "JS",
				message:"<%= error.message %>"
			})
		}))
		.pipe(sourcemaps.init())
		.pipe(concat ('funcoes.js'))
		.pipe(babel({
			presets: ['@babel/preset-env']
		}))
		.pipe(uglifyjs({ mangle: false }))
		.pipe(rename({suffix: '.min'}))
		.pipe(dest('app/js'))
		.pipe(browserSync.reload({stream: true}));
}
// Roda o servidor BrowserSync
function server() {
	browserSync.init({
		server: {
			baseDir: 'app/'
		},
		notify: true
	});
}
function bImages() {
	return src("app/img/**/*")
	.pipe(cache(imagemin({
		interlaced: true,
		progressive: true,
		svgoPlugins: [{removeViewBox: false}],
	})))
	.pipe(dest("dist/img"))
	.pipe(browserSync.reload({stream: true}));
}
// Limpa toda a pasta dist (Apenas no comando build)
function clean() {
	return del.sync("dist")
}
function bStyles() {
	return  src('app/css/style.min.css')
		.pipe(dest('dist/css'))
}
function bTemplates() {
	return src('app/*.html')
	.pipe(dest('dist/'))
}
function bFonts() {
	return src(['app/fonts/**/*'])
	.pipe(dest('dist/fonts'))
}
function bScripts() {
	return src(['app/js/**/*.js'])
	.pipe(dest('dist/js'))
}
exports.scripts = scripts
exports.styles = styles
exports.templates = templates
exports.server = server
exports.default = parallel(templates, styles, scripts)
exports.build = parallel(clean, bImages, bStyles, bTemplates, bFonts, bScripts)

watch('app/styles/**/*.sass', styles)
watch('app/styles/**/*.scss', styles)
watch('app/pug/**/*.pug', templates)
watch('app/scripts/**/*.js', scripts)