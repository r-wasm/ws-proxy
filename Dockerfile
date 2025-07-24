FROM ubuntu:plucky

RUN apt-get update -y &&\
    apt-get install -y websockify dante-server ssl-cert

COPY danted.conf /etc/danted.conf

SHELL ["/bin/bash", "-c"]

RUN adduser --gecos "" --disabled-password test && chpasswd <<<"test:yolo"

EXPOSE 7777

CMD service danted start && websockify -v 7777 localhost:1080 --cert /etc/ssl/certs/ssl-cert-snakeoil.pem --key /etc/ssl/private/ssl-cert-snakeoil.key
