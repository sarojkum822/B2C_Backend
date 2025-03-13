import admin from 'firebase-admin';

// Function to send a notification to a delivery person using a direct device token
export const sendNotificationToDeliveryPerson = async (deviceToken, orderDetails) => {
  try {
    if (!deviceToken) {
      throw new Error('Device token is required');
    }

    if (!orderDetails) {
      throw new Error('Order details are required');
    }

    const { id, orderStatus, pickupAddress, deliveryAddress, orderValue, orderItems } = orderDetails;

    // Convert orderItems to JSON string format
    const itemsString = JSON.stringify(orderItems);

    const message = {
      notification: {
        title: `New Order`,
        body: `Order ID: ${id}\nStatus: ${orderStatus}\nPickup: ${pickupAddress}\nDelivery: ${deliveryAddress}\nOrder Value: ₹${orderValue}\nItems: ${itemsString}`,
      },
      token: deviceToken,
    };

    const response = await admin.messaging().send(message);
    console.log('Notification sent successfully:', response);
    return response;
  } catch (error) {
    console.error('Error sending notification:', error.message);
    throw error;
  }
};
