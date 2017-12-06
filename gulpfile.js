var del                 = require('del');
var gulp                = require('gulp');
var path                = require('path');
var Dgeni               = require('dgeni');
var _                   = require('lodash');
var args                = require('yargs').argv;
var browserSync         = require('browser-sync');
var es                  = require('event-stream');
var config              = require('./gulp.config')();
var bowerFiles          = require('main-bower-files');
var ngConstant          = require('gulp-ng-constant');
var runSequence         = require('gulp-run-sequence');
var strip               = require('gulp-strip-comments');
var angularFileSort     = require('gulp-angular-filesort');
var port                = process.env.PORT || config.defaultPort;
var $                   = require('gulp-load-plugins')({lazy: true});
var gulpSrcBowerOptions = {read: false, base: './bower_components'};

///////////////////////////
//         misc          //
///////////////////////////
gulp.task('help', $.taskListing);

///////////////////////////
//      documentation    //
///////////////////////////
gulp.task('clean-docs', cleanDoc);
gulp.task('copy-app', copyAngularApp);
gulp.task('dgeni', ['copy-app'], dgeniDoc);

///////////////////////////
// Development Environment/
///////////////////////////
gulp.task('sass', sass);
gulp.task('eslint', eslint);
gulp.task('app:js:dev', appJs);
gulp.task('bower:js', bowerJs);
gulp.task('bower:css', bowerCss);
gulp.task('default', ['serve-dev']);
gulp.task('sass-vendor', sassVendor);
gulp.task('ng-constant:dev', ngConstantDev);
gulp.task('app:css', ['sass-vendor'], sass);
gulp.task('copy-vendor-fonts', copyVendorFonts);
gulp.task('serve-dev', ['inject:dev'], serveDev);
/**
 * Just use it when kick start gulp serve-dev
 * Reason: No need to repeat ngConstant:dev multiple times when *.js changed
 */
gulp.task('app:js:dev:init', ['ng-constant:dev', 'eslint', 'copy-vendor-fonts'], appJs);
gulp.task('inject:dev', ['app:js:dev:init', 'app:css', 'bower:css', 'bower:js'], inject);

///////////////////////////
// Production Environment /
///////////////////////////
gulp.task('build', build);
gulp.task('copy-data', copyData);
gulp.task('copy-fonts', copyFonts);
gulp.task('copy-images', copyImages);
gulp.task('clean-build', cleanBuildFolder);
gulp.task('ng-constant:prod', ngConstantProd);
gulp.task('serve-build', ['build'], serveBuild);
gulp.task('notifyBuildFinish', notifyBuildFinish);
gulp.task('clean-template-cache', cleanTemplateCache);
gulp.task('template-cache', ['clean-template-cache'], templateCache);
gulp.task('app:js:prod', ['ng-constant:prod', 'template-cache'], appJs);
gulp.task('zip', ['app:js:prod', 'app:css', 'bower:css', 'bower:js'], zip);


////////////////////////////////////////////////////////////////////////////
///////////////////////////  METHODS  //////////////////////////////////////
////////////////////////////////////////////////////////////////////////////

/*
 * When build, this job will copy data resource
 * into build folder
 */
function copyData() {
    return gulp.src(config.client + 'data/*')
               .pipe(gulp.dest(config.build + 'data'));
}

function cleanTemplateCache() {
    var files = [].concat(
        config.temp + 'template.js'
    );
    clean(files);
}

function cleanBuildFolder() {
    return gulp.src(config.build).pipe($.clean());
}

function sassVendor() {
    var vendorFilesSteam = gulp.src(bowerFiles({filter: '**/*.{scss,sass}'}), gulpSrcBowerOptions);

    return gulp
        .src('./src/client/scss/vendor.scss')
        .pipe($.plumber({errorHandler: handleError}))
        .pipe($.inject(vendorFilesSteam, {
            name    : 'vendor',
            relative: true
        }))
        .pipe(gulp.dest('./src/client/scss/'));
}

function copyVendorFonts() {
    return gulp.src(bowerFiles({filter: '**/*.{eot,ttf,woff,woff2,otf}'}), {base: './bower_components'})
               .pipe($.flatten())
               .pipe(gulp.dest('./src/client/fonts/'));
}

function eslint() {
    return gulp
        .src(config.alljs)
        // eslint() attaches the lint output to the "eslint" property
        // of the file object so it can be used by other modules.
        .pipe($.eslint())
        // eslint.format() outputs the lint results to the console.
        // Alternatively use eslint.formatEach() (see Docs).
        .pipe($.eslint.format())
        // To have the process exit with an error code (1) on
        // lint error, return the stream and pipe to failAfterError last.
        .pipe($.eslint.failAfterError());
}

function sass() {
    return gulp.src(config.sass)
               .pipe($.plumber({errorHandler: handleError}))
               .pipe($.sass())
               .pipe($.autoprefixer({browsers: ['last 2 version', '> 5%']}))
               .pipe($.concat(config.optimized.cssDev))
               .pipe($.csso())
               .pipe(gulp.dest(config.temp))
               .pipe(browserSync.reload({stream: true}));
}

