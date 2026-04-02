FROM node:22-slim
WORKDIR /app

# Copy MCP server package
COPY mcp-server/package*.json ./
RUN npm ci --production

# Copy compiled MCP server
COPY mcp-server/dist/ ./dist/

# MCP server listens on stdio by default, expose HTTP for remote
EXPOSE 3000
ENV NODE_ENV=production

# Start the MCP server
ENTRYPOINT ["node", "dist/index.js"]
