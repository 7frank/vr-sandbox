From node:carbon

WORKDIR /usr/src/app

#COPY package.json .
#COPY package-lock.json .

COPY . .


RUN npm install


ENV NODE_ENV production

#building client and server code
RUN npm run build-server-dist  #order matters as we copy the clioutput in this step
RUN npm run build-client-dist


 # remove dev dependencies and stuff
# RUN npm prune --production TODO  test locally and  change package.json accordingly
RUN rm /usr/src/app/src/assets/ -r

EXPOSE 9000


CMD ["npm","run","start-dist"]


# cheatsheet https://gist.github.com/bahmutov/1003fa86980dda147ff6
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
