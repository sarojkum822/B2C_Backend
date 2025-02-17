import express from "express"
import authenicateUser from "../middleware/authHandler.js"
import { 
    newOrder,
    getAllOrders,
    getorderDetailsbyId,
} from "../controllers/orderController.js"
const router = express.Router()

router.route("/order").post( newOrder) //authenicateUser,
router.route("/order").get(getAllOrders);
router.route("/orderdetails/:id").get(getorderDetailsbyId);

//router.route("/test").get(findNearbyOutlets)

export default router
