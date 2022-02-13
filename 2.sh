#!/bin/bash


bash <(curl -fsSL https://get.docker.com) &
wait

mkdir ss
touch /root/ss/config.json
cat << EOF > /root/ss/config.json
{
"server": "0.0.0.0",
"server_port": 8388,
"password": "99b5a05f-43a1-4138-96b2-4c6d03052253",
"method": "chacha20-ietf-poly1305"
}
EOF

docker run --name ss \
--restart always \
-p 39723:8388/tcp \
-p 39723:8388/udp \
-v /root/ss/config.json:/etc/shadowsocks-rust/config.json \
-dit ghcr.io/shadowsocks/ssserver-rust:latest
