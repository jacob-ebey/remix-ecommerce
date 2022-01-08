FROM node:17-bullseye-slim as base

ENV NODE_ENV=production
ENV PORT=8080

# install all node_modules, including dev
FROM base as deps

RUN mkdir /app/
WORKDIR /app/

ADD package.json package-lock.json ./
RUN npm install --production=false

# install only production modules
FROM deps as production-deps

WORKDIR /app/

RUN npm prune --production=true

## build the app
FROM deps as build

WORKDIR /app/

ADD . .
RUN npm run build

## copy over assets required to run the app
FROM base

RUN mkdir /app/
WORKDIR /app/

# ADD prisma .

COPY --from=production-deps /app/node_modules /app/node_modules
COPY --from=production-deps /app/package.json /app/package.json
COPY --from=production-deps /app/package-lock.json /app/package-lock.json
COPY --from=build /app/build /app/build
COPY --from=build /app/public /app/public

EXPOSE 8080

CMD ["npm", "start"]