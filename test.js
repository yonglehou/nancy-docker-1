var hostile = require('hostile')

function updateHostsFile() {
    hostile.set('192.168.10.1', 'dnw.services', function (err) {
        if (err) {
            console.error(err)
        } else {
            console.log('set /etc/hosts successfully!')
        }
    })
}

updateHostsFile();
