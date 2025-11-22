FROM node:20-alpine

WORKDIR /app

# Copy cron-service package files
COPY cron-service/package*.json ./

# Install dependencies
RUN npm install

# Create src directory structure
RUN mkdir -p src/jobs src/services/hltv src/services/discord src/services/core src/db

# Copy index.ts
COPY cron-service/src/index.ts ./src/

# Copy only necessary lib folders (exclude chat-related services)
COPY lib/jobs ./src/jobs
COPY lib/services/hltv ./src/services/hltv
COPY lib/services/discord ./src/services/discord
COPY lib/services/core ./src/services/core
COPY lib/db ./src/db

# Copy types folder
COPY types ./types

# Copy tsconfig
COPY cron-service/tsconfig.json ./tsconfig.json

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3000

# Start the service
CMD ["npm", "start"]
