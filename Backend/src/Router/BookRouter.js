const express = require("express");
const {
  handleImageUpload,
  getBooksByUser,  // ✅ Ensure it's correctly imported
  addBook,
  getBooks,
  deleteBook,
  editBook,
} = require("../controller/BookController");

const  authmiddleware  = require("../Middleware/index");  

const { upload } = require("../helper/cloudinary");

const bookrouter = express.Router();

// Define routes
bookrouter.get("/getbook", authmiddleware, getBooks);
bookrouter.post(
  "/uploadimage",
  authmiddleware,
  upload.single("image"),
  handleImageUpload
);
bookrouter.post("/addbook", authmiddleware, addBook);
bookrouter.get("/user", authmiddleware, getBooksByUser);
bookrouter.put("/edit/:id", authmiddleware, editBook);
bookrouter.delete("/delete/:id", authmiddleware, deleteBook);

module.exports = bookrouter;
