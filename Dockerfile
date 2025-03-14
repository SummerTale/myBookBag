# Use Node.js base image
FROM node:16

# Set the working directory inside the container
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the application port (adjust if your app uses a different port)
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
