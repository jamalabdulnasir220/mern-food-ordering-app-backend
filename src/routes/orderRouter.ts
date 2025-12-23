import express from 'express'
import { jwtCheck, parseJwt } from '../middleware/auth.js'
import { createCheckoutSession } from '../controllers/orderController.js'

const orderRouter = express.Router()

orderRouter.post("/checkout/create-checkout-session", jwtCheck, parseJwt, createCheckoutSession)

export default orderRouter