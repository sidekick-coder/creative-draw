ARG NODE_IMAGE=node:18.18.0-alpine

# Base
FROM $NODE_IMAGE AS base

RUN apk add --update --no-cache \
    make \
    g++ \
    jpeg-dev \
    cairo-dev \
    giflib-dev \
    pango-dev \
    libtool \
    autoconf \
    automake

RUN mkdir -p /home/node/app && chown node:node /home/node/app
WORKDIR /home/node/app
USER node

# Dependencies
FROM base AS dependencies

COPY --chown=node:node ./package*.json ./
RUN npm ci
COPY --chown=node:node . .

# Build
FROM dependencies AS build
RUN npm run build

# Production
FROM base AS production
ENV NODE_ENV=production
ENV PORT=$PORT
ENV HOST=0.0.0.0
COPY --chown=node:node ./package*.json ./
RUN npm ci --production
COPY --chown=node:node --from=build /home/node/app/.output .

EXPOSE $PORT

CMD [ "node", "server/index.mjs" ]
