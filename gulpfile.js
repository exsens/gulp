const { src, dest, parallel, series, watch } = require('gulp');
const del = require('del');
const scss = require('gulp-sass');
const notify = require('gulp-notify');
const groupMedia = require('gulp-group-css-media-queries');
const rename = require('gulp-rename');
const cleanCSS = require('gulp-clean-css');
const ttf2Woff = require('gulp-ttf2woff');
const ttf2Woff2 = require('gulp-ttf2woff2');
const fs = require('fs');
const fonter = require('gulp-fonter');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const fileinclude = require('gulp-file-include');
const webp = require('gulp-webp');
const webpCss = require('gulp-webp-css');
const imagemin = require('gulp-imagemin');
const svgSprite = require('gulp-svg-sprite');
const svgMin = require('gulp-svgmin');
const webpack = require('webpack');
const webpackStream = require('webpack-stream');
const uglify = require('gulp-uglify-es').default;

const project_folder = 'dist';
const source_folder = 'src';


const path = {
	build: {
		html: project_folder + '/',
		css: project_folder + '/css/',
		js: project_folder + '/js/',
		images: project_folder + '/images/',
		fonts: project_folder + '/fonts/',
	},
	src: {
		html: [source_folder + '/*.html', '!' + source_folder + '/_*.html'],
		css: source_folder + '/scss/style.scss',
		js: source_folder + '/js/main.js',
		images: source_folder + '/images/**/*.{jpg,png,svg,gif,ico,webp}',
		fonts: source_folder + '/fonts/*.ttf',
		fontsscss: source_folder + '/scss/_fonts.scss'
	},
	watch: {
		html: source_folder + '/**/*.html',
		css: source_folder + '/scss/**/*.scss',
		js: source_folder + '/js/**/*.js',
		images: source_folder + '/images/**/*.{jpg,png,svg,gif,ico,webp}',
	},
	clean: [project_folder + '/**/*', '!' + project_folder + '/images', '!' + project_folder + '/fonts'],
	cleanStart: [project_folder + '/images', project_folder + '/fonts']
}

const html = () => {
	return src(path.src.html)
		.pipe(fileinclude({
			prefix: '@',
			basepath: '@file'
		}))
		.pipe(dest(path.build.html))
		.pipe(browserSync.stream());

}

const css = () => {
	return src(path.src.css)
		.pipe(sourcemaps.init())
		.pipe(scss({
			outputStyle: 'expanded'
		}).on("error", notify.onError()))
		.pipe(groupMedia())
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(autoprefixer({
			overrideBrowserslist: ['last 5 versions'],
			cascade: false
		}))
		.pipe(webpCss(['.jpg', '.jpeg']))
		.pipe(cleanCSS({
			level: 2
		}))
		.pipe(sourcemaps.write('.'))
		.pipe(dest(path.build.css))
		.pipe(browserSync.stream());
}

const js = () => {
	return src(path.src.js)
		.pipe(webpackStream({
			mode: 'development',
			output: {
				filename: 'main.js',
			},
			module: {
				rules: [{
					test: /\.m?js$/,
					exclude: /(node_modules|bower_components)/,
					use: {
						loader: 'babel-loader',
						options: {
							presets: ['@babel/preset-env']
						}
					}
				}]
			},
		}))
		.on('error', function (err) {
			console.error('WEBPACK ERROR', err);
			this.emit('end'); // Don't stop the rest of the task
		})
		.pipe(sourcemaps.init())
		.pipe(uglify().on("error", notify.onError()))
		.pipe(sourcemaps.write('.'))
		.pipe(dest(path.build.js))
		.pipe(browserSync.stream())
}

//fonts 

const fontsConv = () => {
	src(path.src.fonts)
		.pipe(ttf2Woff())
		.pipe(dest(path.build.fonts))
	return src(path.src.fonts)
		.pipe(ttf2Woff2())
		.pipe(dest(path.build.fonts))
}

