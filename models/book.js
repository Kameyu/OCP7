import { Schema, model } from "mongoose";

const ratingSchema = Schema({
	_id: false,
	userId: { type: String, required: true },
	grade: { type: Number, required: true },
});

const bookSchema = Schema({
	userId: { type: String, required: true },
	title: {type: String, required: true },
	author: {type: String, required: true },
	imageUrl: {type: String, required: true },
	year: {type: Number, required: true },
	genre: {type: String, required: true },
	ratings: [ratingSchema],
	averageRating: {type: Number, required: true },
});


export default model("Book", bookSchema);