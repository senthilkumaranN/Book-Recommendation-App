const jwt = require("jsonwebtoken");
const User = require("../Model/User");
require("dotenv").config();

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorised user!",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SCERT_KEY);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) return res.status(401).json({ message: "Token is not valid" });
    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Token error",
    });
  }
};

module.exports = authMiddleware;
