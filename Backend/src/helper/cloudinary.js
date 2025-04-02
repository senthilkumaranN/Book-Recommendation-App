const cloudinary = require('cloudinary').v2
const multer = require('multer')
require('dotenv').config()


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})


const storage = new multer.memoryStorage();

const ImageUploadUtil = async (base64Image) => {
    try {
      // ✅ Ensure base64Image is in the correct format
      if (!base64Image.startsWith("data:image")) {
        throw new Error("Invalid Base64 format. Make sure it starts with 'data:image/'.");
      }
  
      const result = await cloudinary.uploader.upload(base64Image, {
        folder: "book_images",
      });
  
      return { url: result.secure_url }; // Ensure the URL is returned
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      throw new Error("Cloudinary upload failed");
    }
  };
  


const upload = multer({ storage });

module.exports = { upload, ImageUploadUtil}