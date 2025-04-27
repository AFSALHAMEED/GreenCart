import Order from "../model/Order.js";
import Product from "../model/Product.js";
import User from "../model/User.js";
import stripe from "stripe";

export const placeOrderCOD = async (req, res) => {
  try {
    const { userId } = req.user;
    const { items, address } = req.body;
    if (!address || items.length == 0) {
      res.json({ success: false, message: "Invalid data" });
    }
    let amount = items.reduce(async (acc, item) => {
      const product = await Product.findById(item.product);
      return acc + product.offerPrice * item.quantity;
    }, 0);
    amount = await amount;
    amount += Math.floor(amount * 0.2);
    await Order.create({
      userId,
      address,
      items,
      amount,
      paymentType: "COD",
    });
    return res.json({ success: true, message: "Order Placed Successfully" });
  } catch (error) {
    console.log("error: ", error.message);
    return res.json({ success: false, message: error.message });
  }
};

export const placeOrderStripe = async (req, res) => {
  try {
    const { userId } = req.user;
    const { origin } = req.headers;
    const { items, address } = req.body;
    if (!address || items.length == 0) {
      res.json({ success: false, message: "Invalid data" });
    }
    let productData = [];

    let amount = items.reduce(async (acc, item) => {
      const product = await Product.findById(item.product);
      productData.push({
        name: product.name,
        price: product.offerPrice,
        quantity: item.quantity,
      });
      return acc + product.offerPrice * item.quantity;
    }, 0);
    amount = await amount;
    amount += Math.floor(amount * 0.2);
    const order = await Order.create({
      userId,
      address,
      items,
      amount,
      paymentType: "Online",
    });
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
    const line_items = productData.map((item) => {
      return {
        price_data: {
          currency: "inr",
          product_data: {
            name: item.name,
          },
          unit_amount: Math.floor(item.price + item.price * 0.02) * 100,
        },
        quantity: item.quantity,
      };
    });
    const session = await stripeInstance.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${origin}/loader?next=my-orders`,
      cancel_url: `${origin}/cart`,
      receipt_email: req.user.email,
      metadata: {
        orderId: order._id.toString(),
        userId,
      },
      billing_address_collection: "auto",
    });

    return res.json({ success: true, url: session.url });
  } catch (error) {
    console.log("error: ", error.message);
    return res.json({ success: false, message: error.message });
  }
};

export const stripWebhooks = async (req, res) => {
  console.log("req: ", req.body);

  const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripeInstance.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.log("error: ", error);
    res.status(400).send(`webhook error:${error.message}`);
  }
  console.log(event.data.object);
  console.log({ event: event });
  console.log(JSON.stringify(event, null, 2));

  switch (event.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;
      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });
      console.log({ session });
      console.log(JSON.stringify(session, null, 2));
      const { orderId, userId } = session.metadata;
      await Order.findByIdAndUpdate(orderId, { isPaid: true });
      await User.findByIdAndUpdate(userId, { cartItems: {} });
      break;
    }
    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;
      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });
      const { orderId } = session.data[0].metadata;
      await Order.findByIdAndDelete(orderId);
      break;
    }
    default:
      console.error(`Unhandled event type ${event.type}`);

      break;
  }
  res.json({ received: true });
};

export const getOrder = async (req, res) => {
  try {
    const { userId } = req.user;
    const orders = await Order.find({
      userId,
      $or: [{ paymentType: "COD", isPaid: false }],
    })
      .populate("items.product address")
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    console.log("error: ", error.message);
    return res.json({ success: false, message: error.message });
  }
};

export const getAllOrder = async (req, res) => {
  console.log("req: ", req);
  try {
    const orders = await Order.find({
      $or: [{ paymentType: "COD", isPaid: false }],
    })
      .populate("items.product address")
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    console.log("error: ", error.message);
    return res.json({ success: false, message: error.message });
  }
};
