FROM node:20
RUN apt-get update -y
RUN apt-get update && \
  apt-get install -y wget gnupg && \
  wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - && \
  sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
  apt-get update && \
  apt-get install -y google-chrome-stable
RUN apt-get install dbus -y

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

ENTRYPOINT ["npm", "run"]
CMD ["serve"]
