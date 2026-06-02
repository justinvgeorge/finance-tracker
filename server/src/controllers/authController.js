const prisma = require("../prismaClient.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const { name: reqName, email: reqEmail, password: reqPassword } = req.body;
    const userExist = await prisma.user.findUnique({
      where: {
        email: reqEmail,
      },
    });
    if (userExist) {
      res.status(409).json({ message: "This email address already exists" });
      return;
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(reqPassword, salt);
    const newUser = await prisma.user.create({
      data: {
        name: reqName,
        email: reqEmail,
        password: hashedPassword,
      },
    });
    res.status(201).json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Something went wrong with register API",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email: reqEmail, password: reqPassword } = req.body;
    if (!reqEmail) {
      res.status(401).json({ message: "Unauthorized, no email provided" });
      return;
    }
    const userExist = await prisma.user.findUnique({
      where: {
        email: reqEmail,
      },
    });
    if (!userExist) {
      res.status(401).json({ message: "Unauthorized, invalid email" });
      return;
    }
    const passwordMatch = await bcrypt.compare(reqPassword, userExist.password);
    if (!passwordMatch) {
      res.status(401).json({ message: "Unauthorized, invalid credentials" });
      return;
    }
    const token = await jwt.sign({ id: userExist.id }, process.env.JWT_SECRET, {
      expiresIn: "2d",
    });
    res.status(200).json({
      id: userExist.id,
      email: userExist.email,
      token: token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Something went wrong with login API",
      error: error.message,
    });
  }
};

module.exports = {
  register,
  login,
};