function copyFonts() {
    return gulp.src(config.fonts)
               .pipe(gulp.dest(config.build + 'fonts'));
}

function copyImages() {
    return gulp.src(config.images)
               .pipe($.imagemin({optimizationLevel: 4}))
               .pipe(gulp.dest(config.build + 'images'));
}

function templateCache() {
    return gulp
        .src(config.htmltemplates)
        .pipe($.minifyHtml({empty: true}))
        .pipe($.angularTemplatecache(
            config.templateCache.file,
            config.templateCache.options
        ))
        .pipe(gulp.dest(config.temp));
}

function inject() {
    var dependencies = [
        config.temp + config.optimized.bowerCss,
        config.temp + config.optimized.bowerJs,

        config.temp + config.optimized.appDev,
        config.temp + config.optimized.cssDev
    ];

    return gulp
        .src(config.index)
        .pipe($.inject(gulp.src(dependencies)))
        .pipe(gulp.dest(config.client));

}

function build(cb) {
    runSequence('clean-build', [
            'copy-fonts',
            'copy-images',
            'copy-data',
            'zip'],
        'notifyBuildFinish', cb);
}

function zip() {
    var buildJsDir  = config.build + 'js/';
    var buildCssDir = config.build + 'styles/';

    clean(buildJsDir);
    clean(buildCssDir + '*.css');

    // define src
    var libJs = config.temp + config.optimized.bowerJs;
    var appJs = [
        config.temp + config.optimized.appDev,
        config.temp + config.templateCache.file
    ];

    var stylesCss = config.temp + config.optimized.cssDev;
    var libCss    = config.temp + config.optimized.bowerCss;

    var libJsStream =
            // lib.js
            gulp
                .src(libJs) // grab files in ./temp/library.js
                .pipe($.uglify())
                .pipe(strip())
                .pipe($.rename(config.optimized.lib)) // rename it to lib.js
                .pipe($.rev()) // version it
                .pipe(gulp.dest(buildJsDir)); // produce to ./build/js/lib.js

    var libCssStream = gulp
        .src(libCss)
        .pipe($.concat('lib.css'))
        .pipe($.csso())
        .pipe($.rev())
        .pipe(gulp.dest(buildCssDir));

    var indexDependenciesStream = es.merge(
        // app.js
        gulp
            .src(appJs)
            .pipe($.uglify())
            .pipe(strip())
            .pipe($.concat(config.optimized.app))
            .pipe($.rev())
            .pipe(gulp.dest(buildJsDir)),

        // // style.css
        gulp
            .src(stylesCss)
            .pipe($.rename('style.css'))
            .pipe($.rev())
            .pipe(gulp.dest(buildCssDir))
    );

    // To make sure order, I'll separate injection into 3 steps (es.merge doesn't guarantee order)
    // 1. lib.js
    // 2. component.js
    // 3. app.js and other css files
    return gulp
        .src([config.index])
        .pipe($.plumber({errorHandler: handleError}))
        .pipe($.inject(libJsStream, {
            name        : 'lib',
            addRootSlash: false,
            transform   : tranformBuildPath
        }))
        .pipe($.inject(libCssStream, {
            name        : 'lib',
            addRootSlash: false,
            transform   : tranformBuildPath
        }))
        .pipe($.inject(indexDependenciesStream, {
            addRootSlash: false,
            transform   : tranformBuildPath
        }))
        .pipe(strip()) // remove comments in index.html
        .pipe(gulp.dest(config.build));

}

function serveBuild() {
    serve(false /* isDev */);
}

function serveDev() {
    serve(true /* isDev */);
}

function serve(isDev) {
    var nodeOptions = {
        script   : config.nodeServer,
        delayTime: 1,
        env      : {
            'PORT'    : port,
            'NODE_ENV': isDev ? 'dev' : 'build'
        },
        watch    : [config.server]
    };
    $.nodemon(nodeOptions)
     .on('restart', ['analyzeJs'], function (ev) {
         log('*** nodemon restarted');
         log('files changed on restart:\n' + ev);
         setTimeout(function () {
             browserSync.notify('reloading now...');
             browserSync.reload({stream: true});
         }, config.browserReloadDelay);
     })
     .on('start', function () {
         log('*** nodemon started');
         startBrowserSync(isDev);
     })
     .on('crash', function () {
         log('*** nodemon crashed: script crashed for some reason');
     })
     .on('exit', function () {
         log('*** nodemon exited cleanly');
     });
}

function changeEvent(event) {
    var srcPattern = new RegExp('/.*(?=/' + config.source + ')/');
    log('File ' + event.path.replace(srcPattern, '') + ' ' + event.type);
}

