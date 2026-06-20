FROM node:20-slim

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

RUN node scripts/build-db.js && npm run build

EXPOSE 3000

CMD ["npm", "run", "serve"]
