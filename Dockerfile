# ======= development ========

FROM node:22-alpine AS development

WORKDIR /app

RUN corepack enable

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

CMD ["yarn", "start:dev"]

# ======= build ========

FROM node:22-alpine AS builder

WORKDIR /app

RUN corepack enable

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

RUN yarn prisma generate

RUN yarn build

# ======== production ========

FROM node:22-alpine AS production

WORKDIR /app

RUN corepack enable

COPY package.json yarn.lock ./

RUN yarn install --production

COPY --from=builder /app/dist ./dist

COPY --from=builder /app/generated ./generated

EXPOSE 3000

CMD ["node", "dist/main.js"]