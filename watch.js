var async = require('async');
var chokidar = require('chokidar');
var osenv = require('osenv');
var cp = require('child_process');
var nconf = require('nconf');
var slash = require('slash');
var gaze = require('gaze');
var hostile = require('hostile')

var watcher;

var docker_ip;
var cwd = getUnixPath(process.cwd());
var home = getUnixPath(osenv.home());

nconf.env().argv().file('bdsync.json');

nconf.defaults({
  'targetPath': process.cwd(),
  'ignoreFile' : '.gitignore'
});

function execBoot2DockerSshCommands(commands, cb) {
    var sshTerminal = cp.spawn('boot2docker', ['ssh'])

    //var sshTerminal = cp.spawn('boot2docker', ['ssh']);

    //sshTerminal.stderr.on('data', function (data) {
    //    console.error(data.toString());
    //});

    sshTerminal.stdout.on('data', function (data) {
        var stdOutData = data.toString().trim();
        console.log(stdOutData);
    });

    sshTerminal.on('exit', function (code) {
        console.log('ssh finished with code ' + code);
        cb();
    });

    for (var i=0; i<commands.length; i++) {
        sshTerminal.stdin.write(commands[i] + '\n');
    }

    sshTerminal.stdin.end();
}

function execBashCommands(commands, cb) {

    var bashTerminal = cp.spawn('sh')

    //bashTerminal.stderr.on('data', function (data) {
    //    console.error(data.toString());
    //});

    bashTerminal.stdout.on('data', function (data) {
        var stdOutData = data.toString().trim();
        console.log(stdOutData);
    });

    bashTerminal.on('exit', function (code) {
        console.log('bash finished with code ' + code);
        cb();
    });

    for (var i=0; i<commands.length; i++) {
        console.log('Executing command: ' + commands[i]);
        bashTerminal.stdin.write(commands[i] + '\n');
    }

    bashTerminal.stdin.end();
}

function exec(cmd, cb) {
    console.log('Executing: ' + cmd);
    cp.exec(cmd, function (err, stdout) {
        if (err) {
            throw new Error(err);
        }

        if (stdout.trim() != '') {
            console.log(stdout.trim());
        }

        console.log('Executed successfully: ' + cmd);

        if (cb) {
            cb(stdout);
        }
    });
}

function initBoot2Docker(cb) {
    exec('boot2docker status', function(stdout) {
            if (stdout.trim().toLowerCase() != 'running') {
                console.log('boot2docker is not running!');

                exec('boot2docker up', function(stdout) {
                    cb();
                })
            } else {
                cb();
            }
        });
}

function updateHostsFile() {
    hostile.set(docker_ip, 'dnw.services', function (err) {
        if (err) {
            console.error(err)
        } else {
            console.log('set /etc/hosts successfully!')
        }
    })
}

function getBoot2DockerIp(cb) {
    exec('boot2docker ip', function(stdout) {
        docker_ip = stdout.trim();
        cb();
    })
}

function getUnixPath(windowsPath) {
    return slash('/' + windowsPath.replace(':',''));
}

function getSyncCommands() {
    return [
        'eval `ssh-agent -s`',
        'ssh-add ' + home + '/.ssh/id_boot2docker',
        'ssh-keyscan $(boot2docker ip) >> ~/.ssh/known_hosts',
        'chmod 777 ' + home + '/.ssh/id_boot2docker',
        'rsync -av --chmod=ugo=rwX --exclude-from ' + cwd + '/exclude.txt' + ' ./ docker@' + docker_ip + ':' + cwd
    ];
}

function getKillCommand() {
    return 'sudo kill \$(docker top \$(docker ps | grep nancy_instance | awk \'{print \$1}\') | grep mono | awk \'{print \$1}\') 2>&1';
}

function getBuildCommand() {
    return 'docker exec \$(docker ps | grep nancy_instance | awk \'{print \$1}\') xbuild';
}

function getExecCommand() {
    return 'docker exec -d \$(docker ps | grep nancy_instance | awk \'{print \$1}\') mono src/bin/Nancy.Demo.Hosting.Docker.exe';
}

function start(cb) {
    initBoot2Docker(function () {
        getBoot2DockerIp(
            function () {
                //updateHostsFile();

                execBoot2DockerSshCommands(
                    [
                        'tce-load -wi rsync',
                        'sudo mkdir -p ' + cwd + ' && sudo chown docker ' + cwd
                    ],
                    function () {
                        console.log('init ssh callback');

                        var bashCommands = getSyncCommands();
                        //bashCommands.push('\"/C/Program Files/Oracle/VirtualBox/VBoxManage" controlvm \"boot2docker-vm\" natpf1 \"tcp-port8080,tcp,,8080,,45158\"');

                        execBashCommands(
                            bashCommands,
                            function () {
                                console.log('init bash callback');

                                execBoot2DockerSshCommands(
                                    [
                                        'docker stop nancy_instance 2>&1',
                                        'docker rm nancy_instance 2>&1',
                                        'docker rmi nancy_image 2>&1',
                                        'cd ' + cwd,
                                        'docker build -t nancy_image .',
                                        'docker run -d -p 8080:8080 -v ' + cwd + ':/src --name nancy_instance -w \"/src\" -t nancy_image',
                                        'echo docker top \$(docker ps | grep nancy_instance | awk \'{print \$1}\') | grep mono | awk \'{print \$1}\'',
                                        getKillCommand(),
                                        getBuildCommand(),
                                        getExecCommand()
                                    ],
                                    function () {
                                        console.log('init2 ssh callback');

                                        cb();
                                    }
                                )
                            }
                        );
                    });
            })
    });
}

function reSync(cb) {
    execBashCommands(
        getSyncCommands(),
        function() {
            execBoot2DockerSshCommands(
            [
                getKillCommand(),
                getBuildCommand(),
                getExecCommand()
            ],
            function() {
                cb();
            }
        );
    });
}

start(function() {
    gaze('**/*.html', function(err, watcher) {
        // On changed/added/deleted
        this.on('all', function(event, filepath) {
            console.log(filepath + ' was ' + event);

            reSync(function() {
                console.log('refreshed!');
            });
        });
    });
});


process.on('SIGINT', function() {
    console.log('stopping ..');
    watcher.close();
});
