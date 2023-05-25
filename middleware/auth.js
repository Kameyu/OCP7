import * as Jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export async function auth(req, res, next) {
	try {
		const token = req.headers.authorization.split(" ")[1]; // [0] = "Bearer", [1] = "token"
		const decodedToken = Jwt.verify(token, process.env.API_SECRET);
		req.auth = {
			// On modifie le header pour y ajouter le userId (user._id)
			userId: decodedToken.userId,
		};
		next();
	} catch (error) {
		res.status(403).json(error);
	}
}

export default auth;
