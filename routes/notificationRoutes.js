

import express from 'express';
import { sendNotificationToDeliveryPerson } from '../utils/notificationService.js';  // Import the notification service

const router = express.Router();

// Route to send notification to a delivery person
router.post('/sendNotification', async (req, res) => {
  const { deviceToken, orderDetails } = req.body;

  try {
    // Call the notification service to send the notification
    await sendNotificationToDeliveryPerson(deviceToken, orderDetails);
    res.status(200).send('Notification sent successfully.');
  } catch (error) {
    res.status(500).send('Error sending notification.');
  }
});

export default router;
