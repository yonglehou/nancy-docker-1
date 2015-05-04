Demo project for hosting Nancy and Mono inside a Docker container
=================================================================

Install

- VirtualBox 4.3.20 r96997. Later versions don't work properly for me. Ssh sessions for example are not stable.
- Boot2Docker 1.6.0
- Copy mingw rsync files from acrhive http://github.com/jbijlsma/nancy-docker/tools/mingw-rsync-3.0.8-1.zip to C:\Program Files (x86)\Git\bin (do not overwrite existing files!)

Run

- doubleclick Boot2Docker Start icon on your desktop
- Bash: $ sh.exe init.sh

Call nancy service

- Browser: http://$(boot2docker ip)
- Bash: $ curl $(boot2docker ip):80

Manual resync

- Bash: $ sh.exe sync.sh

or

- Bash: $ cd src
- Bash: $ npm run docker

Node watching 

- Bash: $ node watch.js

or

- Bash: $ cd src
- Bash: $ npm run docker:watch


Consul

docker run -d -h node -p 8500:8500 -p 8600:53/udp progrium/consul -server -bootstrap -advertise 192.168.59.103 -log-level debug
docker run -d -v /var/run/docker.sock:/tmp/docker.sock -h 192.168.59.103 progrium/registrator consul://192.168.59.103:8500

frontend consul: http://dnw.services:8500/ui/#/dc1/services/consul

--------------------------------------------------------------------

$ docker run -d -p 80:80 -v /var/run/docker.sock:/tmp/docker.sock -t jwilder/nginx-proxy
docker run -d -e VIRTUAL_HOST=foo.bar.com -p 8081:80 nginx

--------------------------------------------------------------------

docker build -t="drcon" github.com/grahamjenson/DR-CoN

docker run -it -e "CONSUL=192.168.59.103:8500" -e "SERVICE=simple" -p 80:80 drcon

docker run -d -e "SERVICE_NAME=simple" -p 8081:80 nginx
docker run -d -e "SERVICE_NAME=simple" -p 8082:80 nginx

while true; do curl 192.168.59.103:80; sleep 1; done

--------------------------------------------------------------------