// import { Inngest } from "inngest";

// // Create a client to send and receive events
// export const inngest = new Inngest({ id: "food-ordering-app" });

// // Create an empty array where we'll export future Inngest functions

// export const orderCreated = inngest.createFunction(
//   {
//     id: "order-created",
//   },
//   { event: "order.created" },
//   async ({ event }) => {
//     console.log("Order Created", event);
//   },
// );

// // Inngest function to send emails when user places an order
// export const sendOrderConfirmationEmail = inngest.createFunction({
//   id: "send-order-confirmation-email",
// }, { event: "order.created" }, async ({ event }) => {
//     console.log("Sending order confirmation email", event);
//   },
// );

// export const functions = [orderCreated];
