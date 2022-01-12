FROM node:lts-alpine3.15
ARG DATABASE_URL

WORKDIR /usr/src/app

RUN apk update && apk upgrade

COPY package.json .
COPY package-lock.json .

RUN npm ci

COPY . .

ENV DATABASE_URL ${DATABASE_URL}

EXPOSE 3000

ENTRYPOINT npx prisma db push && npm run build && npm run start:prod