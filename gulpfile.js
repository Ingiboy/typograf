var gulp = require('gulp'),
    fs = require('fs'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    jshint = require('gulp-jshint'),
    jscs = require('gulp-jscs'),
    gulpFilter = require('gulp-filter'),
    filter = function() {
        return gulpFilter(['**/*.js', '!**/*.spec.js']);
    },
    destDir = './dist/',
    makeMdRules = function() {
        var Typograf = require('./dist/typograf.js'),
            getRow = function(rule, i) {
                text += '| ' + (i + 1) + '. | `' +
                    rule.name + '` | ' +
                    rule.title + ' | ' +
                    rule.sortIndex + ' | ' +
                    (rule.enabled !== false ? '✓' : '') + ' |\n';
            },
            writeFile = function(file, template) {
                fs.writeFileSync(file, template.replace(/{{content}}/, text));
            },
            text = '';

        Typograf.prototype._rules.sort(function(a, b) {
            if(a.name > b.name) {
                return 1;
            } else {
                return -1;
            }
        }).forEach(getRow);
        writeFile('RULES.md', fs.readFileSync('templates/rules.md').toString());

        text = '';
        Typograf.prototype._rules.sort(function(a, b) {
            if(a.sortIndex > b.sortIndex) {
                return 1;
            } else if(a.sortIndex < b.sortIndex) {
                return -1;
            }

            return 0;
        }).forEach(getRow);
        writeFile('RULES_SORTED.md', fs.readFileSync('templates/rules_sorted.md').toString());
    };

var paths = {
    js: [
        'src/main.js',
        'src/entities.js',
        'src/data/**/*.js',
        'src/rules/**/*.js',
        'src/end.js'
    ],
    css: [
        'src/**/*.css'
    ],
    testRules: [
        'src/main.spec.js',
        'src/rules/**/*.js'
    ]
};

gulp.task('js', function() {
    return gulp.src(paths.js)
        .pipe(filter())
        .pipe(concat('typograf.js'))
        .pipe(gulp.dest(destDir))
        .on('end', makeMdRules);
});

gulp.task('minjs', function() {
    return gulp.src(paths.js)
        .pipe(filter())
        .pipe(concat('typograf.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(destDir));
});

gulp.task('css', function() {
    return gulp.src(paths.css)
        .pipe(concat('typograf.css'))
        .pipe(gulp.dest(destDir));
});

gulp.task('testRules', function() {
    var filterSpec = gulpFilter(['**/*.spec.js']);

    return gulp.src(paths.testRules)
        .pipe(filterSpec)
        .pipe(concat('rules.js'))
        .pipe(gulp.dest('./test/'));
});

gulp.task('lint', function() {
  return gulp.src(paths.js)
    .pipe(filter())
    .pipe(jscs())
    .pipe(jshint())
    .pipe(jshint.reporter());
});

gulp.task('watch', function() {
    gulp.watch(['src/**/*', 'test/**/*'], ['js', 'testRules', 'css']);
});

gulp.task('default', ['js', 'minjs', 'testRules', 'lint', 'css']);
