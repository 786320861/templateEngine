/**
 * Created by sq on 2016/4/7.
 */
'use strict';

var gulp = require("gulp"),
    browserSync = require("browser-sync"),
    reload = browserSync.reload,
    jshint = require("gulp-jshint"),
    less = require("gulp-less"),
    minifyCss = require("gulp-minify-css"),
    sourceMap = require("gulp-sourcemaps"),
    combiner  = require("stream-combiner2"),
    uglify = require("gulp-uglify"),
    concat = require("gulp-concat"),
    rename = require("gulp-rename"),
    glob = require("glob"),
    changed = require("gulp-changed");/*,
 sass = require("gulp-sass")*/
var path = {
    "js": "./scripts/*.js",
    "jsDest":  "./scripts/min",
    "less":  "./stylesheets/less/*.less",
    "css": "./stylesheets/css/*.css",
    "cssDest": "./stylesheets/min"
};
gulp.task("globTest", function(){
    return glob("./src/js/*.js", function(e,f){
        console.log(f);
    });
});
gulp.task("uglify", function(){
    return gulp.src(path.js)
        .pipe(jshint())
        .pipe(jshint.reporter("default"))
        //.pipe(uglify())
        //.pipe(rename({
        //    suffix: "-min"
        //}))
        .pipe(gulp.dest(path.jsDest));
});
gulp.task("jsChange", function(){
    gulp.watch(path.js, [uglify],function(){
        reload()
    });
});
/*gulp.task("concatJs", function(){
    return gulp.src(path.js)
        .pipe(sourceMap.init())
        .pipe(concat("all.js"))
        .pipe(uglify())
        .pipe(rename({
            suffix: "-min"
        }))
        .pipe(sourceMap.write("./map"))
        .pipe(gulp.dest(path.jsDest+"/min"));
});*/

gulp.task("less", function(){
    return gulp.src(path.less)
        //.pipe(changed(path.cssDest))
        .pipe(less())
        //.pipe(minifyCss())          //œ»≤ª»√—πÀı
        .pipe(gulp.dest(path.cssDest));
});
gulp.task("lessChange", ["less"], function(){
    reload();
});
/*gulp.task("test", function(){
    var combine = combiner.obj(
        gulp.src("./src/less/!*.less"),
        sourceMap.init(),
        less(),
        minifyCss(),
        sourceMap.write("./maps"),
        gulp.dest("./src/css")
    );
    combine.on("error", console.error.bind(console));
    return combine;
});*/
gulp.task("start", function(){
    var files = "**";
    browserSync.init(files, {
        //proxy: 'http://localhost:63342/browserSync/',
        server: {
            baseDir : "./",
            index: "html/index.html"
        },
        browser: ["google chrome"]
    });
});
gulp.task("default",["uglify","less","start"], function(){
    gulp.watch(path.less, ["lessChange"]);
    gulp.watch(path.reporterjs,["jsChange"]);
    gulp.watch(["./html/*.html"], function(){
        reload();
    });
});