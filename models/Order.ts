import mongoose from "mongoose"

const OrderItemSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  qty: {
    type: Number,
    required: true,
  },
  size: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
})

const OrderSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  order_data: {
    order_date: {
      type: Date,
      default: Date.now,
    },
    items: [OrderItemSchema],
    total_price: {
      type: Number,
      required: true,
    },
    delivery_address: {
      type: String,
      required: true,
    },
    phone_number: {
      type: String,
      required: true,
    },
    payment_method: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "Pending",
      enum: ["Pending", "Processing", "Delivered", "Cancelled"],
    },
  },
})

export default mongoose.models.Order || mongoose.model("Order", OrderSchema)