function notifyBuildFinish() {
    var msg = {
        title  : 'Task `gulp build`',
        message: 'done'
    };
    notify(msg);
}

function notify(options) {
    var notifier      = require('node-notifier');
    var notifyOptions = {
        sound       : 'Bottle',
        contentImage: path.join(__dirname, 'gulp.png'),
        icon        : path.join(__dirname, 'gulp.png')
    };

    _.assign(notifyOptions, options);
    notifier.notify(notifyOptions);
}

function appJs() {
    return gulp.src(config.js)
               .pipe($.changed(config.temp))
               .pipe(angularFileSort())
               .pipe($.ngAnnotate({single_quotes: true}))
               .pipe($.insert.transform(getFileName))
               .pipe($.concat(config.optimized.appDev))
               .pipe(gulp.dest(config.temp));
}

function getType(path) {
    var fragments = path.split('.');
    return fragments[fragments.length - 1];
}

function startBrowserSync(isDev) {
    if (args.nosync || browserSync.active) {
        return;
    }

    log('Starting browser-sync on port ' + port);

    if (isDev) {
        gulp.watch('src/client/**/*', function (event) {
            switch (getType(event.path)) {
                case 'js':
                    runSequence('app:js:dev', browserSync.reload);
                    break;
                case 'scss':
                    browserSync.notify('Compiling scss -> css');
                    gulp.start('sass');
                    break;
                default:
                    browserSync.reload();
                    break;
            }
        });

    } else {
        gulp.watch([config.sass, config.js, config.html], ['optimize', browserSync.reload])
            .on('change', function (event) { changeEvent(event); });
    }


    var options = {
        proxy         : 'localhost:' + port,
        port          : 3346,
        ghostMode     : {
            clicks  : true,
            location: false,
            forms   : true,
            scroll  : true
        },
        browser       : true,
        injectChanges : true,
        logFileChanges: true,
        logPrefix     : 'xxxTemplatexxx',
        notify        : true,
        reloadDelay   : 0 //1000
    };

    browserSync(options);
}

function clean(path) {
    del(path);
}

function log(msg) {
    if (typeof(msg) === 'object') {
        for (var item in msg) {
            if (msg.hasOwnProperty(item)) {
                $.util.log($.util.colors.blue(msg[item]));
            }
        }
    } else {
        $.util.log($.util.colors.blue(msg));
    }

}

function dgeniDoc() {
    var dgeni = new Dgeni([require('./docs/config')]);
    return dgeni.generate();
}

function copyAngularApp() {
    return gulp.src(__dirname + '/docs/app/*.js').pipe(gulp.dest(__dirname + '/docs/build/src/'));
}

function cleanDoc(done) {
    var delconfig = './docs/build';
    log('Cleaning: ' + $.util.colors.blue(delconfig));
    del(delconfig, done);
}

function ngConstantDev() {
    return $ngConstant(true);
}

function ngConstantProd() {
    return $ngConstant(false);
}

function $ngConstant(isDevEnvironment) {
    return ngConstant({
        name     : 'xxxTemplatexxx',
        constants: {
            DEBUG_INFO_ENABLED: isDevEnvironment
        },
        template : config.constantTemplate,
        stream   : true,
        wrap     : false
    })
        .pipe($.rename('app.constants.js'))
        .pipe(gulp.dest(config.clientApp));
}

function bowerCss() {
    gulp.src(bowerFiles({
        filter: function (path) {
            var fragments = path.split('.');
            return fragments[fragments.length - 1] === 'css';
        }
    }), {base: './bower_components'})
        .pipe($.concat(config.optimized.bowerCss))
        .pipe(gulp.dest(config.temp));
}

function bowerJs() {
    gulp.src(bowerFiles({
        filter: function (path) {
            var fragments = path.split('.');
            return fragments[fragments.length - 1] === 'js';
        }
    }), {base: './bower_components'})
        .pipe($.concat(config.optimized.bowerJs))
        .pipe(gulp.dest(config.temp));
}

function getFileName(content, file) {
    var fragments = file.path.split('/');
    return '// ' + fragments[fragments.length - 1] + '\n' + content;
}

function tranformBuildPath(filePath) {
    var tag     = '';
    var newPath = filePath.replace(new RegExp('build/'), '');
    switch (getType(filePath)) {
        case 'js':
            tag = '<script src="' + newPath + '"></script>';
            break;
        case 'css':
            tag = '<link rel="stylesheet" href="' + newPath + '">';
            break;
    }
    return tag;
}

function handleError() {
    var $args        = Array.prototype.slice.call(arguments);
    var notification = args.notification === undefined ? true : args.notification;
    // Send error to notification center with gulp-notify
    if (notification) {
        $.notify.onError({
            title   : 'xxxTemplatexxx',
            subtitle: 'Failure!',
            message : 'Error: <%= error.message %>',
            sound   : 'Beep'
        }).apply(this, $args);
    }
    // Keep gulp from hanging on this task
    this.emit('end');

}
