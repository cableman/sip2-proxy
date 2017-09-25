FROM node:8

## Allow node to run on ports below 1024
RUN apt-get update -y && \
	apt-get install libcap2-bin

RUN setcap 'cap_net_bind_service=+ep' /usr/local/bin/node

RUN useradd --user-group --create-home --shell /bin/false app

ENV HOME=/home/app

COPY package.json package-lock.json $HOME/proxy/
RUN chown -R app:app $HOME/*

USER app
WORKDIR $HOME/proxy
RUN npm install --quiet

CMD ["npm", "run", "start-dev"]
