import express from 'express'
import {placeOrder, placeOrderRazorpay, allOrders, userOrders, updateStatus, verifyRazorpay} from '../controllers/orderController.js'
import authUser from '../middleware/auth.js'
import adminAuth from '../middleware/adminAuth.js'

const orderRouter = express.Router();

// Admin features
orderRouter.post('/list', adminAuth, allOrders);
orderRouter.post('/update', adminAuth, updateStatus);
//payment features
orderRouter.post('/place', authUser, placeOrder);
orderRouter.post('/razorpay', authUser, placeOrderRazorpay);

// user features
orderRouter.post('/userorders', authUser, userOrders);

//verify Payment
orderRouter.post("/verifyRazorpay", authUser,verifyRazorpay)
export default orderRouter;