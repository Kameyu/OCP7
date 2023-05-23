import multer from "multer";

const MIME_TYPES = {
	"image/jpg": "jpg",
	"image/jpeg": "jpeg",
	"image/png": "png"
};

const storage = multer.diskStorage({
	destination: (req, file, callback) => {
		callback(null, 'images'); // dans le dossier "./images"
	},
	filename: (req, file, callback) => {
		const name = file.originalname.replace(' ', '_');
		const extension = MIME_TYPES[file.mimetype];
		callback(null, name + Date.now() + '.' + extension);
	}
});

export default multer({ storage }).single('image');