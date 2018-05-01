From node:carbon

WORKDIR /usr/src/app

#COPY package.json .
#COPY package-lock.json .

COPY . .

RUN npm install
RUN npm run build

RUN npm prune --production


EXPOSE 9000

CMD ["npm","run","dev"]


# cheatsheet https://gist.github.com/bahmutov/1003fa86980dda147ff6
# docker build -t frank1147/vrsandbox .
# docker run -d -it -p 80:9000 frank1147/vrsandbox ## detached /no log
# docker run        -p 80:9000 frank1147/vrsandbox ##
# docker export  xxx > contents.tar
# docker logs xxx
#docker container prune ## delete all containers that are currently not running
#docker pull frank1147/vrsandbox

# heroku deploy docker container
# https://medium.com/travis-on-docker/how-to-run-dockerized-apps-on-heroku-and-its-pretty-great-76e07e610e22
