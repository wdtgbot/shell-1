#!/bin/bash


bash <(curl -fsSL https://get.docker.com) &
wait
docker pull ghcr.io/shadowsocks/ssserver-rust:latest
