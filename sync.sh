DOCKER_IP=$(boot2docker ip)
PWD=$(pwd)

# rsync the working directory to b2d host
eval `ssh-agent -s`
ssh-add ~/.ssh/id_boot2docker
rsync -av --chmod=ugo=rwX --exclude-from 'exclude.txt' ./ docker@$DOCKER_IP:$(pwd)

boot2docker ssh "NANCY_CONTAINER_ID=\$(docker ps | grep nancy_instance | awk '{print \$1}');
		sudo kill \$(docker top \$NANCY_CONTAINER_ID | grep mono | awk '{print \$1}');
		docker exec \$NANCY_CONTAINER_ID xbuild;
		docker exec -d \$NANCY_CONTAINER_ID mono src/bin/Nancy.Docker.exe"