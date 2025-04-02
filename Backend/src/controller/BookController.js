const Book = require("../Model/Book");
const { ImageUploadUtil } = require("../helper/cloudinary");
const cloudinary = require("cloudinary").v2;
const mongoose = require("mongoose");

const handleImageUpload = async (req, res) => {
  try {
    console.log("Uploaded File:", req.file);

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded!" });
    }

    const b64 = req.file.buffer.toString("base64");
    const mimeType = req.file.mimetype;
    const base64Image = `data:${mimeType};base64,${b64}`;
    const result = await ImageUploadUtil(base64Image);

    res.json({ success: true, url: result.url });
  } catch (error) {
    console.error("Image Upload Error:", error);
    res.status(500).json({ success: false, message: "Error occurred while uploading image" });
  }
};

const addBook = async (req, res) => {
  try {
    const { title, caption, rating, image } = req.body;
    console.log("📥 Received Body:", req.body); 
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    if (!title || !caption || !rating || !image) {
      return res.status(400).json({ success: false, message: "Please provide all fields" });
    }

    const newBook = new Book({ title, caption, rating, image, user: req.user._id });
    await newBook.save();
    res.status(201).json({ success: true, data: newBook, message: "New Book Added Successfully" });
  } catch (error) {
    console.error("Error adding book:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getBooksByUser = async (req, res) => {
  try {
    const books = await Book.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getBooks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;
    
    const books = await Book.find().sort({ createdAt: -1 }).skip(skip).limit(limit).populate("user", "username profileImage");
    const totalBooks = await Book.countDocuments();
    
    res.json({ books, currentPage: page, totalBooks, totalPages: Math.ceil(totalBooks / limit) });
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const editBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, caption, rating, image } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid book ID" });
    }

    const updatedBook = await Book.findByIdAndUpdate(id, { title, caption, rating, image }, { new: true });
    if (!updatedBook) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    res.status(200).json({ success: true, data: updatedBook, message: "Book Edited Successfully" });
  } catch (error) {
    console.error("Error updating book:", error);
    res.status(500).json({ success: false, message: "Error occurred while updating book" });
  }
};



const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate the ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid Book ID" });
    }

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ success: false, message: "Book not found" });
    }

    // Ensure only the owner can delete the book
    if (!req.user || book.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Delete book image from Cloudinary if it exists
    if (book.image && book.image.includes("cloudinary")) {
      try {
        const public_id = book.image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(public_id);
      } catch (error) {
        console.error("Error deleting image from Cloudinary:", error);
      }
    }

    await book.deleteOne();
    res.status(200).json({ success: true, message: "Book deleted successfully" });
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};


module.exports = { handleImageUpload, addBook, getBooks, getBooksByUser, editBook, deleteBook };
