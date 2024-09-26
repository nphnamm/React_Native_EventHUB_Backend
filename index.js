const express = require("express");
const cors = require("cors");
const authRouter = require("./src/routers/authRouter");
const connectDB = require("./src/configs/connectDb");

const app = express();
require("dotenv").config();

const PORT = 3001;
app.get("/hello", (_req, res) => {
  res.send("<h1>Hello world!</h1>");
});

app.use(cors());
app.use(express.json());

app.use("/auth", authRouter);

connectDB();

app.listen(PORT, (err) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log(`Server starting at http://localhost:${PORT}`);
});
