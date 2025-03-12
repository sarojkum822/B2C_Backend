import express from "express";
import authenicateUser from "../middleware/authHandler.js";
import {
    newOrder,
    getAllOrders,
    getorderDetailsbyId,
    cancelOrder,
    getShippingCharge,
    updateShippingCharge,
} from "../controllers/orderController.js";

const router = express.Router();

router.route("/order").post(newOrder);
router.route("/order").get(getAllOrders);
router.route("/orderdetails/:id").get(getorderDetailsbyId);
router.route("/order/:orderId").post(cancelOrder);

// Shipping charge endpoints
router.route("/shipping").get(getShippingCharge);
router.route("/shipping").post(updateShippingCharge); // Add authenicateUser middleware for admin security

export default router;