//node client.js pi.zhaojingxian.cn 20001 junior.51talk.com
var net = require('net');
var open = require("open");
const closeClientId = 922922;
//包工头(z)
const pack = 'z\n\rz';

var tcpHost = process.argv[2];
var tcpPort = parseInt(process.argv[3]);
var domain = process.argv[4];


var clientSocket = new net.Socket();

clientSocket.setKeepAlive(true);

clientSocket.connect(tcpPort, tcpHost, () => {
    console.log('正在连接远程服务器...');

    //长连接客户端
    var buffer = new Buffer(4);
    buffer.writeInt32BE(0);

    clientSocket.write(pack + buffer);
});

clientSocket.on('data',function(data){

    //非正常连接关闭
    if(data.toString().indexOf(pack) != 0) {
        clientSocket.end();
    }

    var clientId = data.readInt32BE(4);

    if(clientId == 0) {
        console.log('远程服务器连接成功，转发域名为:' + domain + '，开始愉快的调试吧！');
        if(domain == 'wap.51talk.com')
        {
            open("https://pi.zhaojingxian.cn/***");
            return;
        }

        if(domain == 'junior.51talk.com')
        {
            open("https://pi.zhaojingxian.cn/***");
            return;
        }
        return;
    }

    if(clientId == closeClientId) {
        console.log('\033[31m当前端口正在使用中，请联系你的猪队友\033[39m');
        clientSocket.end();
        return;
    }

    console.log('clientId:' + clientId);

    var tmpClientSocket = new net.Socket();
    var localSocket = new net.Socket();


    tmpClientSocket.connect(tcpPort, tcpHost,function(){
        console.log('开启新连接请求tcp server');

        var buffer = new Buffer(4);
        buffer.writeInt32BE(clientId);

        //服务器你好，我是的客户端ID是
        tmpClientSocket.write(pack + buffer);

        localSocket.connect(80, domain,function(){
            //console.log(domain);
        });

        localSocket.on('data',function(data){
            tmpClientSocket.write(data)
            console.log('localSocket data status')
        });

        localSocket.on('end',function(data){
            console.log('localSocket end status');
            tmpClientSocket.end();
        });

        localSocket.on('error', (err) => {
            console.error('localSocket error:' + err.message);
        });
    });

    tmpClientSocket.on('data',function(data){
        var data = data.toString().replace(/(\r\n[Hh]ost: )\S+/, "\r\nHost: " + domain);
        localSocket.write(data);
        console.log('tmpClientSocket data status')
    });

    tmpClientSocket.on('end',function(data){
        console.log('tmpClientSocket end status');
        localSocket.end();
    });

});

clientSocket.on('error', (err) => {
    console.error('error:' + err.message);
});

clientSocket.on('end', () => {
    console.log('clientSocket end');
});

console.log('启动中...')