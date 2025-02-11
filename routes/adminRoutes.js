import express from "express"

import multer from "multer"

import { CloudinaryStorage } from'multer-storage-cloudinary';
import {cloudinary} from "../utils/cloudinary.js";


import {
  newOutlet,
  createOutletPartner,
  deleteOutletPartner,
  customerInsights,
  deliveryInsights,
  getAllOutletsWithOrderAndPartners,
  getOneOutlet,
  approveDelivery,
  getProductCount,
  changeProductprice,
  getAllProducts,
  getOutletPartners,


  //order------------
  deleteOrder,
  filteringOrders,
  //outlet--------------
  deleteOutlet,

  //delivery partner----------
  getApprovedDP,
  getDeliveryPartner,
  createDP,
  deleteDP,

  getAllCountInformation,
} from "../controllers/adminController.js"

import authenicateUser from "../middleware/authHandler.js"
import { getFirestore } from "firebase-admin/firestore";

const router = express.Router()


const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'OutletB2C', // Folder where images will be stored in Cloudinary
       
    public_id: (req, file) => `${Date.now()}`, // Public ID (filename)
    transformation: [
      { width: 800, height: 600, crop: "limit" }, // Resize
      { quality: "auto:good" } // Automatically adjust quality
    ],
  },
  
});


const upload = multer({ storage });



router.route("/addOutlet").post( upload.single("img"),newOutlet) //authenicateUser,
router.route("/allOutlet").get(getAllOutletsWithOrderAndPartners) //authenicateUser,
router.route("/oneOutlet/:id").get(getOneOutlet) //authenicateUser,
router.route("/addOutletPartner").post( upload.single("img"),createOutletPartner) //authenicateUser,
router.route("/removeOutletPartner/:userId").delete(deleteOutletPartner) //authenicateUser,
router.route("/customerInsights").get(customerInsights)

router.route("/getProductCount").get(getProductCount)
router.route("/getoutletpartners").get(getOutletPartners)

//products ---------
router.route("/changeproductprice/:id").patch(changeProductprice)
router.route("/getallproducts").get(getAllProducts)


//orders-------------------
router.route("/order/delete/:id").delete(deleteOrder)
router.route("/orders/summary").get(filteringOrders)

//Outlet---------------------
router.route("/outlet/delete/:id").delete(deleteOutlet)

//delivery partner (DP)
router.route("/approveDelivery/:id").patch(approveDelivery)
router.route("/deliveryInsights").get(deliveryInsights)
router.route('/getapprovedDP').get(getApprovedDP)
router.route("/deliverypartner/:id").get(getDeliveryPartner)
router.route("/makedeliverypartner").post(createDP)
router.route("/deliverypartner/delete/:id").delete(deleteDP)


// all data count for dashboard
router.route('/dashboard/inforamtion').get(getAllCountInformation)


export default router

