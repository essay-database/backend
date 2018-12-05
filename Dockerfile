FROM node:11
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --only=prod
COPY . .
EXPOSE 8080
CMD [ "npm" , "start"]
