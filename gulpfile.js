var gulp = require('gulp')
var concat = require('gulp-concat')

gulp.task('code', function () {
  gulp.src([
        'scripts/**/*.js', '!scripts/config.js'])
    .pipe(concat('build/code.js'))
    .pipe(gulp.dest('.'))
})

gulp.task('dependencies', function () {
  gulp.src([
'bower_components/jquery/dist/jquery.min.js',
'node_modules/angular/angular.min.js',
'bower_components/bootstrap/dist/js/bootstrap.js',
'node_modules/angular-resource/angular-resource.js',
'node_modules/angular-cookies/angular-cookies.js',
'node_modules/angular-sanitize/angular-sanitize.js',
'node_modules/angular-route/angular-route.js',
'node_modules/angular-strap/dist/angular-strap.min.js',
// 'bower_components/angular-xeditable/dist/js/xeditable.js',
'node_modules/angular-xeditable/dist/js/xeditable.js',
'node_modules/angular-animate/angular-animate.js',
'bower_components/angular-uuid4/angular-uuid4.js',
'node_modules/angular-loading-bar/src/loading-bar.js',
'node_modules/angular-ui-bootstrap/dist/ui-bootstrap.js',
'bower_components/angular-ui-utils/ui-utils.js',
'node_modules/angular-translate/dist/angular-translate.js',
'node_modules/angular-translate-loader-static-files/angular-translate-loader-static-files.js',
'bower_components/angular-notify-toaster/toaster.js',
'bower_components/bootstrap-datepicker/js/bootstrap-datepicker.js',
'bower_components/sugar/release/sugar.min.js',
'bower_components/jquery-dateFormat/dist/jquery-dateFormat.min.js',
'bower_components/notifyjs/dist/notify-combined.min.js',
'bower_components/angucomplete-alt/angucomplete-alt.js',
'bower_components/angu-fixed-header-table/angu-fixed-header-table.js',
'bower_components/ng-stats/ng-stats.js',
'node_modules/angular-bind-notifier/dist/angular-bind-notifier.min.js',
'node_modules/moment/moment.js',
'node_modules/twbs-pagination/jquery.twbsPagination.js',
'node_modules/angular-google-picker/dist/google-picker.js',
'node_modules/floatthead/dist/jquery.floatThead.min.js'
])
    .pipe(concat('build/dependencies.js'))
    .pipe(gulp.dest('.'))
})
