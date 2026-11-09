FROM node:18-alpine

WORKDIR /app/server

COPY server/package*.json ./

RUN npm install
COPY server/ ./
COPY shared/ /app/shared/

EXPOSE 8000

CMD ["npm", "start"]
