import express from "express"
import authenicateUser from "../middleware/authHandler.js"

import { deliveryPartnerProfile,
  personalInformation,
  generateIdAndPassword,
  bankDetails,
  uploadAadharDocs,
  uploadPanDocs,
  uploadDLDocs,
  vehicleDetails,
  getDocsStatus,
  fetchAllOrders,
  getSpecificOrderDetails,
  deleteProfile,
  getDriverrById,
  addRating
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
router.route("/bankDetails/:id").post(bankDetails)
router.route("/personalDocs/aadharcard/:id").post(upload.fields([{ name: 'front', maxCount: 1 },{ name: 'back', maxCount: 1 }]),uploadAadharDocs)
router.route("/personalDocs/pancard/:id").post(upload.fields([{ name: 'front', maxCount: 1 },{ name: 'back', maxCount: 1 }]),uploadPanDocs)
router.route("/personalDocs/dl/:id").post(upload.fields([{ name: 'front', maxCount: 1 },{ name: 'back', maxCount: 1 }]),uploadDLDocs)
router.route("/vehicleDetails/:id").post(upload.single("img"),vehicleDetails)
router.route("/getdocstatus/:id").get(getDocsStatus)

//get all the orders of delivery partner 
router.route('/fetchOrders/:id').get(fetchAllOrders)
router.route('/specificOrder/:did/:oid').get(getSpecificOrderDetails)

router.route("/profile/:userId").delete(deleteProfile)
                                .get(getDriverrById)
router.route("/:id/rating").patch(addRating)

export default router
