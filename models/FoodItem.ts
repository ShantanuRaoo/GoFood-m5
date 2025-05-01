import mongoose from "mongoose"

const FoodItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name"],
    maxlength: [100, "Name cannot be more than 100 characters"],
  },
  img: {
    type: String,
    required: [true, "Please provide an image URL"],
  },
  options: {
    type: Object,
    required: [true, "Please provide options"],
  },
  description: {
    type: String,
    required: [true, "Please provide a description"],
  },
  CategoryName: {
    type: String,
    required: [true, "Please provide a category name"],
  },
})

export default mongoose.models.FoodItem || mongoose.model("FoodItem", FoodItemSchema)
