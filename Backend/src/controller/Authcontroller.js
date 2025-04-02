const User = require("../Model/User.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if (!username || !email || !password) {
      return res.status(409).json({
        success: false,
        message: "All fileds are required",
      });
    }

    if (password.length < 6) {
      return res.json({
        success: false,
        message: "password must be in length of 6",
      });
    }

    const existinguser = await User.findOne({ username });

    if (existinguser) {
      return res.status(409).json({
        success: false,
        message: "Username already exist",
      });
    }

    const existingemail = await User.findOne({ email });

    if (existingemail) {
      return res.status(409).json({
        success: false,
        message: "User Email already exist",
      });
    }

    const hashedpassword = await bcrypt.hash(password, 12);

    const profileImage = `https://api.dicebear.com/9.x/personas/svg?seed=${username}`;
    const newlyUser = new User({
      username,
      password: hashedpassword,
      email,
      profileImage,
    });

    await newlyUser.save();
    if (newlyUser) {
      return res.status(201).json({
        success: true,
        user: username,
        message: "user register is successfully done",
      });
    }
  } catch (e) {
    console.log("Error while register", e);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const checkUser = await User.findOne({ email });

    if (!checkUser) {
      return res.status(409).json({
        success: false,
        message: "email doesn't exist",
      });
    }

    const ispasswordMatch = await bcrypt.compare(password, checkUser.password);

    if (!ispasswordMatch) {
      return res.status(409).json({
        success: false,
        message: "password did'nt match",
      });
    }

    const token = jwt.sign(
      {
        id: checkUser._id,
        username: checkUser.username,
        email: checkUser.email,
        profileImage: checkUser.profileImage,
      },
      "JWT_SCERT_KEY",
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json({
      success: true,
      message: "user Logedin Successfully",
      token,
      user: {
        id: checkUser._id,
        username: checkUser.username,
        email: checkUser.email,
        profileImage: checkUser.profileImage,
        createdAt: checkUser.createdAt,
      },
    });
  } catch (e) {
    console.log("Error while register", e);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = { register, login };
