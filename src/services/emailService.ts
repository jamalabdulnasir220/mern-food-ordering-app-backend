import nodemailer from "nodemailer";
// import type { Order } from "../models/order.js";
import Restaurant from "../models/restaurant.js";
import User from "../models/user.js";

// Create transporter - configure based on your email service
// For production, use services like SendGrid, AWS SES, or Gmail SMTP
const createTransporter = () => {
  // Using Gmail SMTP as example - replace with your email service
  if (process.env.EMAIL_SERVICE === "gmail") {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, // Use App Password for Gmail
      },
    });
  }

  // Generic SMTP configuration
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

const transporter = createTransporter();

// Email templates
const getOrderConfirmationTemplate = (
  order: any,
  restaurant: any,
  userName: string
) => {
  const orderDate = new Date(order.createdAt).toLocaleString();
  const itemsList = order.cartItems
    .map((item: any) => `  • ${item.name} x${item.quantity}`)
    .join("\n");
  const totalAmount = order.totalAmount
    ? `$${(order.totalAmount / 100).toFixed(2)}`
    : "Pending payment";

  return {
    subject: `Order Confirmation - ${restaurant.restaurantName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f97316; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }
          .order-info { background-color: white; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .item { padding: 10px 0; border-bottom: 1px solid #eee; }
          .total { font-size: 18px; font-weight: bold; color: #f97316; margin-top: 15px; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmed!</h1>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <p>Thank you for your order! We've received your order and it's being prepared.</p>
            
            <div class="order-info">
              <h2>Order Details</h2>
              <p><strong>Order ID:</strong> ${order._id}</p>
              <p><strong>Restaurant:</strong> ${restaurant.restaurantName}</p>
              <p><strong>Order Date:</strong> ${orderDate}</p>
              <p><strong>Status:</strong> ${order.status}</p>
              
              <h3>Items Ordered:</h3>
              <pre style="white-space: pre-wrap; font-family: Arial, sans-serif;">${itemsList}</pre>
              
              <div class="total">
                <p>Total Amount: ${totalAmount}</p>
              </div>
              
              <h3>Delivery Address:</h3>
              <p>
                ${order.deliveryDetails.addressLine1}<br>
                ${order.deliveryDetails.city}
              </p>
            </div>
            
            <p>We'll notify you when your order status changes.</p>
            <p>Thank you for choosing us!</p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Order Confirmation - ${restaurant.restaurantName}

Hi ${userName},

Thank you for your order! We've received your order and it's being prepared.

Order Details:
- Order ID: ${order._id}
- Restaurant: ${restaurant.restaurantName}
- Order Date: ${orderDate}
- Status: ${order.status}

Items Ordered:
${itemsList}

Total Amount: ${totalAmount}

Delivery Address:
${order.deliveryDetails.addressLine1}
${order.deliveryDetails.city}

We'll notify you when your order status changes.

Thank you for choosing us!
    `,
  };
};

const getOrderStatusUpdateTemplate = (
  order: any,
  restaurant: any,
  userName: string,
  newStatus: string
) => {
  const statusMessages: Record<string, string> = {
    paid: "Your payment has been confirmed!",
    inProgress: "Your order is being prepared!",
    outForDelivery: "Your order is out for delivery!",
    delivered: "Your order has been delivered!",
  };

  const statusMessage =
    statusMessages[newStatus] || "Your order status has been updated.";
  const orderDate = new Date(order.createdAt).toLocaleString();

  return {
    subject: `Order Update - ${restaurant.restaurantName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f97316; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
          .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }
          .status-badge { display: inline-block; padding: 10px 20px; background-color: #10b981; color: white; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Update</h1>
          </div>
          <div class="content">
            <p>Hi ${userName},</p>
            <p>${statusMessage}</p>
            
            <div class="status-badge">
              Status: ${newStatus.toUpperCase()}
            </div>
            
            <p><strong>Order ID:</strong> ${order._id}</p>
            <p><strong>Restaurant:</strong> ${restaurant.restaurantName}</p>
            <p><strong>Order Date:</strong> ${orderDate}</p>
            
            ${
              newStatus === "outForDelivery"
                ? "<p>Your order is on its way! Please be ready to receive it.</p>"
                : ""
            }
            ${
              newStatus === "delivered"
                ? "<p>We hope you enjoy your meal! Thank you for ordering with us.</p>"
                : ""
            }
            
            <p>You can track your order status in your account.</p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Order Update - ${restaurant.restaurantName}

Hi ${userName},

${statusMessage}

Status: ${newStatus.toUpperCase()}

Order ID: ${order._id}
Restaurant: ${restaurant.restaurantName}
Order Date: ${orderDate}

${
  newStatus === "outForDelivery"
    ? "Your order is on its way! Please be ready to receive it."
    : ""
}
${
  newStatus === "delivered"
    ? "We hope you enjoy your meal! Thank you for ordering with us."
    : ""
}

You can track your order status in your account.
    `,
  };
};

export const sendOrderConfirmationEmail = async (order: any) => {
  try {
    const restaurant = await Restaurant.findById(order.restaurant).lean();
    const user = await User.findById(order.user).lean();

    if (!restaurant || !user) {
      console.error(
        "Restaurant or user not found for order confirmation email"
      );
      return;
    }

    const template = getOrderConfirmationTemplate(
      order,
      restaurant,
      user.name || "Customer"
    );

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: order.deliveryDetails.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    console.log(
      `Order confirmation email sent to ${order.deliveryDetails.email}`
    );
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    // Don't throw - email failures shouldn't break the order flow
  }
};

export const sendOrderStatusUpdateEmail = async (
  order: any,
  newStatus: string
) => {
  try {
    const restaurant = await Restaurant.findById(order.restaurant).lean();
    const user = await User.findById(order.user).lean();

    if (!restaurant || !user) {
      console.error("Restaurant or user not found for status update email");
      return;
    }

    const template = getOrderStatusUpdateTemplate(
      order,
      restaurant,
      user.name || "Customer",
      newStatus
    );

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: order.deliveryDetails.email,
      subject: template.subject,
      html: template.html,
      text: template.text,
    });

    console.log(
      `Order status update email sent to ${order.deliveryDetails.email}`
    );
  } catch (error) {
    console.error("Error sending order status update email:", error);
    // Don't throw - email failures shouldn't break the order flow
  }
};
