boot2docker init
boot2docker up

DOCKER_IP=$(boot2docker ip)
PWD=$(pwd)

# Setup working directory on b2d host and install rsync
boot2docker ssh "sudo mkdir -p $PWD && sudo chown docker $PWD"
boot2docker ssh "tce-load -wi rsync"

# rsync the working directory to b2d host
eval `ssh-agent -s`
ssh-add ~/.ssh/id_boot2docker
ssh-keyscan $DOCKER_IP >> ~/.ssh/known_hosts

chmod 777 ~/.ssh/id_boot2docker
rsync -av --chmod=ugo=rwX --exclude-from 'exclude.txt' ./ docker@$DOCKER_IP:$(pwd)

boot2docker ssh "docker stop nginx_instance;
		docker rm nginx_instance;
		docker rmi jbijlsma/nginx;
		docker build -t jbijlsma/nginx github.com/jbijlsma/nginx;
		docker run --name nginx_instance -d -p 80:80 jbijlsma/nginx"

boot2docker ssh "docker stop nancy_instance;
		docker rm nancy_instance;
		docker rmi nancy_image;
		cd $PWD;
		docker build -t nancy_image .;
		docker run -d -p 5312:8080 -v $PWD:/src --name nancy_instance -w "/src" -t nancy_image;
		NANCY_CONTAINER_ID=\$(docker ps | grep nancy_instance | awk '{print \$1}');
		echo container_id = \$NANCY_CONTAINER_ID;
		sudo kill \$(docker top \$NANCY_CONTAINER_ID | grep mono | awk '{print \$1}');
		docker exec \$NANCY_CONTAINER_ID xbuild;
		docker exec -d \$NANCY_CONTAINER_ID mono src/bin/Nancy.Docker.exe"