#!/bin/bash

curl -fsSL https://get.docker.com -o get-docker.sh
source get-docker.sh &
wait
docker pull ghcr.io/shadowsocks/ssserver-rust:latest
