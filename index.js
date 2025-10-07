require("dotenv").config();
const express = require('express');
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");


const app = express();
const prisma = new PrismaClient();

app.use(express.json());


// Mount auth routes
const authRouter = require('./routes/auth');
app.use('/auth', authRouter);

// Mount profile router (protected)
const profileRouter = require('./routes/profile');
app.use('/profile', profileRouter);


const port = 3000;

app.listen(port,()=>{
    console.log("Server running on port ",port)
})