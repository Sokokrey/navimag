import mosca from 'mosca'
import http from 'http';

var settings = { port : 1883 }
var broker = new mosca.Server(settings)
var httpServer = http.createServer();

broker.attachHttpServer(httpServer);
httpServer.listen(9001);

broker.on('ready', ()=>{
    console.log('MOSCA CONNECTED');
})

broker.on('published', (packet, meesage)=>{
    let topic = packet.topic;
    switch (topic) {
        case 'epale':
            console.log(JSON.parse(packet.payload.toString()));
        break;
    }
})

export default broker;