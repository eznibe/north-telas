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
'bower_components/angular/angular.min.js',
'bower_components/bootstrap/dist/js/bootstrap.js',
'bower_components/angular-resource/angular-resource.js',
'bower_components/angular-cookies/angular-cookies.js',
'bower_components/angular-sanitize/angular-sanitize.js',
'bower_components/angular-route/angular-route.js',
'bower_components/angular-strap/dist/modules/modal.js',
'bower_components/angular-strap/dist/modules/dimensions.js',
'bower_components/angular-xeditable/dist/js/xeditable.js',
'bower_components/angular-animate/angular-animate.min.js',
'bower_components/angular-uuid4/angular-uuid4.js',
'bower_components/angular-loading-bar/src/loading-bar.js',
'bower_components/angular-ui-utils/ui-utils.js',
'bower_components/angular-translate/angular-translate.js',
'bower_components/angular-translate-loader-static-files/angular-translate-loader-static-files.js',
'bower_components/angular-notify-toaster/toaster.js',
'bower_components/bootstrap-datepicker/js/bootstrap-datepicker.js',
'bower_components/sugar/release/sugar.min.js',
'bower_components/jquery-dateFormat/dist/jquery-dateFormat.min.js',
'bower_components/notifyjs/dist/notify-combined.min.js',
'bower_components/angucomplete-alt/angucomplete-alt.js',
'bower_components/angu-fixed-header-table/angu-fixed-header-table.js',
'bower_components/ng-stats/ng-stats.js'
])
    .pipe(concat('build/bower.js'))
    .pipe(gulp.dest('.'))
})
