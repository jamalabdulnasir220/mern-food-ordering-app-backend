import express from 'express'
import { jwtCheck, parseJwt } from '../middleware/auth.js'
import { createCheckoutSession, stripeWebhookHandler } from '../controllers/orderController.js'

const orderRouter = express.Router()

orderRouter.post("/checkout/create-checkout-session", jwtCheck, parseJwt, createCheckoutSession)

orderRouter.post("/checkout/webhook", stripeWebhookHandler)

export default orderRouter