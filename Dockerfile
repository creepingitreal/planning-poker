# Build Frontend
FROM node:18-alpine AS build-client
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
WORKDIR /app/client
COPY client/package*.json ./
ARG BRAND=scrumble
ENV BRAND=$BRAND
RUN npm install
COPY client/ ./
COPY shared/ /app/shared/
RUN npm run build

# Run the server and serve built frontend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

# Copy server
COPY server/package*.json ./server/
RUN cd server && npm install
COPY server/ ./server/
COPY shared/ ./shared/
ARG BRAND=scrumble
ENV BRAND=$BRAND
COPY client/src/brand/ ./client/src/brand/

# Copy built Vue files from stage 1
COPY --from=build-client /app/client/dist ./client/dist

EXPOSE 8000

CMD ["node", "server/server.js"]