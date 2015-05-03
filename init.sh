boot2docker init
boot2docker up

export DOCKER_HOST=tcp://$(boot2docker ip 2>/dev/null):2375

# Setup working directory on b2d host and install rsync
boot2docker ssh "sudo mkdir -p `pwd` && sudo chown docker `pwd`"
boot2docker ssh "tce-load -wi rsync"

# rsync the working directory to b2d host
eval `ssh-agent -s`
ssh-add ~/.ssh/id_boot2docker
ssh-keyscan $(boot2docker ip) >> ~/.ssh/known_hosts

chmod 777 ~/.ssh/id_boot2docker
rsync -av --chmod=ugo=rwX --exclude-from 'exclude.txt' ./ docker@$(boot2docker ip 2>/dev/null):$(pwd)
# rsync -av --chmod=ugo=rwX --exclude-from 'exclude.txt' --rsh=ssh -i ~/.ssh/id_boot2docker -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no ./ docker@$(boot2docker ip 2>/dev/null):$(pwd)

boot2docker ssh "docker stop nancy_instance;
		docker rm nancy_instance;
		docker rmi nancy_image;
		cd /C/Projects/nancy-docker;
		docker build -t nancy_image .;
		docker run -d -p 5312:8080 -v /C/Projects/nancy-docker:/src --name nancy_instance -w "/src" -t nancy_image;
		sudo kill \$(docker top \$(docker ps | grep nancy_instance | awk '{print \$1}') | grep mono | awk '{print \$1}');
		docker exec \$(docker ps | grep nancy_instance | awk '{print \$1}') xbuild;
		docker exec -d \$(docker ps | grep nancy_instance | awk '{print \$1}') mono src/bin/Nancy.Docker.exe"