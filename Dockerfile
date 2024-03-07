# Base image
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Assuming your SERVER directory is at the root of your repository,
# and you are copying it correctly, adjust the path as necessary.

# Copy both package.json AND package-lock.json if available
# Make sure to adjust this if your structure is different
COPY server/package*.json ./

# Install dependencies
RUN npm install

# Now copy the rest of your server's source code
COPY server/ ./

# Expose the port your app runs on
EXPOSE 3000

# Specify the command to run your app
CMD ["node", "server.js"]
