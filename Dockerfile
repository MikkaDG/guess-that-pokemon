# Base image
FROM node:14

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
# Copy server package.json and install dependencies
COPY SERVER/package.json ./
RUN npm install


# Copy the rest of your application code
COPY SERVER/. ./

# Build the client application
# This step is assumed to be unnecessary in your case as you serve static files directly
# Adjust if you have a build step for your client

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD [ "node", "server.js" ]
