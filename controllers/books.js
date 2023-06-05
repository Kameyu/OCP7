import Book from "../models/book.js";
import fs from "fs";
import path from "path";

export async function getAllBooks(req, res) {
	try {
		const foundBooks = await Book.find();
		if (foundBooks) {
			res.status(200).json(foundBooks);
		}
	} catch (error) {
		res.status(500).json({
			message: "Impossible de récupérer la liste des livres.",
		});
	}
}

export async function getBook(req, res) {
	try {
		const foundBook = await Book.findOne({ _id: req.params.id });
		if (foundBook) res.status(200).json(foundBook);
	} catch (error) {
		res.status(400).json({
			message: "Ce livre n'existe pas ou a été supprimé.",
		});
	}
}
export async function getBestBooks(req, res) {
	try {
		const foundBooks = await Book.find()
			.sort({ averageRating: "desc" })
			.limit(3);
		if (foundBooks) {
			res.status(200).json(foundBooks);
		}
	} catch (error) {
		res.status(400).json(error);
	}
}

export async function sendBook(req, res) {
	const book = JSON.parse(req.body.book);

	// prévention usurpation, voir userId en dessous
	delete book._id;
	delete book.userId;

	const newBook = new Book({
		...book, // spread operator en cas d'ajout de champs supplémentaires à la requête
		userId: req.auth.userId, // on utilise l'userId du token, pas celui envoyé dans la requête
		ratings: [],
		averageRating: 0,
		imageUrl: `${req.protocol}://${req.get("host")}/images/${
			req.file.filename
		}?f=webp&q=80`, // ajout des options Sharp à l'URL enregistrée
	});

	try {
		const isSaved = await newBook.save();

		if (isSaved)
			res.status(201).json({
				message: "Nouveau livre enregistré avec succès !",
			});
	} catch (error) {
		// On supprime le fichier envoyé si une erreur survient
		if (fs.existsSync("./images/" + req.file.filename)) {
			fs.unlink("./images/" + req.file.filename, async () => {
				res.status(400).json(error);
			});
		}
	}
}

export async function rateBook(req, res) {
	try {
		if (req.body.userId != req.auth.userId) {
			res.status(401).json({
				message: "Vous ne pouvez pas usurper une notation.",
			});
			return;
		}

		const foundBook = await Book.findOne({ _id: req.params.id });

		// Si l'utilisateur a déjà voté pour ce livre, on lui renvoie juste le livre trouvé
		if (
			foundBook.ratings.find(
				(rating) => rating.userId === req.auth.userId
			)
		)
			res.status(304).json(foundBook);
		else {
			let roundedAverage = req.body.rating;

			foundBook.ratings.push({
				userId: req.body.userId,
				grade: req.body.rating, // /!\ book: grade, body: rating /!\
			});

			if (foundBook.ratings.length > 1) {
				// Si > 1 c'est qu'il y avait déjà des notes avant l'ajout de celle-ci
				const ratings = foundBook.ratings.map((rating) => rating.grade); // On fait un tableau des notes
				const sum = ratings.reduce((acc, cur) => acc + cur, 0); // On calcule la somme des notes
				const average = sum / ratings.length; // Simple division pour calculer la moyenne
				roundedAverage = Math.round(average); // On arrondit au chiffre supérieur ou inférieur
			}

			/*  On modifie averageRating après l'ajout de la dernière note
				Si la note ajoutée est la seule, averageRating aura automatiquement la même valeur */
			foundBook.averageRating = roundedAverage;

			const isEdited = await Book.updateOne(
				{ _id: req.params.id },
				foundBook
			);

			if (isEdited) res.status(200).json(foundBook);
			else
				res.status(500).json({
					message: "Le livre n'a pas pu être modifié.",
				});
		}
	} catch (error) {
		res.status(500).json(error);
	}
}

export async function editBook(req, res) {
	try {
		const publishedBook = await Book.findOne({ _id: req.params.id });
		if (!publishedBook)
			res.status(404).json({
				message:
					"La ressource demandée est introuvable ou a été supprimée.",
			});
		else {
			// Si le livre a été trouvé
			if (publishedBook.userId != req.auth.userId)
				res.status(403).json({
					message:
						"Vous n'avez pas la permission de modifier ce livre.",
				});
			else {
				// Si l'utilisateur a la permission de modifier le livre (en est le publieur)
				const requestedEdits = req.file
					? {
							...JSON.parse(req.body.book), // S'il y a une image, le body n'a pas la même forme
							imageUrl: `${req.protocol}://${req.get(
								"host"
							)}/images/${req.file.filename}?f=webp&q=80`,
					  }
					: { ...req.body };

				delete requestedEdits._id;
				delete requestedEdits.userId;
				const isEdited = await Book.updateOne(
					{ _id: req.params.id },
					{ ...requestedEdits }
				);

				if (isEdited) {
					req.file &&
						fs.unlinkSync("./images/" +
								path.basename(publishedBook.imageUrl).split("?")[0]);
					res.status(200).json({
						message:
							"La ressource a été supprimée avec succès !",
					});
				} else {
					res.status(500).json({
						message: "Le livre n'a pas pu être modifié.",
					});
				}
			}
		}
	} catch (error) {
		res.status(500).json({ error });
	}
}

export async function deleteBook(req, res) {
	const publishedBook = await Book.findOne({ _id: req.params.id });
	if (!publishedBook)
		res.status(404).json({
			message:
				"La ressource demandée est introuvable ou a été supprimée.",
		});
	else {
		if (publishedBook.userId != req.auth.userId)
			res.status(403).json({
				message: "Vous n'avez pas la permission de modifier ce livre.",
			});
		else {
			// On peut modifier/supprimer le livre
			try {
				// Supprime le fichier image
				fs.unlink(
					"./images/" +
						path.basename(publishedBook.imageUrl).split("?")[0],
					async () => {
						const isDeleted = await Book.deleteOne({
							_id: req.params.id,
						});
						if (isDeleted.acknowledged) {
							// Suppression effectuée avec succès
							res.status(200).json({
								message: "Livre supprimé avec succès !",
							});
						} else
							res.status(500).json({
								message:
									"La ressource n'a pas pu être supprimée",
							});
					}
				);
			} catch (error) {
				res.status(500).json(error);
			}
		}
	}
}
