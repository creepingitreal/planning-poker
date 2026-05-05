# Build Frontend
FROM node:18-alpine AS build-client
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Run the server and serve built frontend
FROM node:18-alpine
WORKDIR /app

# Copy server
COPY server/package*.json ./server/
RUN cd server && npm install
COPY server/ ./server/

# Copy built Vue files from stage 1
COPY --from=build-client /app/client/dist ./client/dist

EXPOSE 8000

CMD ["node", "server/server.js"]