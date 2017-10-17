#FROM node:8.6.0
FROM zenato/puppeteer
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
RUN mkdir ~/.secrets
COPY mail-a-tweet.env ~/.secrets
RUN npm run build
CMD node server.js
EXPOSE 8080
