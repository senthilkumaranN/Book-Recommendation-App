const express = require('express')
const {register,login} = require('../controller/Authcontroller')


const AuthRouter = express.Router()


AuthRouter.post("/register",register)
AuthRouter.post("/login",login)


module.exports = AuthRouter