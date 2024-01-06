FROM node:18.19.0-alpine3.18 as build-stage

WORKDIR /app

COPY package.json .
COPY .env.development .
COPY .env.production .
COPY .npmrc .

RUN npm config set registry https://registry.npmmirror.com/

RUN npm install

COPY . .

RUN npm run build

# production stage
# FROM node:18.19.0-alpine3.18 as production-stage

# COPY --from=build-stage /app/dist /app
# COPY --from=build-stage /app/package.json /app/package.json
# COPY --from=build-stage /app/.env.development /app/.env.development
# COPY --from=build-stage /app/.env.production /app/.env.production
# COPY --from=build-stage /app/.npmrc /app/.npmrc

# WORKDIR /app

# RUN npm config set registry https://registry.npmmirror.com/

# RUN npm install

EXPOSE 3000

CMD ["npm", "run", "start:prod"]