import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export async function signup(req, res) {
	try {
		const hash = await bcrypt.hash(req.body.password, 10);
		if (!hash) {
			throw "Unable to hash password";
		}
		const user = new User({
			email: req.body.email,
			password: hash,
		});
		try {
			// Password hashed, try to save used to DB
			const isSaved = await user.save();
			if (isSaved)
				res.status(201).json({ message: "Utilisateur créé !" });
		} catch (error) {
			// Cannot save user, HTTP 500
			res.status(500).json(error);
		}
	} catch (error) {
		// Cannot hash or save user, HTTP 500
		res.status(500).json(error);
	}
}

export async function login(req, res) {
	const user = await User.findOne({ email: req.body.email });
	if (user === null) {
		// Si l'utilisateur n'existe pas
		res.status(401).json({
			message: "Paire identifiant/mot de passe incorrecte",
		});
	} else {
		// User found, check password validity next
		try {
			const valid = await bcrypt.compare(req.body.password, user.password);
			if (!valid) {
				res.status(401).json({
					message: "Paire identifiant/mot de passe incorrecte",
				});
			} else { // User login success, valid token
				res.status(200).json({
					userId: user._id,
					token: jwt.sign(
						{ userId: user._id },
						process.env.API_SECRET,
						{ expiresIn: "24h" }
					),
				});
			}
		} catch (error) {
			res.status(500).json(error);
			console.log(error);
		}
	}
}
