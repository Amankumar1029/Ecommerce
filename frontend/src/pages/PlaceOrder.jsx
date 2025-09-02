import React, { useContext, useState } from "react";
import Title from "../components/Title";
import CartTotal from "../components/CartTotal";
import assets from "../assets/assets";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import { toast } from "react-toastify";
import { currency } from "../../../admin/src/App";

const PlaceOrder = () => {
  const [method, setMethod] = useState("cod");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    navigate,
    backendUrl,
    token,
    cartItems,
    getCartAmount,
    setCartItems,
    delivery_fee,
    products,
  } = useContext(ShopContext);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    street: "",
    city: "",
    state: "",
    zipcode: "",
    country: "",
    phone: "",
  });

  const onChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setFormData((data) => ({ ...data, [name]: value }));
  };

  const initPay = (order) => {
    // Check if Razorpay is loaded
    if (!window.Razorpay) {
      toast.error(
        "Razorpay is not loaded. Please refresh the page and try again."
      );
      return;
    }

    console.log("Initializing Razorpay payment with order:", order);

    if (!import.meta.env.VITE_RAZORPAY_KEY_ID) {
      toast.error("Razorpay key not configured. Please contact support.");
      return;
    }

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "Order Payment",
      description: "Order Payment",
      order_id: order.id,
      receipt: order.receipt,
      handler: async (response) => {
        console.log("Razorpay payment response:", response);
        try {
          const { data } = await axios.post(
            backendUrl + "/api/order/verifyRazorpay",
            response,
            { headers: { token } }
          );
          if (data.success) {
            toast.success("Payment successful! Order placed successfully.");
            setCartItems({});
            console.log(
              "Payment verified successfully, navigating to orders page..."
            );
            // Add a small delay to ensure everything is processed
            setTimeout(() => {
              try {
                navigate("/orders", { replace: true });
              } catch (navError) {
                console.error("Navigation error:", navError);
                // Fallback: try to navigate after a short delay
                setTimeout(() => {
                  try {
                    navigate("/orders", { replace: true });
                  } catch (secondNavError) {
                    console.error("Second navigation error:", secondNavError);
                    // Final fallback: use window.location
                    window.location.href = "/orders";
                  }
                }, 100);
              }
            }, 500);
          } else {
            toast.error(data.message || "Payment verification failed");
          }
        } catch (error) {
          console.log("Payment verification error:", error);
          toast.error(
            error.response?.data?.message ||
              "Payment verification failed. Please contact support."
          );
        }
      },
      modal: {
        ondismiss: function () {
          console.log("Payment modal dismissed");
        },
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (isSubmitting) {
      return; // Prevent multiple submissions
    }

    if (!token) {
      toast.error("Please login to place an order");
      navigate("/login");
      return;
    }

    setIsSubmitting(true);
    try {
      let orderItems = [];
      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            const itemInfo = structuredClone(
              products.find((product) => product._id === items)
            );
            if (itemInfo) {
              {
                itemInfo.size = item;
                itemInfo.quantity = cartItems[items][item];
                orderItems.push(itemInfo);
              }
            }
          }
        }
      }

      if (orderItems.length === 0) {
        toast.error("No items in cart to place order");
        return;
      }

      let orderData = {
        address: formData,
        items: orderItems,
        amount: getCartAmount() + delivery_fee,
      };
      console.log("Order data being sent:", orderData);

      switch (method) {
        case "stripe":
          break;
        case "razorpay": {
          try {
            const responseRazorpay = await axios.post(
              backendUrl + "/api/order/razorpay",
              orderData,
              { headers: { token } }
            );
            if (responseRazorpay.data.success) {
              console.log(
                "Razorpay order created:",
                responseRazorpay.data.order
              );
              initPay(responseRazorpay.data.order);
            } else {
              toast.error(
                responseRazorpay.data.message ||
                  "Failed to create Razorpay order"
              );
            }
          } catch (error) {
            console.log("Razorpay order creation error:", error);
            toast.error(
              error.response?.data?.message || "Failed to create Razorpay order"
            );
          }
          break;
        }
        case "cod": {
          const response = await axios.post(
            backendUrl + "/api/order/place",
            orderData,
            { headers: { token } }
          );
          console.log("Order placement response:", response.data);
          if (response.data.success) {
            setCartItems({});
            console.log(
              "Order placed successfully, navigating to orders page..."
            );
            try {
              navigate("/orders", { replace: true });
              // Show success message after navigation
              setTimeout(() => {
                toast.success(response.data.message);
              }, 100);
            } catch (navError) {
              console.error("Navigation error:", navError);
              // Fallback: try to navigate after a short delay
              setTimeout(() => {
                try {
                  navigate("/orders", { replace: true });
                } catch (secondNavError) {
                  console.error("Second navigation error:", secondNavError);
                  // Final fallback: use window.location
                  window.location.href = "/orders";
                }
                toast.success(response.data.message);
              }, 100);
            }
          } else {
            toast.error(response.data.message);
          }
          break;
        }
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t"
    >
      {/* Left side */}
      <div className="flex flex-col w-full gap-4 sm:max-w-[480px]">
        <div className="text-xl sm:text-2xl my-3">
          <Title text1={"DELIVERY"} text2={"INFORMATION"} />
        </div>
        <div className="flex gap-3">
          <input
            required
            onChange={onChangeHandler}
            name="firstName"
            value={formData.firstName}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="First name"
          />
          <input
            required
            onChange={onChangeHandler}
            name="lastName"
            value={formData.lastName}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="Last name"
          />
        </div>
        <input
          required
          onChange={onChangeHandler}
          name="email"
          value={formData.email}
          className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          type="email"
          placeholder="Email address"
        />
        <input
          required
          onChange={onChangeHandler}
          name="street"
          value={formData.street}
          className="border border-gray-300 rounded py-1.5 px-3.5  w-full"
          type="text"
          placeholder="Street"
        />
        <div className="flex  gap-3">
          <input
            required
            onChange={onChangeHandler}
            name="city"
            value={formData.city}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="City"
          />
          <input
            required
            onChange={onChangeHandler}
            name="state"
            value={formData.state}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="State"
          />
        </div>
        <div className="flex gap-3">
          <input
            required
            onChange={onChangeHandler}
            name="zipcode"
            value={formData.zipcode}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="number"
            placeholder="Zipcode"
          />
          <input
            required
            onChange={onChangeHandler}
            name="country"
            value={formData.country}
            className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
            type="text"
            placeholder="Country"
          />
        </div>
        <input
          required
          onChange={onChangeHandler}
          name="phone"
          value={formData.phone}
          className="border border-gray-300 rounded py-1.5 px-3.5 w-full"
          type="number"
          placeholder="Phone-number"
        />
      </div>
      {/* Right Side */}
      <div className="mt-8">
        <div className="mt-8 min-w-80">
          <CartTotal />
        </div>
        <div className="mt-12">
          <Title text1={"PAYMENT"} text2={"METHOD"} />

          {/* Payment Method Selection */}
          <div className="flex gap-3 flex-col lg:flex-row">
            
            <div
              onClick={() => setMethod("razorpay")}
              className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
            >
              <p
                className={`min-w-3.5 h-3.5 border rounded-full ${
                  method === "razorpay" ? "bg-green-400" : ""
                }`}
              ></p>
              <img className="h-5 mx-4" src={assets.razorpay_logo} alt="" />
            </div>
            <div
              onClick={() => setMethod("cod")}
              className="flex items-center gap-3 border p-2 px-3 cursor-pointer"
            >
              <p
                className={`min-w-3.5 h-3.5 border rounded-full ${
                  method === "cod" ? "bg-green-400" : ""
                }`}
              >
                {" "}
              </p>
              <p className="text-gray-500 text-sm font-medium mx-4">
                CASH ON DELIVERY
              </p>
            </div>
          </div>

          <div className="w-full text-end mt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-16 py-3 text-sm cursor-pointer ${
                isSubmitting
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-black text-white"
              }`}
            >
              {isSubmitting ? "PLACING ORDER..." : "PLACE ORDER"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;
