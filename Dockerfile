FROM node:20-alpine

WORKDIR /app

# Copy cron-service package files
COPY cron-service/package*.json ./

# Install dependencies
RUN npm install

# Copy shared lib folder (needed for symlinks)
COPY lib ./lib

# Copy cron-service source
COPY cron-service/src ./src
COPY cron-service/tsconfig.json ./tsconfig.json

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3000

# Start the service
CMD ["npm", "start"]
