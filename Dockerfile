#FROM node:8.6.0
FROM zenato/puppeteer
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
RUN mkdir /root/.secrets
COPY mail-a-tweet.env /root/.secrets
COPY mail-a-tweet-gcloud.json /app
RUN npm run build
CMD NODE_ENV=production node server.js
EXPOSE 8080
