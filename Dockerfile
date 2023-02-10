FROM alpine:3.15

COPY . /workflows
WORKDIR /

CMD ["/workflows"]