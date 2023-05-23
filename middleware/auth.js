import * as Jwt from "jsonwebtoken";
import dotenv from "dotenv"
dotenv.config();

export async function auth(req, res) {
	try {
		console.log(req.header.authorization);
		const token = req.header.authorization.split(' ')[1];
		const decodedToken = Jwt.verify(token, process.env.API_SECRET);
		const userId = decodedToken.userId;
		req.auth = {
			userId: userId
		};
	}
	catch(error) {
		res.status(401).json(error);
		console.log(error);
	}
}

export default auth;