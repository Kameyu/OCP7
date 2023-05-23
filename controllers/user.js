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
			// Mot de passe hashé avec succès, on essaie d'enregistrer l'user dans la BDD
			const isSaved = await user.save();
			if (isSaved)
				res.status(201).json({ message: "Utilisateur créé !" });
		} catch (error) {
			// Impossible d'enregistrer l'user dans la BDD : HTTP 500
			res.status(500).json(error);
		}
	} catch (error) {
		// Erreur de hash ou d'enregistrement : HTTP 500
		res.status(500).json(error);
	}
}

export async function login(req, res) {
	const user = await User.findOne({ email: req.body.email });
	if (!user) {
		// Si l'utilisateur n'existe pas
		res.status(401).json({
			message: "Paire identifiant/mot de passe incorrecte",
		});
	} else {
		// Utilisateur trouvé, vérification du mot de passe ensuite
		try {
			const valid = await bcrypt.compare(req.body.password, user.password);
			if (!valid) {
				res.status(401).json({
					message: "Paire identifiant/mot de passe incorrecte",
				});
			} else { // Token valide, authentification de l'utilisateur : on lui transmet le token et son ID
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
