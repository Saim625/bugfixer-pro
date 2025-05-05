const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "bugfixer", 
    allowed_formats: ["jpg", "png", "jpeg", "gif", "pdf", "docx", "txt", "log", "zip"],
  },
});

module.exports = storage;
