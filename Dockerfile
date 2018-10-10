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
