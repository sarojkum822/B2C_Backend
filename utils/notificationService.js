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

    // const message = {
    //   notification: {
    //     title: `New Order`,
    //     body: `Order ID: ${id}\nStatus: ${orderStatus}\nPickup: ${pickupAddress}\nDelivery: ${deliveryAddress}\nOrder Value: ₹${orderValue}\nItems: ${itemsString}`,
    //   },
    //   token: deviceToken,
    // };
    
    const message = {
      notification: {
        title: `New Order`,
        body: `Order ID: ${id} - ${orderStatus}`, // Short summary
      },
      data: { // Detailed data
        orderId: id.toString(),
        orderStatus: orderStatus,
        pickupAddress: pickupAddress,
        deliveryAddress: deliveryAddress,
        orderValue: orderValue.toString(),
        orderItems: itemsString, // Still stringified
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

// import admin from 'firebase-admin';

// // Function to send a notification to a delivery person using a direct device token
// export const sendNotificationToDeliveryPerson = async (deviceToken, orderDetails) => {
//   try {
//     if (!deviceToken) {
//       throw new Error('Device token is required');
//     }

//     if (!orderDetails) {
//       throw new Error('Order details are required');
//     }

//     const { id, orderStatus, pickupAddress, deliveryAddress, orderValue, orderItems } = orderDetails;

//     // Creating a condensed version of the message for the notification body
//     const notificationBody = `Order #${id} - ${orderStatus}`;
    
//     // Format the order value
//     const formattedOrderValue = typeof orderValue === 'number' ? 
//       `₹${orderValue.toFixed(2)}` : `₹${orderValue}`;

//     // Put detailed information in the data payload instead of the notification body
//     const message = {
//       notification: {
//         title: 'New Order Alert',
//         body: notificationBody,
//         sound: 'default',
//       },
//       data: {
//         orderId: id.toString(),
//         orderStatus: orderStatus || '',
//         pickupAddress: pickupAddress || '',
//         deliveryAddress: deliveryAddress || '',
//         orderValue: formattedOrderValue,
//         // Don't include complex objects in data payload - they must be strings
//         orderItems: JSON.stringify(orderItems || []),
//         // Add a timestamp to ensure uniqueness
//         timestamp: Date.now().toString(),
//         // Add a click action to open the appropriate screen
//         click_action: 'FLUTTER_NOTIFICATION_CLICK',
//       },
//       // Android specific options
//       android: {
//         priority: 'high',
//         notification: {
//           channel_id: 'delivery_orders',
//           sound: 'default',
//           priority: 'high',
//           visibility: 'public',
//           // Add a default color for the notification
//           color: '#FF9800',
//         },
//       },
//       // iOS specific options
//       apns: {
//         headers: {
//           'apns-priority': '10',
//         },
//         payload: {
//           aps: {
//             sound: 'default',
//             badge: 1,
//             content_available: true,
//           },
//         },
//       },
//       // Target the specific device
//       token: deviceToken,
//     };

//     const response = await admin.messaging().send(message);
//     console.log('Notification sent successfully:', response);
//     return response;
//   } catch (error) {
//     console.error('Error sending notification:', error);
//     // Provide more specific error handling
//     if (error.code === 'messaging/invalid-argument') {
//       console.error('Invalid argument provided to FCM');
//     } else if (error.code === 'messaging/registration-token-not-registered') {
//       console.error('The device token is no longer valid and should be removed');
//     } else if (error.code === 'messaging/invalid-registration-token') {
//       console.error('The registration token format is incorrect');
//     }
//     throw error;
//   }
// };
