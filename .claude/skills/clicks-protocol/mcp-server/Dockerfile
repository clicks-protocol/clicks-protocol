FROM node:22-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY dist/ ./dist/
EXPOSE 3000
ENV NODE_ENV=production
ENTRYPOINT ["node", "dist/index.js"]
