#!/bin/bash

# 要检查和追加的cron作业
cronjob1="13 7 * * * /root/1.sh  >> /var/log/startag.log 2>&1"
cronjob2="13 5 * * * /root/2.sh"

# 临时文件用于存储当前的crontab内容
temp_cron=$(mktemp /tmp/crontab.XXXXXX)

# 保存当前crontab到临时文件
crontab -l > "$temp_cron"

# 检查crontab中是否已存在cronjob1
if ! grep -Fq "$cronjob1" "$temp_cron"; then
    echo "$cronjob1" >> "$temp_cron"
    echo "Cron job $cronjob1 has been added."
fi

# 检查crontab中是否已存在cronjob2
if ! grep -Fq "$cronjob2" "$temp_cron"; then
    echo "$cronjob2" >> "$temp_cron"
    echo "Cron job $cronjob2 has been added."
fi

# 如果至少有一个cron作业被添加，则更新crontab
if grep -Fq "$cronjob1" "$temp_cron" || grep -Fq "$cronjob2" "$temp_cron"; then
    crontab "$temp_cron"
fi

# 删除临时文件
rm "$temp_cron"
