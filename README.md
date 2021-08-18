# 微信公众号内网穿透工具

> 本着自己动手丰衣足食的精神，整了一个小工具
> 为啥用Node.js(为了照顾广大奋战在windows上的同志们。。跨平台么。。)

## 环境

Node.js 最新版

## 安装

```
git clone git@vcs.51talk.com:zhaojingxian/wxclient.git

npm install
```

## 运行

### 公司内部使用

### 青少服务号(执行命令后访问<https://pi.zhaojingxian.cn/***ept>检查)

```
node client.js pi.zhaojingxian.cn 20001 ****.51talk.com
```


---

### 自己搭建服务

### Server

```
//转发20000端口数据到200001
node server.js 20000 20001

```

### Client

```
//连接外网服务器pi.zhaojingxian.cn的20001端口，将http请求中的Host设置为***.51talk.com
node client.js pi.zhaojingxian.cn 20001 ***.51talk.com
```


