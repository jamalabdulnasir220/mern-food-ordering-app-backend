import express from 'express'
import { createCurrentUser, getUser, updateUser } from '../controllers/authController.js'
import { jwtCheck, parseJwt } from '../middleware/auth.js'
import { validateMyRequest } from '../middleware/validation.js'

const authRouter = express.Router()

authRouter.post("/my/user", jwtCheck, createCurrentUser)
authRouter.put("/my/user", jwtCheck, parseJwt, validateMyRequest, updateUser)
authRouter.get("/my/user", jwtCheck, parseJwt, getUser)


export default authRouter