import twilio from "twilio";

// Initialize Twilio client only if credentials are provided
let twilioClient: twilio.Twilio | null = null;
const FROM_PHONE = process.env.TWILIO_PHONE_NUMBER;

if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  try {
    twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
  } catch (error) {
    console.error("Failed to initialize Twilio client:", error);
  }
}

// SMS message templates
const getOrderConfirmationSMS = (
  orderId: string,
  restaurantName: string,
  totalAmount: string
) => {
  return `Order Confirmed! 🎉

Order ID: ${orderId.substring(orderId.length - 8)}
Restaurant: ${restaurantName}
Total: ${totalAmount}

Your order is being prepared. We'll notify you when it's ready!`;
};

const getOrderStatusUpdateSMS = (
  orderId: string,
  restaurantName: string,
  status: string
) => {
  const statusMessages: Record<string, string> = {
    paid: "Payment confirmed! Your order is being prepared.",
    inProgress: "Your order is being prepared! 👨‍🍳",
    outForDelivery: "Your order is out for delivery! 🚗",
    delivered: "Your order has been delivered! Enjoy your meal! 🍽️",
  };

  const message =
    statusMessages[status] || "Your order status has been updated.";

  return `Order Update 📦

Order ID: ${orderId.substring(orderId.length - 8)}
Restaurant: ${restaurantName}
Status: ${status}

${message}`;
};

export const sendOrderConfirmationSMS = async (
  phoneNumber: string,
  order: any,
  restaurant: any
) => {
  try {
    if (!FROM_PHONE || !twilioClient) {
      console.log("Twilio not configured, skipping SMS");
      return;
    }

    if (!phoneNumber) {
      console.log("No phone number provided, skipping SMS");
      return;
    }

    const totalAmount = order.totalAmount
      ? `$${(order.totalAmount / 100).toFixed(2)}`
      : "Pending payment";

    const message = getOrderConfirmationSMS(
      order._id.toString(),
      restaurant.restaurantName,
      totalAmount
    );

    await twilioClient.messages.create({
      body: message,
      from: FROM_PHONE,
      to: phoneNumber,
    });

    console.log(`Order confirmation SMS sent to ${phoneNumber}`);
  } catch (error: any) {
    console.error("Error sending order confirmation SMS:", error.message);
    // Don't throw - SMS failures shouldn't break the order flow
  }
};

export const sendOrderStatusUpdateSMS = async (
  phoneNumber: string,
  order: any,
  restaurant: any,
  newStatus: string
) => {
  try {
    if (!FROM_PHONE || !twilioClient) {
      console.log("Twilio not configured, skipping SMS");
      return;
    }

    if (!phoneNumber) {
      console.log("No phone number provided, skipping SMS");
      return;
    }

    const message = getOrderStatusUpdateSMS(
      order._id.toString(),
      restaurant.restaurantName,
      newStatus
    );

    await twilioClient.messages.create({
      body: message,
      from: FROM_PHONE,
      to: phoneNumber,
    });

    console.log(`Order status update SMS sent to ${phoneNumber}`);
  } catch (error: any) {
    console.error("Error sending order status update SMS:", error.message);
    // Don't throw - SMS failures shouldn't break the order flow
  }
};
