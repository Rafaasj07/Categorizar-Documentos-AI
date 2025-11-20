FROM node:22

# Instala Tesseract OCR com suporte ao idioma português
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-por

WORKDIR /usr/src/app

COPY package*.json ./

# Instala as dependências do projeto
RUN npm install

COPY . .

EXPOSE 3001

# Inicializa o servidor
CMD [ "node", "server.js" ]