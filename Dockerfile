FROM node:18

WORKDIR /usr/src/eazyrooms_orders_service

COPY package*.json ./

COPY . .

RUN npm install

EXPOSE 3009

CMD ["node", "server.js"]