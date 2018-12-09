#From node:carbon
From frank1147/vrsandbox-backend-slim
#From tarampampam/node:alpine

WORKDIR /usr/src/app
#TODO when using backend container babel-cli is missing? although node carbon is the same base image
#RUN npm install -g babel-cli

#COPY package.json .
#COPY package-lock.json .

COPY . .

#TODO
ENV NODE_ENV development
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

#TODO heroku needs cmd instead of entrypoint
#TODO have all services run and not get -2 exit code
#TODO bind sandbox service to port when running as service

# TODO heroku: port already used.. indicates that strapi might use the given port and sandbox wants to bind to the same
# TODO if everything fails check out strapi studio and see if thes is an alternative to a separate headless version on a differnt server which we then can connect to


#COPY ./supervisord.conf /etc/supervisor/supervisord.conf

#CMD ["bash", "/opt/bin/supervisord.sh"]


