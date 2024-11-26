import { getFirestore } from "firebase-admin/firestore"
import {removeImg} from "../utils/imageRemove.js"
const mainCollection = "Delivery_partner"


//calucalte rating 
function calculateNewRating(currentAverage, currentCount, newRating) {
  const updatedCount = currentCount + 1;
  const updatedAverage = ((currentAverage * currentCount) + newRating) / updatedCount;
  const roundedAverage = Math.round(updatedAverage * 10) / 10;
  return {
      newAverage: roundedAverage,
      newCount: updatedCount
  };
}

const deliveryPartnerProfile = async (req, res) => {
  // Destructure the flat request body data
  const { firstName, lastName, fathersName, dob, DLNo, phone,secondaryNumber, bloodGroup, city, address, languageKnown, aadharNo, panNo, vehicleRegistrationNo, accHolderName, bankName, accNo, branchName, ifscCode } = req.body;

  // Validate necessary fields
  if (!req.file) {
    return res
      .status(400)
      .json({ status: "fail", message: "No image file provided" });
  }

  if (!phone) {
    await removeImg(req.file.path);
    return res.status(400).json({
      message: "Please enter phone"
    });
  }

  const db = getFirestore();

  // Check if the driver with the given phone already exists
  const driverRef = db.collection(mainCollection).doc(phone);  
  const driverDoc = await driverRef.get();

  if (driverDoc.exists) {
    await removeImg(req.file.path);
    return res.status(400).json({ message: 'Phone number already taken' });
  }

  const img = req.file.path || '';
  const dataOfBirth=new Date(dob) || null
  const approved=false;
  // Separate and structure the data
  const generalDetails = {
    firstName,
    lastName,
    fathersName,
    dob:dataOfBirth,
    phone,
    secondaryNumber: secondaryNumber || phone,
    bloodGroup,
    city,
    address,
    languageKnown: languageKnown ? languageKnown.split(',') : [], // Split if sent as a string
  };

  const docDetails = {
    aadharNo,
    panNo,
    DLNo,
    vehicleRegistrationNo
  };

  const bankDetails = {
    accHolderName,
    bankName,
    accNo,
    branchName,
    ifscCode
  };

  //total order he delivered
  const totalOrders = {
    count:2,
    orders:[{id:"1111111113-1729774085439"},{id:"1111111113-1729790554963"}]
  }
  //rating inforamation
  const ratingInfo = {
    rating:0,
    newCount:0,
    customers:[],
  }
  // Save the data into the Firestore database
  await db.collection(mainCollection).doc(phone).set({
    generalDetails,
    docDetails,
    bankDetails,
    img,
    totalDeliveries: 0,
    totalOrders,
    ratingInfo,
    approved,
    ratings:0,
  });

  // Send a successful response
  res.status(200).json({ message: 'Driver profile created successfully' });
};