const checkWeight = (fontname) => {
	let weight = 400;
	switch (true) {
		case /Thin/.test(fontname):
			weight = 100;
			break;
		case /ExtraLight/.test(fontname):
			weight = 200;
			break;
		case /Light/.test(fontname):
			weight = 300;
			break;
		case /Regular/.test(fontname):
			weight = 400;
			break;
		case /Medium/.test(fontname):
			weight = 500;
			break;
		case /SemiBold/.test(fontname):
			weight = 600;
			break;
		case /Semi/.test(fontname):
			weight = 600;
			break;
		case /Bold/.test(fontname):
			weight = 700;
			break;
		case /ExtraBold/.test(fontname):
			weight = 800;
			break;
		case /Heavy/.test(fontname):
			weight = 700;
			break;
		case /Black/.test(fontname):
			weight = 900;
			break;
		default:
			weight = 400;
	}
	return weight;
};

const srcFonts = path.src.fontsscss;
const appFonts = path.build.fonts;

const fontsCss = async () => {
	return (() => {
		const file_content = fs.readFileSync(srcFonts);
		if (file_content != '') {
			fs.writeFileSync(srcFonts, '');
		}
		fs.readdir(appFonts, (_, fonts) => {
			if (fonts) {
				return fonts.forEach((item) => {
					const fontname = item.split('.')[0];
					const font = fontname.split('-')[0];
					const weight = checkWeight(fontname);
					const style = fontname.includes('Italic');
					fs.appendFileSync(
						srcFonts,
						`@include font('${font}', '${fontname}', ${weight},${style ? ' italic' : ' normal'
						});\r\n`
					);
				});
			}
		});
	})(/* bs.stream() */);
};
//fonts


// images-min
const images = () => {
	return src(path.src.images)
		.pipe(webp({
			quality: 70
		}))
		.pipe(dest(path.build.images))
		.pipe(src(path.src.images))
		.pipe(imagemin({
			progressive: true,
			svgoPlugins: [{ removeViewBox: false }],
			interlaced: true,
			optimizationLevel: 3
		}))
		.pipe(dest(path.build.images))
		.pipe(browserSync.stream())

}

const svg = () => {
	return src([source_folder + '/svgSprite/**.svg'])
		.pipe(svgMin({
			js2svg: {
				pretty: true
			}
		}))
		.pipe(svgSprite({
			mode: {
				stack: {
					sprite: '../svgSprite/svgSprite.svg',
					// example: true
				}
			},
		}))
		.pipe(dest(path.build.images))

}

// images-min

//otf2ttf

const otf = () => {
	return src([source_folder + '/fonts/*.otf'])
		.pipe(fonter({
			formats: ['ttf']
		}))
		.pipe(dest(source_folder + '/fonts/'));
}

//otf2ttf


const watchFiles = () => {
	browserSync.init({
		server: {
			baseDir: './' + project_folder + '/'
		},
		port: 3000,
		notify: false
	})

	watch(path.watch.html, html);
	watch(path.watch.css, css);
	watch(path.watch.js, js);
	watch(path.watch.images, images);
}

const clean = () => {
	return del(path.clean);
}

const cleanStart = () => {
	return del(path.cleanStart);
}

exports.html = html;
exports.css = css;
exports.js = js;
exports.images = images;
exports.watchFiles = watchFiles;
exports.clean = clean;


exports.svg = svg; //svg sprite
exports.otf = otf; // otf to ttf


exports.start = series(cleanStart, fontsConv, fontsCss, images, svg);
exports.default = series(clean, parallel(html, css, js), watchFiles);







// function jsPlagins() {
//     return src([
//         'node_modules/lazysizes/lazysizes.js',
//         'node_modules/object-fit-images/dist/ofi.js',
//     ])
//         .pipe(concat('libs.min.js'))
//         .pipe(uglify())
//         .pipe(dest(path.build.js))
// }

// function cssPlagins() {
//     return src([
//         'node_modules/normalize.css/normalize.css',
//     ])
//         .pipe(concat('libs.min.css'))
//         // .pipe(uglify())
//         .pipe(clean_css())
//         .pipe(dest(path.build.css))          
// }




















