# Use the official Node.js image with Alpine
FROM node:alpine3.18

# Install build dependencies
RUN apk add --no-cache \
    autoconf \
    automake \
    build-base \
    libtool \
    nasm \
    zlib-dev

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json ./
RUN npm install

# Copy the rest of your application code
COPY . .

# Expose the port your app will run on
EXPOSE 8080

# Command to run your app
CMD ["npm", "start"]