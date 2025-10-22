const express = require("express")
const { registerUser, loginUser, userProfile } = require("../controllers/userController.js")
const authentication = require("../middleware/authenticateToken.js")
const userRouter = express.Router()

userRouter.post("/api/users/register", registerUser)
userRouter.post("/api/users/login", loginUser)

userRouter.get("/api/users/profile",authentication, userProfile)

module.exports =userRouter