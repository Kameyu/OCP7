import * as Jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export async function auth(req, res) {
	try {
		console.log(req.header.authorization);
		const token = req.header.authorization.split(" ")[1];
		const decodedToken = Jwt.verify(token, process.env.API_SECRET);
		req.auth = {
			// On modifie le header pour y ajouter le userId (user._id)
			userId: decodedToken.userId,
		};
	} catch (error) {
		res.status(401).json(error);
		console.log(error);
	}
}

export default auth;
