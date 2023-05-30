import multer from "multer";
import fs from "fs"

const storage = multer.diskStorage({
	destination: (req, file, callback) => {
		if (!fs.existsSync("./images"))
			fs.mkdirSync("./images");
		callback(null, "./images");
	},
	filename: (req, file, callback) => {
		const newName = Date.now() + '-' + file.originalname.replace(" ", "_");
		callback(null, newName);
	},
});

const multerInstance = multer({ storage: storage }).single("image");

export default multerInstance;
