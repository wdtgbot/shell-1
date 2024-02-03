1.  切换到root账号

`sudo -i`

2.  设置root密码(可略过)

`passwd root`

3.  打开ssh配置文件

`vi /etc/ssh/sshd_config`

4.  修改或添加下面配置

`PermitRootLogin yes`  
`PubkeyAuthentication yes`

[![](https://img2023.cnblogs.com/blog/3117309/202304/3117309-20230401171043190-2137591737.png)
](https://img2023.cnblogs.com/blog/3117309/202304/3117309-20230401171043190-2137591737.png)

5.  编辑认证文件authorized_keys

`vi /root/.ssh/authorized_keys`

[![](https://img2023.cnblogs.com/blog/3117309/202304/3117309-20230401171131034-477112069.png)
](https://img2023.cnblogs.com/blog/3117309/202304/3117309-20230401171131034-477112069.png)

删除：

`no-port-forwarding,no-agent-forwarding,no-X11-forwarding,command="echo 'Please login as the user \"linux1\" rather than the user \"root\".';echo;sleep 10;exit 142"`

只删掉这段，后面ssh那一大堆不要删

6.  然后wq保存退出，这样就可以新建会话使用root账户进行登录了。
