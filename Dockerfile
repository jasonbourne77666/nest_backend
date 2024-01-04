# build stage
FROM node:18 as build-stage

WORKDIR /app

COPY package.json .

RUN npm config set registry https://registry.npmmirror.com/
RUN npm config set sharp_binary_host=https://npm.taobao.org/mirrors/sharp
RUN npm config set sharp_libvips_binary_host=https://npm.taobao.org/mirrors/sharp-libvips

RUN npm install

COPY . .

RUN npm run build

# production stage
FROM node:18 as production-stage

COPY --from=build-stage /app/dist /app
COPY --from=build-stage /app/package.json /app/package.json

WORKDIR /app

RUN npm install --production

EXPOSE 3000

CMD ["node", "/app/main.js"]
