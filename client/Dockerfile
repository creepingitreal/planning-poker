FROM node:18-alpine AS builder

WORKDIR /app

COPY . .

RUN npm install && \
    npm run build

# Stage 2: serve with nginx
# Example of multistage image build
FROM nginx:alpine
COPY --from=builder /app/dist usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
