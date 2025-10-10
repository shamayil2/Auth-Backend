require("dotenv").config();
const express = require('express');
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");


const app = express();
const prisma = new PrismaClient();

app.use(express.json());

async function deleteShamayil() {

    try {

        const deleteIt = await prisma.User.delete({
            where: { id: "67f9c162-201d-4caf-917f-33ee3db7252f" },

        });
        console.log("deleted")
    }

    catch (error) {
        console.log("Error occured", error)
    }

}
deleteShamayil();
// Mount auth routes
const authRouter = require('./routes/auth');
app.use('/auth', authRouter);

// Mount profile router (protected)
const profileRouter = require('./routes/profile');
app.use('/profile', profileRouter);


const port = 3000;

app.listen(port, () => {
    console.log("Server running on port ", port)
})