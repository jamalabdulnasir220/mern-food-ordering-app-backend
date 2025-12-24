import express from 'express'
import { jwtCheck, parseJwt } from '../middleware/auth.js'
import { createCheckoutSession, getMyOrder, stripeWebhookHandler } from '../controllers/orderController.js'

const orderRouter = express.Router()

orderRouter.post("/checkout/create-checkout-session", jwtCheck, parseJwt, createCheckoutSession)

orderRouter.post("/checkout/webhook", stripeWebhookHandler)

orderRouter.get("/", jwtCheck, parseJwt, getMyOrder)

export default orderRouter