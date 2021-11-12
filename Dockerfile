FROM node:14

LABEL org.opencontainers.image.source="https://github.com/lgorman/rhomis-authenticator"

# Create the app directory
WORKDIR /usr/src/rhomis-authenticator

# Install packages
COPY package*.json ./
RUN npm install

# Copy the app source code
COPY . .

EXPOSE 3002

CMD ./node_modules/.bin/cross-env NODE_ENV=prod node ./app.js




