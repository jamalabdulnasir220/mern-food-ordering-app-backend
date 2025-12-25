import express from 'express'
import { createCurrentUser, getUser, updateUser, updateFavorites } from '../controllers/authController.js'
import { jwtCheck, parseJwt } from '../middleware/auth.js'
import { validateMyRequest } from '../middleware/validation.js'

const authRouter = express.Router()

authRouter.post("/my/user", jwtCheck, createCurrentUser)
authRouter.put("/my/user", jwtCheck, parseJwt, validateMyRequest, updateUser)
authRouter.put("/my/user/favorites", jwtCheck, parseJwt, updateFavorites)
authRouter.get("/my/user", jwtCheck, parseJwt, getUser)


export default authRouter