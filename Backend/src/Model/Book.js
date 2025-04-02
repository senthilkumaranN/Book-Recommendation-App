const mongoose = require("mongoose");

const BookUser = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    caption: {
      type: String,
      required: true,
      unique: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    image: {
      type: String,
      required: true,
    },
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
  },
  { timestamps: true }
);


const Book = mongoose.model("Book",BookUser)
module.exports = Book
