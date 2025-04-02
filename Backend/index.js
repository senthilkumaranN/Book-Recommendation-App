require("dotenv").config();
const express = require("express");
const connectdb = require("./src/Database/index");
const Authrouter = require("../Backend/src/Router/AuthRouter");
const bookrouter = require("../Backend/src/Router/BookRouter");
const cors = require("cors");

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: ["http://localhost:3000", "http://10.0.2.2:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);





const PORT = process.env.PORT;
connectdb();

app.use("/api/auth", Authrouter);
app.use("/api/book", bookrouter);

app.listen(3000,"0.0.0.0", () => {
  console.log(`server is running on ${PORT}`);
});
