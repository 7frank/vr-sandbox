From node:carbon

WORKDIR /usr/src/app

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY . .WORKDIR

EXPOSE 8080
EXPOSE 9000

CMD ["npm","start"]



