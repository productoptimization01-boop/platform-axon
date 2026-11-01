# Use Node.js as the base image
FROM node:24

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of your application
COPY . .

# Build the Next.js application
RUN npm run build

# Set the command to run your app
CMD ["npm", "start"]

# Expose the application port
EXPOSE 3000