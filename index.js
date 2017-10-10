const IPFS = require('ipfs')
var StromDAOBO = require("stromdao-businessobject"); 
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
	console.log(msg);
	if(req.length==66) {
		var storage = require("node-persist");		
		storage.initSync();	
		var res=new Buffer(JSON.stringify(storage.getItemSync(req)));		
		if(typeof res!="undefined") {
				ipfs.pubsub.publish(msg.topicCIDs[0], res, (err) => {
						console.log("SND",msg.topicCIDs[0],res,err);			
				})
		}
	}	
}

function publish() {
	
	var storage = require("node-persist");
	var fs = require("fs");
	storage.initSync();
	values=storage.keys();
	var tmp = {};
	ext_ids=[];
	for (var k in values){
		if (values.hasOwnProperty(k)) {			
			if(values[k].length==66) {				
				tmp[""+values[k]]=storage.getItemSync(""+values[k]);	
				console.log(values[k]);
			}
			
			if(values[k].substr(0,4)=="ext:") {
				ext_ids.push(values[k].substr(4));
			}
		}
	}	
	if(ext_ids.length>0) {
		for(var i=0;i<ext_ids.length;i++) {
			var node = new StromDAOBO.Node({external_id:ext_ids[i],testMode:true,abilocation:"https://cdn.rawgit.com/energychain/StromDAO-BusinessObject/master/smart_contracts/"});	  			
			ipfs.pubsub.subscribe(ext_ids[i], receiveMsg);
			ipfs.pubsub.subscribe(node.wallet.address, receiveMsg);
			console.log("Providing",node.wallet.address);
		}
	}
}




ipfs.on('ready', () => {
  // Your node is now ready to use \o/
	
	publish();
	
	ipfs.swarm.connect("/ip4/108.61.210.201/tcp/4001");
	ipfs.swarm.connect("/ip4/45.32.155.49/tcp/4001");
	console.log("Node Ready");
})

