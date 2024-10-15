import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";

// Kiểm tra xem Stripe Secret Key có được tải đúng không
console.log("Stripe Secret Key:", process.env.STRIPE_SECRET_KEY);
console.log("Loi", process.env.JWT_SECRET);
const stripe = new Stripe(
  "sk_test_51Q9sXLGIulExr96JxGm2B0ObFlY68aVMRY9sJexSSI4cbZDMhgoaiufAE9VoEq5IzdBxgGJcQwfF485GtDFSe4VF006pVa05xX"
);

// Placing user order for FE
const placeOrder = async (req, res) => {
  const frontend_url = "http://localhost:5173";

  // Thêm log để kiểm tra thông tin request từ FE
  console.log("Received order request:", req.body);

  try {
    // Tạo một đơn hàng mới
    const newOrder = new orderModel({
      userId: req.body.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
    });

    console.log("New order created:", newOrder);

    // Lưu đơn hàng mới
    await newOrder.save();

    // Cập nhật dữ liệu giỏ hàng của người dùng
    await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

    // Tạo các mục thanh toán
    const line_items = req.body.items.map((item) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: item.name,
        },
        unit_amount: item.price * 100 * 80, // Giá tiền tính bằng paisa (1 INR = 100 paisa)
      },
      quantity: item.quantity,
    }));

    // Thêm phí vận chuyển
    line_items.push({
      price_data: {
        currency: "inr",
        product_data: {
          name: "Delivery Charges",
        },
        unit_amount: 2 * 100 * 80, // Phí giao hàng là 2 INR
      },
      quantity: 1,
    });

    console.log("Line items created:", line_items);

    // Tạo phiên thanh toán với Stripe
    const session = await stripe.checkout.sessions.create({
      line_items: line_items,
      mode: "payment",
      success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
    });

    console.log("Stripe session created:", session);

    // Gửi lại URL phiên thanh toán tới FE
    res.json({ success: true, session_url: session.url });
  } catch (error) {
    // Thêm log lỗi chi tiết
    console.error("Error placing order:", error);

    res
      .status(500)
      .json({ success: false, message: "Error", error: error.message });
  }
};
const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;
  try {
    if (success === "true") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      res.json({ success: true, message: "Paid" });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false, message: "Not paid" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.body.userId });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({
      success: false,
      message: "Error",
    });
  }
};
// List order for admin panel
const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, data: orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};
// api for updating order status
const updateStatus = async (req, res) => {
  try {
    await orderModel.findByIdAndUpdate(req.body.orderId, {
      status: req.body.status,
    });
    res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" });
  }
};
export { placeOrder, verifyOrder, userOrders, listOrders, updateStatus };
