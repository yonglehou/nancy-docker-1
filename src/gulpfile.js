var gulp = require('gulp');
var del = require('del');
var argv = require('yargs').argv;
var run = require('gulp-run');

gulp.task('run_container', [], function () {
    //run('sh.exe --login -i /c/tmp/test2.sh', { usePowerShell: true, cwd: 'c:\\tmp' }).exec();
    //run('c:/tmp/test2.ps1', { usePowerShell: true }).exec();
    //run('START /WAIT powershell "C:\\tmp\\test2.ps1"', { usePowerShell: false }).exec();
    //return run('c:/tmp/test2.bat', { usePowerShell: false }).exec();
    //return run('START powershell "C:\\Program Files\\Boot2Docker for Windows\\start.sh"').exec();
    //return run('sh.exe --login -i .\\start.sh', { usePowerShell: true, cwd: 'C:\\Program Files\\Boot2Docker for Windows' }).exec();
    //return run('start.sh', { usePowerShell: true, cwd:'C:\\Program Files\\Boot2Docker for Windows' }).exec();
    return run('.\\test2.sh', { usePowerShell: true, cwd: 'C:\\tmp' }).exec();
});

gulp.task('default', function () {
    return gulp.watch("**/*.cs", ['run_container']);
});