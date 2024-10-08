#=====================================================
# Build Stage
#=====================================================

#
# Define OS
#
FROM alpine:3.20 AS build

#
# Basic OS management
#

# Install packages
RUN apk add --no-cache nodejs npm

#
# Require app
#

# Create app directory
WORKDIR /app

# Bundle package.json and package-lock.json
COPY ./package.json ./package-lock.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Bundle application source
COPY . .

#=====================================================
# Image Stage
#=====================================================

#
# Define OS
#
FROM alpine:3.20

#
# Basic OS management
#

# Install packages
RUN apk add --no-cache dumb-init nodejs

#
# Setup app
#

# Create app directory
WORKDIR /app

# Expose app
EXPOSE 3000

# Set node env
ENV NODE_ENV=production

# Setup healthcheck
HEALTHCHECK --interval=5s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/_health || exit 1

# Run app
CMD ["dumb-init", "node", "/app/src/server.js"]

#
# Bundle app
#

# Bundle from build image
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/src ./src
