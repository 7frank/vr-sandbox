# cheatsheet https://gist.github.com/bahmutov/1003fa86980dda147ff6
# https://medium.com/@ijayakantha/docker-cheat-sheet-726d750ef52c
# docker build -t frank1147/vrsandbox .
# docker run -d -it -p 80:9000 frank1147/vrsandbox ## detached /no log
# docker run        -p 80:9000 frank1147/vrsandbox ##
# docker export  xxx > contents.tar
# docker logs xxx
#docker container prune ## delete all containers that are currently not running
#docker image prune  ## same for images
#docker pull frank1147/vrsandbox

# heroku deploy docker container
# https://medium.com/travis-on-docker/how-to-run-dockerized-apps-on-heroku-and-its-pretty-great-76e07e610e22

## one liners to stop and remove all containers (use in power shell if windows user)
# docker stop $(docker ps -a -q)
# docker rm $(docker ps -a -q)

## access console
# docker exec -it <id|name> <command>
