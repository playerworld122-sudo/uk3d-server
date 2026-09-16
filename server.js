const { WebSocketServer } = require('ws');
const PORT = process.env.PORT || 3000;
const wss = new WebSocketServer({ port: PORT });
const rooms = new Map();
const TTL = 30000;

function broadcast(msg){const s=JSON.stringify(msg);for(const c of wss.clients)if(c.readyState===1)c.send(s);}
function prune(){const n=Date.now();let ch=false;for(const [code,r] of rooms)if(n-r.ts>TTL){rooms.delete(code);ch=true}if(ch)broadcast({t:'list',list:[...rooms.values()]});}
setInterval(prune,5000);

wss.on('connection',ws=>{
ws.on('message',raw=>{
let m;try{m=JSON.parse(raw)}catch{return}
if(m.t==='register'){
rooms.set(m.code,{code:m.code,name:m.name,nick:m.nick,wave:m.wave,started:m.started,since:m.since,ts:Date.now()});
broadcast({t:'list',list:[...rooms.values()]});
}else if(m.t==='unregister'){
rooms.delete(m.code);
broadcast({t:'list',list:[...rooms.values()]});
}else if(m.t==='list'){
ws.send(JSON.stringify({t:'list',list:[...rooms.values()]}));
}
});
ws.on('close',()=>{});
});
console.log('Server started on port '+PORT);