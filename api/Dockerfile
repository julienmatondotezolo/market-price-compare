FROM node:15.0.1-alpine3.10

WORKDIR /Users/ByGoldY 1/Library/Multec3/DEV V/eindstuk/market-price-compare/api

COPY package*.json ./

RUN npm install

COPY . .

CMD ["npm",  "start"]