eval `ssh-agent -s`
ssh-add ~/.ssh/id_boot2docker


rsync -av --chmod=ugo=rwX --exclude-from 'exclude.txt' ./ docker@$(boot2docker ip 2>/dev/null):$(pwd)

boot2docker ssh "sudo kill \$(docker top \$(docker ps | grep nancy_instance | awk '{print \$1}') | grep mono | awk '{print \$1}');
		docker exec \$(docker ps | grep nancy_instance | awk '{print \$1}') xbuild;
		docker exec -d \$(docker ps | grep nancy_instance | awk '{print \$1}') mono src/bin/Nancy.Demo.Hosting.Docker.exe"