FROM node:18.20.4
WORKDIR /usr/src/app
COPY . /usr/src/app/
RUN npm install
EXPOSE 3008
ENTRYPOINT [ "npx", "tsx", "server.ts" ]