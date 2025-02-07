import { getFirestore } from "firebase-admin/firestore"
import admin from 'firebase-admin'


const mainCollection = "Customer"

const newUser = async (req, res) => {
  
  try{
  let { name, phone, email, addresses, age, gender,password } = req.body;
  if(!phone) return res.status(400).json({message:"phone is a required attribute"})
  name=name || 'newUser '+phone
  email=email || ''
  addresses=addresses || []
  age=age || ''
  gender=gender || ''


  // Assuming `addresses` is an array of objects each containing the address and coordinates
  // Example: addresses = [{ fullAddress: '123 St', coordinates: { lat: 12.34, long: 56.78 } }]
  
  const db = getFirestore();

  //check if phone number already taken
  const customerRef = db.collection(mainCollection).doc(phone);  // Fetch document using customer ID
    const customerDoc = await customerRef.get();

    if (customerDoc.exists) {
      return res.status(400).json({ message: 'phone number allready taken'});
    }

  await db.collection(mainCollection).doc(phone).set({
    name,
    phone,
    email,
    age, // New field
    gender, // New field
    totalExpenditure: 0,
    totalOrders:0, // Initialize as 0 and update this with each new order
    addresses, // Array of address objects with full address and coordinates (lat, long)
    timeOfCreation: Date.now(),
    password
  });

  res.status(200).json({ message: "User created" });
} 
  catch (err){
  res.status(400).json({
    message:"failed to create user"
    
  })
  console.error(err)
  }
}

const getCustomerById = async (req, res) => {
  const { customerId } = req.params;  // Assuming customerId is passed in the URL as a param
  console.log(customerId)
  try {
    const db = getFirestore();
    const customerRef = db.collection(mainCollection).doc(customerId);  
    const customerDoc = await customerRef.get();

    if (!customerDoc.exists) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // Return the customer's data
    return res.status(200).json({
      id: customerDoc.id,
      ...customerDoc.data()
    });
  } catch (error) {
    console.error('Error getting customer:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};




const updateUser = async (req, res) => {
  try {
    const phone = req.params.phone;
    const { name, email, age, gender, removeAddr } = req.body;
    
    if (!phone) {
      return res.status(400).json({ message: "Phone number is required" });
    }

    // Ensure addresses is an array
    let addresses = Array.isArray(req.body.addresses) ? req.body.addresses : [];

    // Get Firestore instance
    const db = getFirestore();
    const userDocRef = db.collection(mainCollection).doc(phone);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      return res.status(404).json({ message: "User not found" });
    }

    // Retrieve existing user data
    const userData = userDoc.data();
    let updatedData = {};

    // Update only fields that are explicitly provided
    if (name !== undefined) updatedData.name = name;
    if (email !== undefined) updatedData.email = email;
    if (age !== undefined) updatedData.age = age;
    if (gender !== undefined) updatedData.gender = gender;

    // Start with existing addresses
    let updatedAddresses = [...(userData.addresses || [])];

    // Remove address if index is valid
    if (removeAddr !== undefined) {
      const ind = parseInt(removeAddr, 10);
      if (!isNaN(ind) && ind >= 0 && ind < updatedAddresses.length) {
        updatedAddresses.splice(ind, 1);
      } else {
        return res.status(400).json({ message: "Invalid address index" });
      }
    }

    // Append new addresses if provided
    if (addresses.length > 0) {
      updatedAddresses = [...updatedAddresses, ...addresses];
    }

    // Only update addresses if there is a change
    if (JSON.stringify(updatedAddresses) !== JSON.stringify(userData.addresses)) {
      updatedData.addresses = updatedAddresses;
    }

    // Ensure Firestore update() does not receive empty object
    if (Object.keys(updatedData).length === 0) {
      return res.status(400).json({ message: "No valid fields provided for update" });
    }

    // Update Firestore document
    await userDocRef.update(updatedData);

    res.status(200).json({
      message: "User updated successfully",
      updatedData
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update user", error: err.message });
    console.error(err);
  }
};





const requestOTP= async (req, res) => {
  const phoneNumber = req.body.phoneNumber;

  try {
    const auth = admin.auth();
    admin.createVerificationCode()
    const sessionInfo = await auth.createVerificationCode(phoneNumber, {
      ttl: 60, // TTL of 60 seconds for the OTP
    });

    res.status(200).send({ sessionInfo });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
}

const verifyOTP = async(req, res) => {
  const { sessionInfo, otp } = req.body;

  try {
    const auth = admin.auth();
    const phoneAuthResult = await auth.verifyVerificationCode(sessionInfo, otp);

    // Use phoneAuthResult to create a custom token for the user
    const customToken = await auth.createCustomToken(phoneAuthResult.uid);

    res.status(200).send({ token: customToken });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
}

const verifyPassword = async(req,res)=>{
  try {
    const {phone , password} = req.body
    let login = false

    if (!phone) return res.status(400).json({ message: "Phone number is required",login });

    const db  = getFirestore()
    const userRef = db.collection(mainCollection).doc(phone)
    const userDoc = await userRef.get()

    if (!userDoc.exists) {
      return res.status(400).json({ message: "User not found create account.",login });
    }

    const userPassword = userDoc.data().password
    
    if (password != userPassword) {
      return res.status(400).json({ message: "Password not matched." });
    }

    login = true

    return res.status(200).json({message:"passowrd match u can log in",login})
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: error.message });
  }
}
export { 
  newUser,
  getCustomerById,
  updateUser,
  // requestOTP,
  // verifyOTP,
  verifyPassword,
};
