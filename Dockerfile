FROM node:20-alpine

WORKDIR /app

# Copy cron-service package files
COPY cron-service/package*.json ./

# Install dependencies
RUN npm install

# Copy the actual lib folders (not symlinks)
COPY lib ./lib

# Create src directory and copy index.ts
COPY cron-service/src/index.ts ./src/

# Create the job folders by copying from lib
RUN mkdir -p src/jobs src/services src/db
COPY lib/jobs ./src/jobs
COPY lib/services ./src/services
COPY lib/db ./src/db

# Copy tsconfig
COPY cron-service/tsconfig.json ./tsconfig.json

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3000

# Start the service
CMD ["npm", "start"]
