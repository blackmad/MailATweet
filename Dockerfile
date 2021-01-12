#FROM node:8.6.0
FROM zenato/puppeteer
USER root
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
RUN npm run build
CMD NODE_ENV=production node server.js
EXPOSE 8080
