FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

WORKDIR /app/server

COPY server/package*.json ./

RUN npm install
COPY server/ ./
COPY shared/ /app/shared/
ARG BRAND=scrumble
ENV BRAND=$BRAND
COPY client/src/brand/ /app/client/src/brand/

EXPOSE 8000

CMD ["npm", "start"]
