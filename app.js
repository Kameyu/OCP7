import express from "express";
import mongoose from "mongoose";
import authRouter from "./routes/auth.js";
import booksRouter from "./routes/books.js";
import rateLimit, { MemoryStore } from "express-rate-limit";
import path from "path";
import { expressSharp, FsAdapter } from "express-sharp";
import helmet from "helmet"
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

try {
	await mongoose.connect(process.env.MONGODB_SRV, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	});
	if (mongoose.connection.readyState === 1)
		console.log("[INFO] Connexion à MongoDB réussie !");
} catch (error) {
	console.log("[ERROR] " + error);
}

app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
	);
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
	next();
});

const apiLimiter = rateLimit({
	windowMs: 1000 * 60, // Chaque minute
	max: 60, // 60 requêtes chaque à cycle "windowMs" (ici 60 requêtes par minute);
	standardHeaders: true, // Support des headers standards
	store: new MemoryStore(), // Le store pour enregistrer le compteur de requêtes
	message: "Trop de requêtes API. Patientez une minute puis réessayez.", // Message d'erreur à faire parvenir
});

// set rate limit to the whole api
app.use("/api", apiLimiter);
app.use("/api/auth", authRouter);
app.use("/api/books", booksRouter);
app.use("/images", express.static(path.resolve("./images")));

// Third party programs
app.use(
	"/images",
	expressSharp({
		imageAdapter: new FsAdapter(path.join(path.resolve("."), "images")),
	})
);

app.use(helmet());

export default app;
