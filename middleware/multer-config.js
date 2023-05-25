import multer from "multer";

const storage = multer.diskStorage({
	destination: (req, file, callback) => {
		callback(null, "./images");
	},
	filename: (req, file, callback) => {
		const newName = Date.now() + '-' + file.originalname.replace(" ", "_");
		callback(null, newName);
	},
});

const multerInstance = multer({ storage: storage }).single("image");

export default multerInstance;
