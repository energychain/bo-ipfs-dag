#!/usr/bin/env node

const IPFS = require('ipfs')
const ipfs = new IPFS({
  init: true, // default
  
  start: true,
  
  EXPERIMENTAL: { // enable experimental features
    pubsub: true,
    sharding: true, // enable dir sharding
    dht: true // enable KadDHT, currently not interopable with go-ipfs
  },  
  libp2p: { // add custom modules to the libp2p stack of your node
    modules: {}
  }
})

const receiveMsg = (msg) => {	
	var req=msg.data.toString();
	console.log("FROM",msg.from);
	if(req.length==66) {
		var storage = require("node-persist");		
		storage.initSync();	
		var res=storage.getItemSync(req);		
		if(typeof res!="undefined") {
				ipfs.pubsub.publish(msg.topicCIDs[0], new Buffer(JSON.stringify(res)), (err) => {
						console.log("SND",msg.topicCIDs[0],res,err);			
				})
		}
	}	 else {
		console.log(req);	
	}
}




ipfs.on('ready', () => {
  // Your node is now ready to use \o/
	
	ipfs.swarm.connect("/ip4/108.61.210.201/tcp/4002/ipfs/QmPSrr2c4bWCZ7R6N2tGR8Pj3CK7uWVtANtEZSb8Tptfsv");
	ipfs.pubsub.subscribe("stromdao-query", receiveMsg);
	setInterval(function() {	
	ipfs.pubsub.publish("stromdao-query",new Buffer("0x9d3544a49d0940a7923b7c109165d246e62f20f7d628edf3e3cb0e1184121d06"),(err) => { console.log("SEND"); });
	},5000);
	console.log("Node Ready");
})

