import express from 'express'
import { jwtCheck, parseJwt } from '../middleware/auth.js'

const orderRouter = express.Router()

orderRouter.post("/checkout/create-checkout-session", jwtCheck, parseJwt)