const personalInformation = async (req, res) => {
  try {
    //extract the detailse
    const {
      firstName,
      lastName,
      dob,
      fatherName,
      phone,
      secondaryNumber,
      bloodGroup,
      city,
      address,
      languageKnown,
    } = req.body;

    // Validate required fields    
    if (!req.file) {
      return res
        .status(400)
        .json({ status: "fail", message: "No image file provided" });
    }

    //phone number is required
    if (!phone) {
      await removeImg(req.file.path);
      return res.status(400).json({
        message: "Please enter phone"
      });
    }
    // Initialize Firestore
    const db = getFirestore();
    const img = req.file.path;
    const dataOfBirth = dob ? new Date(dob) : null;
    
    //general details of dilivery partner
    const generalDetails = {
      firstName,
      lastName,
      dob: dataOfBirth,
      fatherName,
      phone,
      secondaryNumber: secondaryNumber || null,
      bloodGroup,
      city,
      address,
      image: img || null,
      languageKnown: languageKnown ? languageKnown.split(",") : [],
      updatedAt: new Date(),
    };

    //total order he delivered
    const totalOrders = {
      count:2,
      orders:[{id:"1111111113-1729774085439"},{id:"1111111113-1729790554963"}]
    }

    //rating inforamation
    const ratingInfo = {
      rating:0,
      newCount:0,
      customers:[],
    }

    // Firestore reference
    const userRef = db.collection(mainCollection).doc(phone);

    await userRef.set(
      {
        generalDetails:generalDetails,
        submissionStatus: { generalDetails: false },
        totalOrders,
        ratingInfo,
        ratings:0,
        totalDeliveries: 0
      },
      { merge: true } // Merge with existing data
    )
    res.status(200).json({ status: "success", message: "personal details submitted successfully." });
  } catch (error) {
    removeImg(req.file.path)
    console.error("Error creating/updating user:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const generateIdAndPassword =async(req,res)=>{
  try {
    const id = req.params.id
    
    if (!id) {
      return res.status(400).json({
        message: "Please enter delivery partner id"
      });
    }

    const db = getFirestore()
    const docRef = db.collection(mainCollection).doc(id)
    const docSnap = await docRef.get()
    if (!docSnap.exists) {
      return res.status(404).json({ message: "Delivery partner not found" });
    }
    const submissionStatus = docSnap.data().submissionStatus
    const firstName = docSnap.data().generalDetails.firstName
    if (!submissionStatus.generalDetails ||
        !submissionStatus.bankDetails ||
        !submissionStatus.personalDocs || 
        !submissionStatus.vehicleDetails
      ) {
        return res.status(404).json({ message: "Delivery partner still not verified" });
      }
    const uid =req.params.id
    const password = `${firstName}@${id}.in`

    console.log(password);

    await docRef.set({
      id: uid,
      password: password
    }, { merge: true }
    )
    // const password = crypto.randomBytes(16).toString('hex')
    return res.status(200).json({message:"Id and password generated successfully ",uid,password});
  } catch (error) {
    console.error("Error message:", error);
    return res.status(500).json({ message: "Error updating delivery partner rating", error: error.message });
  }
}

const bankDetails=async(req,res)=>{
  
  try {
    const { accNo, accHolderName, ifscCode, bankName,branchName } = req.body;
    const id = req.params.id
    // Validate input
    if (!id) {
      return res.status(400).json({ status: "fail", message: "delivery partner id is required number is required." });
    }

    if (!accNo || !accHolderName || !ifscCode || !bankName|| !branchName) {
      return res.status(400).json({ status: "fail", message: "All bank details are required." });
    }

    // Initialize Firestore
    const db = getFirestore();
    const userRef = db.collection(mainCollection).doc(id);

    // Bank details object
    const bankDetails = {
      accNo,
      accHolderName,
      ifscCode,
      bankName,
      branchName,
      updatedAt: new Date(),
    };

    // Update or set bank details in Firestore
    await userRef.set(
      {
        bankDetails:bankDetails,
        submissionStatus: { bankDetails: false },
      },
      { merge: true } // Merge with existing data
    );

    res.status(200).json({ status: "success", message: "Bank details submitted successfully." });
  } catch (error) {
    console.error("Error submitting bank details:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
}

const uploadAadharDocs =async(req,res)=>{
     try {
      const id = req.params.id

      // Check if both images are provided
      if (!req.files.front || !req.files.back) {
        return res.status(400).json({ message: 'Front and Back image of Aadhaar card is required.' });
      }
      //delivery partner id is required
      if (!id) {
        await removeImg(req.file.front[0].path);
        await removeImg(req.file.back[0].path);
        return res.status(400).json({
          message: "Please enter delivery Partner id"
        });
      }

      const frontImage = req.files.front[0].path
      const backImage = req.files.back[0].path

      const aadharDoc ={
        frontImage:frontImage,
        backImage:backImage
      }

      const db = getFirestore()
      const userRef = db.collection(mainCollection).doc(id)

      //store the information
      await userRef.set({
          personalDocs:{aadharDoc},
          submissionStatus :{personalDocs:false}
        },
        { merge:true }
      )

      res.status(200).json({ status: "success", message: "Aadhar document submitted successfully." });
     } catch (error) {
      await removeImg(req.file.front[0].path);
      await removeImg(req.file.back[0].path);
      console.error("Error submitting bank details:", error);
      res.status(500).json({ status: "error", message: "Internal Server Error" });
     }
}

const uploadPanDocs =async(req,res)=>{
  try {
   const id = req.params.id

   // Check if both images are provided
   if (!req.files.front || !req.files.back) {
     return res.status(400).json({ message: 'Front and Back image of Pan card is required.' });
   }

   if (!id) {
    await removeImg(req.file.front[0].path);
    await removeImg(req.file.back[0].path);
    return res.status(400).json({
      message: "Please enter delivery Partner id"
    });
   }
   const frontImage = req.files.front[0].path
   const backImage = req.files.back[0].path
   
   const panDoc ={
     frontImage:frontImage,
     backImage:backImage
   }
   const db = getFirestore()
   const userRef = db.collection(mainCollection).doc(id)

   await userRef.set({
       personalDocs:{panDoc},
       submissionStatus :{personalDocs:false}
     },
     { merge:true }
   )

   res.status(200).json({ status: "success", message: "Pan Card document submitted successfully." });
  } catch (error) {
    await removeImg(req.file.front[0].path);
    await removeImg(req.file.back[0].path);
    console.error("Error submitting bank details:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
}

const uploadDLDocs =async(req,res)=>{
  try {
   const id = req.params.id

   // Check if both images are provided
   if (!req.files.front || !req.files.back) {
     return res.status(400).json({ message: 'Front and Back image of DL is required.' });
   }

   if (!id) {
    await removeImg(req.file.front[0].path);
    await removeImg(req.file.back[0].path);
    return res.status(400).json({
      message: "Please enter delivery Partner id"
    });
   }
   const frontImage = req.files.front[0].path
   const backImage = req.files.back[0].path
   console.log(frontImage);
   console.log(backImage);
   
   const DLDoc ={
     frontImage:frontImage,
     backImage:backImage
   }
   const db = getFirestore()
   const userRef = db.collection(mainCollection).doc(id)

   await userRef.set({
       personalDocs:{DLDoc},
       submissionStatus :{personalDocs:false}
     },
     { merge:true }
   )

   res.status(200).json({ status: "success", message: "DL Card document submitted successfully." });
  } catch (error) {
    await removeImg(req.file.front[0].path);
    await removeImg(req.file.back[0].path);
    console.error("Error submitting bank details:", error);
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
}

const vehicleDetails = async(req,res)=>{
  try {
    const id = req.params.id
 
    // Check if both images are provided
    if (!req.file) {
      return res
        .status(400)
        .json({ status: "fail", message: "No image file provided" });
    }

    if (!id) {
      await removeImg(req.file.path);
      return res.status(400).json({
        message: "Please enter delivery partner id"
      });
    }
    const img = req.file.path
    console.log(img)
    
    const vehicleDetails ={
      image:img
    }
    const db = getFirestore()
    const userRef = db.collection(mainCollection).doc(id)
 
    await userRef.set({
        vehicleDetails:vehicleDetails,
        submissionStatus :{vehicleDetails:false}
      },
      { merge:true }
    )
 
    res.status(200).json({ status: "success", message: "vehicle document submitted successfully." });
   } catch (error) {
     await removeImg(req.file.path)
     console.error("Error submitting bank details:", error);
     res.status(500).json({ status: "error", message: "Internal Server Error" });
   }
}

const getDocsStatus = async(req,res)=>{
  try {
    const id  = req.params.id
     
    if (!id) {
      return res.status(400).json({
        message: "Please enter delivery partner id"
      });
    }
    const db = getFirestore()
    const userRef = db.collection(mainCollection).doc(id)
    const doc = await userRef.get()
    if (!doc.exists) {
      return res.status(404).json({ status: "fail", message: "User not found"})
    }
    const submissionStatus = doc.data().submissionStatus
    return res.status(200).json({submissionStatus})
  } catch (error) {
    console.error('Error fetching driver:', error);
    res.status(500).json({ message: 'Error fetching driver', error: error.message });
  }
}

const getDriverrById = async (req, res) => {
  try {
    // Assuming user ID (or phNo) is sent as a parameter in the request URL
    const userId = req.params.userId;
    const db = getFirestore()
    // Reference to the Firestore document for the user
    const userRef = db.collection(mainCollection).doc(userId);

    // Get the document snapshot
    const userDoc = await userRef.get();

    // Check if the document exists
    if (!userDoc.exists) {
      return res.status(404).json({ message: `driver with ID ${userId} not found.` });
    }

    // Send the user data back as the response
    res.status(200).json({ id: userId, ...userDoc.data() });
  } catch (error) {
    // Handle errors (e.g., Firestore connection issues)
    console.error('Error fetching driver:', error);
    res.status(500).json({ message: 'Error fetching driver', error: error.message });
  }
};

const deleteProfile=async (req,res)=>{
  try {
    
    const userId = req.params.userId;
    const db = getFirestore()

    // Reference to the Firestore document for the user
    console.log(userId)
    const userRef = db.collection(mainCollection).doc(userId);
    const driverDoc = await userRef.get();

    if (!driverDoc.exists) {
      return res.status(404).send({ message: 'User not found' });
    }
    await removeImg(driverDoc.data().img)
    await userRef.delete();
    
    // Send a response indicating the user was successfully deleted
    res.status(200).json({ message: `Driver with ID ${userId} deleted successfully.` });
  } catch (error) {
    // Handle errors (e.g., if user ID doesn't exist)
    console.error('Error deleting driver:', error);
    res.status(500).json({ message: 'Error deleting driver', error: error.message });
  }
}

const addRating = async (req, res) => {
  try {
      const id = req.params.id;
      const { customerId, newRating } = req.body;

      // Initialize Firestore
      const db = getFirestore();
      const deliveryDocRef = db.collection(mainCollection).doc(id);
      const deliveryDoc = await deliveryDocRef.get();

      // Check if delivery partner exists
      if (!deliveryDoc.exists) {
          return res.status(404).json({ message: 'Delivery partner not found' });
      }
      //check customer
      const customerDocRef = db.collection("Customer").doc(customerId);
      const customerDoc = await customerDocRef.get()
      if (!customerDoc.exists) {
        return res.status(404).json({message:"Customer not found"})
      }

      const data = deliveryDoc.data();

      // Get current rating and count, initializing to 0 if undefined
      const currentRating = data.ratingInfo?.rating ?? 0;
      const currentCount = data.ratingInfo?.newCount ?? 0;

      // Calculate new rating and count
      const { newAverage, newCount } = calculateNewRating(currentRating, currentCount, newRating);

      // Add new customer rating to array
      const customer = {
          id: customerId,
          rating: newRating
      };
      const updatedCustomers = [...(data.ratingInfo?.customers || []), customer];

      // Prepare updated rating information, omitting undefined values
      const ratingInfo = {
          rating: newAverage,
          newCount: newCount,
          customers: updatedCustomers
      };

      // Update Firestore document, omitting undefined properties
      await deliveryDocRef.update({
          ...data,
          ratings:ratingInfo.rating ?? 0,
          ratingInfo: {
              rating: ratingInfo.rating ?? 0,
              newCount: ratingInfo.newCount ?? 0,
              customers: ratingInfo.customers
          }
      });

      return res.status(200).json({ message: "Delivery partner rating calculated successfully!" ,ratingInfo});
  } catch (error) {
      console.error("Error message:", error);
      return res.status(500).json({ message: "Error updating delivery partner rating", error: error.message });
  }
};
const fetchAllOrders = async(req,res)=>{
  try {
    const id = req.params.id
    
    if (!id) {
      return res.status(400).json({
        message: "Please enter delivery partner id"
      });
    }
    const db = getFirestore()
    const docRef = db.collection(mainCollection).doc(id)
    const docSnap = await docRef.get()
    if (!docSnap.exists) {
      return res.status(404).json({ message: "Delivery partner not found" });
    }
    const orders = docSnap.data().totalOrders || "No order found!"
    return res.status(200).json({ orders });
  } catch (error) {
    console.error("Error message:", error);
    return res.status(500).json({ message: "Error updating delivery partner rating", error: error.message });
  }
}
export{ 
  deliveryPartnerProfile,
  bankDetails,
  personalInformation,
  generateIdAndPassword,
  uploadAadharDocs,
  uploadPanDocs,
  uploadDLDocs,
  vehicleDetails,
  getDocsStatus,
  fetchAllOrders,
  deleteProfile,
  getDriverrById,
  addRating
}
