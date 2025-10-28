FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Clean install without cache
RUN npm cache clean --force && \
    npm install --no-optional --legacy-peer-deps

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Start the server
CMD ["npm", "run", "server"]

