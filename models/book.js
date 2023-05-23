import { Schema, model } from "mongoose";

const bookSchema = Schema({
	userId: { type: String, required: true },
	title: {type: String, required: true },
	author: {type: String, required: true, default: 'Auteur inconnu' },
	imageUrl: {type: String, required: true, default: '' },
	year: {type: Number, required: true, default: 0 },
	genre: {type: String, required: true, default: 'Pas de genre' },
	ratings: [
		{
			userId: {type: String, required: false, default: '' },
			grade: {type: Number, required: false, default: 0 },
		},
	],
	averageRating: {type: Number, required: false, default: 0 },
});

export default model("Book", bookSchema);