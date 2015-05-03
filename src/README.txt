npm config ls -l --global

However, to override the default shell parameter, you can add (or edit) an npmrc file to the 

\Users\yourusername\AppData\Roaming\npm\etc directory. Just add the following line:

shell = "C:\\Program Files (x86)\\git\\bin\\bash.exe"

cd /c/Users/jeroen/Documents/Visual\ Studio\ 2013/Projects/nancy-demo-hosting-docker

//docker build /c/Users/jeroen/Documents/Visual\ Studio\ 2013/Projects/nancy-demo-hosting-docker

cp -a /c/Users/jeroen/Documents/Visual\ Studio\ 2013/Projects/nancy-demo-hosting-docker/. src/

cd src

docker build -t nancy_image .

docker run -d -p 45158:8080 --name nancy_instance -t nancy_image

docker stop nancy_instance; 
docker rm nancy_instance; 
docker rmi nancy_image

rm -r src -f

sudo /usr/local/etc/init.d/nfs-client start
sudo umount /c/Users
sudo mount 192.168.178.29:/Users/jeroen c/home/docker/jeroen -o rw,async,noatime,rsize=32768,wsize=32768,proto=tcp

vagrant global-status | grep docker-host

mono src/bin/Nancy.Demo.Hosting.Docker.exe

--------------------------------------

docker exec $(docker ps | grep "nancy_instance" | awk '{print $1}') xbuild

$(docker top $(docker ps | grep "nancy_instance" | awk '{print $1}') | grep "mono" | awk '{print $1}')

docker exec -d $(docker ps | grep "nancy_instance" | awk '{print $1}') mono src/bin/Nancy.Demo.Hosting.Docker.exe

sudo kill $(docker top $(docker ps | grep "nancy_instance" | awk '{print $1}') | grep "mono" | awk '{print $1}')