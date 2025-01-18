import express from "express"
import authenicateUser from "../middleware/authHandler.js"

import { 
  deliveryPartnerProfile,
  // --------PROFILE CREATION-------
  personalInformation,
  generateIdAndPassword,
  bankDetails,
  uploadAadharDocs,
  uploadPanDocs,
  uploadDLDocs,
  vehicleDetails,
  getDocsStatus,

  verifyPassword,
  //-------accept order--------
  markOrderDelivered,
  acceptOrder,
  //----ORDER DETAILS----------
  fetchAllOrders,
  getSpecificOrderDetails,
  getCurrentOrders,
  amountReturnToStore,
  //----
  deleteProfile,
  getDriverrById,
  addRating,
  getOutletIdByDP,

  // get product
  getAllProducts
} from "../controllers/deliveryController.js"

import multer from "multer"
import { CloudinaryStorage } from'multer-storage-cloudinary';
import {cloudinary} from "../utils/cloudinary.js";

const router = express.Router()

// Image storage engine

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'deliveryPartnerB2C', // Folder where images will be stored in Cloudinary
         
      public_id: (req, file) => `${Date.now()}`, // Public ID (filename)
      transformation: [
        { width: 800, height: 600, crop: "limit" }, // Resize
        { quality: "auto:good" } // Automatically adjust quality
      ],
    },
    
});

const upload = multer({ storage });

router.route("/profile").post(upload.single("img"),deliveryPartnerProfile) //authenicateUser, 
//prodile details
router.route("/personalInformation").post(upload.single("img"),personalInformation)
router.route("/genidandpassword/:id").post(generateIdAndPassword)
router.route("/bankDetails/:id").post(upload.single('img'),bankDetails)
router.route("/personalDocs/aadharcard/:id").post(upload.fields([{ name: 'front', maxCount: 1 },{ name: 'back', maxCount: 1 }]),uploadAadharDocs)
router.route("/personalDocs/pancard/:id").post(upload.fields([{ name: 'front', maxCount: 1 },{ name: 'back', maxCount: 1 }]),uploadPanDocs)
router.route("/personalDocs/dl/:id").post(upload.fields([{ name: 'front', maxCount: 1 },{ name: 'back', maxCount: 1 }]),uploadDLDocs)
router.route("/vehicleDetails/:id").post(upload.single("img"),vehicleDetails)
router.route("/getdocstatus/:id").get(getDocsStatus)

router.route('/verifypassword').post(verifyPassword)



router.route('/acceptOrder/:did/:oid').post(acceptOrder)
router.route("/markorderdelivered/:did/:oid").patch(markOrderDelivered)

//get all the orders of delivery partner 
router.route('/fetchOrders/:id').get(fetchAllOrders)
router.route('/specificOrder/:did/:oid').get(getSpecificOrderDetails)
router.route('/getcurrentorders/:id').get(getCurrentOrders)
router.route('/storeamount/:id').get(amountReturnToStore)

router.route("/profile/:userId").delete(deleteProfile)
                                .get(getDriverrById)
router.route("/:id/rating").patch(addRating)

//DP : delivery partner
router.route("/getoutletId/:id").get(getOutletIdByDP)

// get all Products
router.route('/getproduct').get(getAllProducts)

export default router
