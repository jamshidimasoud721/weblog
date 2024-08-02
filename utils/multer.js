const multer = require("multer");
const uuid = require("uuid").v4;

exports.storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, './public/uploads/')
    },
    filename: (req, file, callBack) => {
        console.log(file);
        callBack(null, `${uuid()}_${file.originalname}`)
    }
});

exports.fileFilter = (req, file, callBack) => {
    if (file.mimetype == "image/jpeg") {
        callBack(null, true);
    } else {
        callBack('فقط پسوند jpeg پشتیبانی می شود.', false);
    }
}

