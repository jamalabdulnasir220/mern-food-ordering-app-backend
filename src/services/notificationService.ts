import Order from "../models/order.js";
import Restaurant from "../models/restaurant.js";
import User from "../models/user.js";
import {
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail,
} from "./emailService.js";
import {
  sendOrderConfirmationSMS,
  sendOrderStatusUpdateSMS,
} from "./smsService.js";

/**
 * Send order confirmation notifications (email and SMS)
 */
export const sendOrderConfirmationNotifications = async (orderId: string) => {
  try {
    const order = await Order.findById(orderId)
      .populate("restaurant")
      .populate("user")
      .lean();

    if (!order) {
      console.error("Order not found for notifications");
      return;
    }

    const restaurant = order.restaurant as any;
    const user = order.user as any;

    // Check user notification preferences
    const emailEnabled = user.notificationPreferences?.email !== false;
    const smsEnabled = user.notificationPreferences?.sms !== false;

    // Send email notification
    if (emailEnabled && order.deliveryDetails?.email) {
      await sendOrderConfirmationEmail(order);
    }

    // Send SMS notification
    if (smsEnabled) {
      const phoneNumber = order.deliveryDetails?.phoneNumber || user.phoneNumber;
      if (phoneNumber) {
        await sendOrderConfirmationSMS(phoneNumber, order, restaurant);
      }
    }
  } catch (error) {
    console.error("Error sending order confirmation notifications:", error);
    // Don't throw - notification failures shouldn't break the order flow
  }
};

/**
 * Send order status update notifications (email and SMS)
 */
export const sendOrderStatusUpdateNotifications = async (
  orderId: string,
  newStatus: string
) => {
  try {
    const order = await Order.findById(orderId)
      .populate("restaurant")
      .populate("user")
      .lean();

    if (!order) {
      console.error("Order not found for status update notifications");
      return;
    }

    const restaurant = order.restaurant as any;
    const user = order.user as any;

    // Check user notification preferences
    const emailEnabled = user.notificationPreferences?.email !== false;
    const smsEnabled = user.notificationPreferences?.sms !== false;

    // Send email notification
    if (emailEnabled && order.deliveryDetails?.email) {
      await sendOrderStatusUpdateEmail(order, newStatus);
    }

    // Send SMS notification
    if (smsEnabled) {
      const phoneNumber = order.deliveryDetails?.phoneNumber || user.phoneNumber;
      if (phoneNumber) {
        await sendOrderStatusUpdateSMS(
          phoneNumber,
          order,
          restaurant,
          newStatus
        );
      }
    }
  } catch (error) {
    console.error("Error sending order status update notifications:", error);
    // Don't throw - notification failures shouldn't break the order flow
  }
};
