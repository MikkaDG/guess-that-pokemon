# Base image
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Copy server's package.json and package-lock.json
COPY server/package*.json ./

# Install server dependencies
RUN npm install

# Copy the rest of the server's source code
COPY server/ ./

# Copy client application to a directory within /usr/src/app
COPY client/ ./client/

# Expose the port your app runs on
EXPOSE 3000

# Specify the command to run your app
CMD ["node", "server.js"]
