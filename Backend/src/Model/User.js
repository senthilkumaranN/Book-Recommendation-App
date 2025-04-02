const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    profileImage:{
        type: String,
        default:""
    }
},{timestamps: true})

const user = mongoose.model("User", userSchema )
module.exports = user;