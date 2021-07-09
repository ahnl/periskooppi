FROM node:lts-alpine

WORKDIR /usr/src/app

RUN apk --update add fontconfig ttf-ubuntu-font-family
COPY . .
RUN npm install --platform=linux

CMD ["npm", "start"]