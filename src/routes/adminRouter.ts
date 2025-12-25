import express from "express";
import { jwtCheck, parseJwt } from "../middleware/auth.js";
import { adminCheck } from "../middleware/auth.js";
import { getRestaurantManagers, updateApplicationStatus } from "../controllers/adminController.js";

const router = express.Router();

router.get("/managers", jwtCheck, parseJwt, adminCheck, getRestaurantManagers);
router.put("/managers/:userId/status", jwtCheck, parseJwt, adminCheck, updateApplicationStatus);

export default router;
