//node server.js 20000 20001
var net = require('net');
var uuid = 1;
//包工头(z)
const pack = 'z\n\rz';
const closeClientId = 922922;

var httpPort = parseInt(process.argv[2]);
var tcpPort = parseInt(process.argv[3]);


var config = {
	httpServer : { port: httpPort, host: '127.0.0.1'},
	tcpServer : { port: tcpPort, host: '0.0.0.0'},
};

var socks = [];

//清理无用sock
var clearSock = (type, sock) => {
	for (var i in socks) {

		var flag = false;

		if(type == 'tcp')
		{
			if(socks[i].tcpSocket == sock) {
				flag = true;
				if (socks[i].httpSocket != null) {
                	socks[i].httpSocket.end();
            	}
			}
		} else {
			if(socks[i].httpSocket == sock) {
				flag = true;
				if (socks[i].tcpSocket != null) {
                	socks[i].tcpSocket.end();
            	}
			}
		}

        if (flag) {
            socks[i].httpSocket = null;
            socks[i].tcpSocket = null;
            socks[i].clientId = 0;
            break;
        }
    }
}

var senderSocket = null;

//http服务
var httpSocket = net.createServer(function (sock) {
	if(!senderSocket) return sock.end();

	if(uuid > 65530) {
		uuid = 1;
	}

	//全局唯一ID
	uuid++;
	console.log("Http 请求" + uuid);

	var isInit = false;
	//数组元素复用
	for (var i in socks) {
        if (socks[i].clientId == 0) {
            socks[i].httpSocket = sock;
            socks[i].clientId = uuid;
            isInit = true;
            break;
        }
    }

    //新连接
    if(!isInit) {
    	socks.push({httpSocket: sock, tcpSocket: null, clientId: uuid});
    }

	//http客户端id
	var buffer = new Buffer(4);
	buffer.writeInt32BE(uuid);

	senderSocket.write(pack + buffer);

	sock.on('end', function () {
		clearSock('http', sock);
    })

});


var tcpSocket = net.createServer(function (sock) {

	console.log("tcp sock connect");

	var fristConnect = false;
	sock.on('data', function (data) {
		//首次连接
	    if(data.toString().indexOf(pack) == 0){

    		var clientId = data.readInt32BE(4);

    		if(clientId == 0) {
    			//只运行同时一个连接
    			if(senderSocket) {
    				
    				var buffer = new Buffer(4);
    				buffer.writeInt32BE(closeClientId);
					sock.write(pack + buffer);
		
    				return;
    			}

    			//连接成功
    			var buffer = new Buffer(4);
    			buffer.writeInt32BE(0);
				sock.write(pack + buffer);

    			//长连接客户端
    			senderSocket = sock;
    			senderSocket.on('error', function (err) {
		            senderSocket = null;
		        });
		        senderSocket.on('end', function (data) {
		            senderSocket = null;
		        });
		        return;
    		}

    		if(!fristConnect) {
    			for (var i in socks) {
		        	if(socks[i].clientId == clientId) {
		        		fristConnect = true;
		        		socks[i].tcpSocket = sock;
		        		
		        		socks[i].httpSocket.on('data', function (data) {
	                        sock.write(data);
	                    });
	                    socks[i].httpSocket.on('end', function () {
	                        sock.end();
	                    });
	                    break;
		        	}
		        }
    		}

	    } else {
	    	for (var i in socks) {
                if (socks[i].tcpSocket == sock) {
                    socks[i].httpSocket.write(data);
                    break;
                }
            }
	    }
    });
    
    sock.on('end', function (data) {
    	clearSock('tcp', sock);
        console.log('sock end');
    });
	//}
    
})

httpSocket.listen(config.httpServer.port, config.httpServer.host);
tcpSocket.listen(config.tcpServer.port, config.tcpServer.host);