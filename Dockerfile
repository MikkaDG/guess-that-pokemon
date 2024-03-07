# Base image
FROM node:14

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# Ensure you copy both package.json AND package-lock.json if present
COPY SERVER/package*.json ./
RUN npm install

# Copy the rest of your application code
COPY SERVER/ .

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD [ "node", "server.js" ]
