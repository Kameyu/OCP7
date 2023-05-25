import express from "express";
import multerInstance from "../middleware/multer-config.js";
import auth from "../middleware/auth.js";
import {
	getAllBooks,
	getBestBooks,
	getBook,
	sendBook,
	rateBook,
	editBook,
	deleteBook,
} from "../controllers/books.js";

const booksRouter = express.Router();

booksRouter.get("/", getAllBooks);
booksRouter.get("/bestrating", getBestBooks);
booksRouter.get("/:id", getBook);

booksRouter.post("/", auth, multerInstance, sendBook);
booksRouter.post("/:id/rating", auth, rateBook)

booksRouter.put("/:id", auth, multerInstance, editBook);

booksRouter.delete("/:id", auth, deleteBook);

export default booksRouter;
