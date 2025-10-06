require("dotenv").config();
const express = require('express');
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");


const app = express();
const prisma = new PrismaClient();

app.use(express.json());


// ~~~~~Auth Code Starts here~~~~~ //


//Generate token
function generateToken(userId) {
     console.log("JWT_SECRET:", process.env.JWT_SECRET); 
  const token= jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
  console.log(token)
  return token

}
// Middleware to protect routes
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "No token" });

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(403).json({ message: "Invalid or expired token" });
  }
}

app.post("/signup", async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const existing = await prisma.User.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.User.create({ data: { email, password: hashed, name } });

    const token = generateToken(user.id);
    res.json({ message: "Signup successful", token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.User.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user.id);
    res.json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Protected route
app.get("/profile", authMiddleware, async (req, res) => {
  const user = await prisma.User.findUnique({ where: { id: req.userId } });
  if (!user) return res.status(404).json({ message: "User not found" });

  res.json({ id: user.id, email: user.email, name: user.name });
});


const port = 3000;

app.listen(port,()=>{
    console.log("Server running on port ",port)
})