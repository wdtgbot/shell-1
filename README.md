# shell
给🐥的客制化脚本

```
curl -fLsS https://get.docker.com/ | sh
```
```
$Path = $env:TEMP; $Installer = "chrome_installer.exe"; Invoke-WebRequest "http://dl.google.com/chrome/install/375.126/chrome_installer.exe" -OutFile $Path\$Installer; Start-Process -FilePath $Path\$Installer -Args "/silent /install" -Verb RunAs -Wait; Remove-Item $Path\$Installer
```

```
$Path = $env:TEMP; $Installer = "BraveBrowserSetup.exe"; Invoke-WebRequest "https://referrals.brave.com/latest/BraveBrowserSetup.exe" -OutFile $Path\$Installer; Start-Process -FilePath $Path\$Installer -Args "/silent /install" -Verb RunAs -Wait; Remove-Item $Path\$Installer
```


```
apt install fuse -y
nohup rclone mount xinfan:/ /onedrive --config /root/.config/rclone/rclone.conf  --vfs-cache-mode writes  --use-mmap --daemon-timeout=10m --vfs-read-chunk-size 10M --vfs-read-chunk-size-limit 512M --cache-dir /home/rclone/vfs_cache --allow-other  --drive-chunk-size 128M --log-level INFO --log-file /var/log/rclone.log --timeout 1h --umask 002 &
```

```
wget -qO- https://raw.githubusercontent.com/teddysun/across/master/bench.sh | bash
```

```
7zz a -p12345678 name.7z folder -v3g -m5=zstd -mx12 -mhe=on
```

```
rclone --include "*.7z*" move /up od:up --ignore-existing -u -v -P --transfers=6 --ignore-errors --buffer-size=200M --check-first --checkers=10 --onedrive-chunk-size 102400 --user-agent "NONISV|Contoso|GovernanceCheck/1.0"
```

uwp回环
cmd
```
FOR /F "tokens=11 delims=\" %p IN ('REG QUERY "HKCU\Software\Classes\Local Settings\Software\Microsoft\Windows\CurrentVersion\AppContainer\Mappings"') DO CheckNetIsolation.exe LoopbackExempt -a -p=%p
```
PowerShell
```
Get-ChildItem -Path Registry::"HKCU\Software\Classes\Local Settings\Software\Microsoft\Windows\CurrentVersion\AppContainer\Mappings\" -name | ForEach-Object {CheckNetIsolation.exe LoopbackExempt -a -p="$_"}
```

强制删除

```
takeown /F d:\Windows.old\* /R /A /D Y 
cacls d:\Windows.old\*.* /T /grant administrators:F
rmdir /S /Q d:\Windows.old
```

```
nohup commond > /dev/null 2>&1 &
```
