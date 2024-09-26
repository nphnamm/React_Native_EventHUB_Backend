const UserModel = require("../models/userModel");

const bcrypt = require("bcrypt");
const asyncHandle = require("express-async-handler");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: process.env.USERNAME_EMAIL,
    pass: process.env.PASSWORD_EMAIL,
  },
});
const getJsonWebToken = async (email, id) => {
  const payload = {
    email,
    id,
  };
  const token = jwt.sign(payload, process.env.SECRET_KEY, {
    expiresIn: "7d",
  });
  return token;
};
const handleSendMail = async (val) => {
  try {
    await transporter.sendMail(val);
  } catch (error) {
    return error;
  }
};
const register = asyncHandle(async (req, res) => {
  const { fullname, email, password } = req.body;
  const existingUser = await UserModel.findOne({ email });

  if (existingUser) {
    res.status(400);
    throw new Error("User has already exist!!!");
  }
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const newuser = new UserModel({
    email,
    fullname: fullname ?? "",
    password: hashedPassword,
  });
  await newuser.save();
  res.status(200).json({
    message: "Register new user successfully",
    data: {
      email: newuser.email,
      id: newUser._id,
      accesstoken: await getJsonWebToken(email, newUser.id),
    },
  });
});
const login = asyncHandle(async (req, res) => {
  const { email, password } = req.body;
  const existingUser = await UserModel.findOne({ email });
  if (!existingUser) {
    res.status(403);
    throw new Error("User not found!!!");
  }
  const isMatchPassword = await bcrypt.compare(password, existingUser.password);
  if (!isMatchPassword) {
    res.status(401);
    throw new Error("Email or Password is not correct");
  }
  res.status(200).json({
    message: "Login Sucessfully",
    data: {
      id: existingUser.id,
      email: existingUser.email,
      accesstoken: await getJsonWebToken(email, existingUser.id),
      fcmToken: existingUser.fcmTokens ?? [],
      photo: existingUser.photoUrl ?? "",
      name: existingUser.name ?? "",
    },
  });
});

module.exports = {
  register,
  login,
};
