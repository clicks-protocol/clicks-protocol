FROM node:22-slim
WORKDIR /app
COPY mcp-server/package*.json ./
RUN npm ci --production
COPY mcp-server/dist/ ./dist/
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
