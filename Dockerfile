From node:carbon

WORKDIR /usr/src/app

#COPY package.json .
#COPY package-lock.json .

COPY . .

RUN npm install

EXPOSE 9000

CMD ["npm","run","start-dev"]


# cheatsheet https://gist.github.com/bahmutov/1003fa86980dda147ff6
# docker build -t frank1147/vrsandbox .
# docker -d -it -p 80:9000 run frank1147/vrsandbox
# docker export  xxx > contents.tar
# docker logs xxx
#docker pull frank1147/vrsandbox
