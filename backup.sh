#!/bin/bash
# 定义GOOGLE DRIVE的备份目录
GD_PATH="backup:Backup"

# 定义备份的目录及文件，不同的目录用空格分开
BACKUP_SRC="/root/*"

# 定义临时文件存放目录
BACKUP_DST="/home/Backup"

# 设置MYSQL基本信息 
#MYSQL_SERVER="localhost"
#MYSQL_USER="root"
#MYSQL_PASS="your password"

# 定义想要备份的数据库，多个数据库用空格分开
#BACKUP_DATABASE="typecho_omo"

# 定义文件前缀名
NOW=$(date +"%Y.%m.%d")
OLD=$(date -d -5day +"%Y.%m.%d")

# 备份网站数据文件
zip -r $BACKUP_DST/auto_fileData_$NOW.zip $BACKUP_SRC

# 备份mysql数据库
#mysqldump -u $MYSQL_USER -h $MYSQL_SERVER -p$MYSQL_PASS --databases $BACKUP_DATABASE > $BACKUP_DST/$NOW-auto-Databases.sql

# 使用rclone上传到google drive
rclone copy -v --stats 15s --bwlimit 40M $BACKUP_DST/ --include "$NOW-auto-Databases.sql" --include "auto_fileData_$NOW.zip" $GD_PATH

# 删除本地的临时文件
rm -f $BACKUP_DST/$NOW-auto-Databases.sql $BACKUP_DST/auto_fileData_$NOW.zip

# 删除5天前的备份
rclone delete $GD_PATH/ --include "$OLD-auto-Databases.sql" --include "auto_fileData_$OLD.zip"
