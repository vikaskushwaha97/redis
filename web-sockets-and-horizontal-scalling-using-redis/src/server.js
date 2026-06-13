import http from "node:http";
import{WebSocketServer} from "ws";
import fs from "node:fs";


const PORT = process.env.PORT || 9000;

const httpServer = http.createServer(async function  (req, res) {
    const indexFile = fs.readFileSync("./index.html");
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(indexFile); 

}) 
const wsServer = new WebSocketServer({ server: httpServer });

wsServer.on("connection", (websocket) => {
    console.log("New client connected....");

    websocket.send("pong! , hello from the server")    


    websocket.on("message", (message) => {
        console.log(`Received message: ${message.toString()}`);
        wsServer.clients.forEach((clients)=>
        clients.send(message.toString()));
    });
});

httpServer.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
