#!/bin/bash


docker run --name ss \
--restart always \
-p 39723:8388/tcp \
-p 39723:8388/udp \
-v /root/ss/config.json:/etc/shadowsocks-rust/config.json \
-dit ghcr.io/shadowsocks/ssserver-rust:latest
