FROM node:20-bookworm-slim

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3002 5555

RUN npm run prisma:generate && npm run build

CMD ["sh", "-c", "npm run prisma:deploy && npm run start"]
