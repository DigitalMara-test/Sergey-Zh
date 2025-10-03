FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

CMD ["sh", "-c", "npm run db:migrate && npm run dev"]

EXPOSE 3000
