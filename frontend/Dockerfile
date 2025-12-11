# Use official Nginx image
FROM nginx:1.25-alpine

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy your custom config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy static files (ex: Vite build output)
# 미리 로컬에서: npm install && npm run build → dist/ 생성
COPY dist/ /usr/share/nginx/html

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
