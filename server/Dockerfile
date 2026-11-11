FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

WORKDIR /app/server

COPY server/package*.json ./

RUN npm install
COPY server/ ./
COPY shared/ /app/shared/
COPY client/src/brand/tokens.css /app/client/src/brand/tokens.css

EXPOSE 8000

CMD ["npm", "start"]
