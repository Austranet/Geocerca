FROM node:16
RUN mkdir -p /home/app

COPY . /home/app

WORKDIR /home/app

RUN npm install

EXPOSE 8081

CMD ["npm", "run", "serve"]