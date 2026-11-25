FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

WORKDIR /app/client

ARG VITE_SERVER_URL
ENV VITE_SERVER_URL=$VITE_SERVER_URL
ARG BRAND=scrumble
ENV BRAND=$BRAND

COPY client/ ./
COPY shared/ /app/shared/

RUN npm install && \
    npm run build

# Stage 2: serve with nginx
# Example of multistage image build
FROM nginx:alpine
COPY --from=builder /app/client/dist /usr/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
