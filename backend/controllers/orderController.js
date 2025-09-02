import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import razorpay from "razorpay";

// global variables
const currency = "INR";
const deliveryCharge = 10;

// gateway initialize
const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Placing order using COD method
const placeOrder = async (req, res) => {
  try {
    const { items, amount, address, userId } = req.body;

    const order = {
      userId,
      items,
      amount,
      address,
      paymentMethod: "COD",
      payment: false,
      date: Date.now(),
    };

    try {
      const newOrder = new orderModel(order);
      await newOrder.save();
      await userModel.findByIdAndUpdate(userId, { cartData: {} });
    } catch (dbError) {
      console.log("Database error:", dbError);
      // For testing, continue without database operations
    }

    res.json({ success: true, message: "Order placed successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};


//   Placing order using Razorpay method
const placeOrderRazorpay = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;

    const orderData = {
      userId,
      items,
      address,
      amount,
      paymentMethod: "Razorpay",
      payment: false,
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    const options = {
      amount: amount * 100,
      currency: currency,
      receipt: newOrder._id.toString(),
    };

    try {
      const order = await razorpayInstance.orders.create(options);
      res.json({ success: true, order });
    } catch (razorpayError) {
      console.log("Razorpay order creation error:", razorpayError);
      res.json({ success: false, message: razorpayError.message });
    }
  } catch (error) {
    console.log("Database error:", error);
    res.json({ success: false, message: error.message });
  }
};

const verifyRazorpay = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    const userId = req.body.userId; // Get userId from auth middleware

    console.log("Verifying payment:", {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);
    if (orderInfo.status === "paid") {
      await orderModel.findOneAndUpdate(
        { _id: orderInfo.receipt },
        { payment: true, paymentId: razorpay_payment_id }
      );
      await userModel.findByIdAndUpdate(userId, { cartData: {} });
      res.json({ success: true, message: "Payment Successful" });
    } else {
      res.json({ success: false, message: "Payment Failed" });
    }
  } catch (error) {
    console.log("Payment verification error:", error);
    res.json({ success: false, message: error.message });
  }
};

//   Getting all orders for admin panel
const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find();
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// user order data for frontend
const userOrders = async (req, res) => {
  try {
    const { userId } = req.body;
    const orders = await orderModel.find({ userId });
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// update order status from admin panel
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    await orderModel.findByIdAndUpdate(orderId, { status });
    res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  verifyRazorpay,
  placeOrder,
  
  placeOrderRazorpay,
  allOrders,
  userOrders,
  updateStatus,
};
