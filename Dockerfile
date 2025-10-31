FROM node:20-slim

WORKDIR /app

# Copy package files first
COPY package.json package-lock.json ./

# Install dependencies with clean slate
RUN rm -rf node_modules && \
    npm cache clean --force && \
    npm install --production

# Copy rest of application
COPY . .

# Expose the port
EXPOSE 3000

# Start command using npm script
CMD ["npm", "run", "server"]
