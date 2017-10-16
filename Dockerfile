#FROM node:8.6.0
FROM zenato/puppeteer
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
RUN npm run build
CMD node index.js
EXPOSE 8081
