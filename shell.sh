#!/bin/bash
sudo apt update
sudo apt install curl wget -y
sh <(curl -fsSL https://get.docker.com)
echo net.core.default_qdisc=fq >> /etc/sysctl.conf
echo net.ipv4.tcp_congestion_control=bbr >> /etc/sysctl.conf
