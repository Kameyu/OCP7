import http from "http";
import app from "./app.js";
import dotenv from "dotenv";
dotenv.config();

app.set("port", process.env.PORT || 3000);
const server = http.createServer(app);

server.listen(process.env.PORT || 3000);

server.on('listening', () => {
	console.log("[INFO] Serveur démarré sur le port : " + process.env.PORT || 3000);
})