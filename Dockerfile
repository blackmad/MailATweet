#FROM node:8.6.0
FROM zenato/puppeteer
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
CMD node index.js
EXPOSE 8081
