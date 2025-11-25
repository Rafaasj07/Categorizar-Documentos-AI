# Define a imagem base do Node.js (versão 22) como ponto de partida.
FROM node:22

# Instala o Tesseract OCR, necessário para ler texto de imagens, com suporte para português.
RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    tesseract-ocr-por

# Define o diretório de trabalho principal dentro do container.
WORKDIR /usr/src/app

# Copia os arquivos de definição de dependências para o container.
# Isso otimiza o build, aproveitando o cache do Docker.
COPY package*.json ./

# Instala as dependências do projeto listadas no package.json.
RUN npm install

# Copia todo o código-fonte restante da aplicação para o container.
COPY . .

# Informa ao Docker que o container irá expor a porta 3001.
EXPOSE 3001

# Define o comando padrão para ser executado quando o container iniciar.
CMD [ "node", "server.js" ]