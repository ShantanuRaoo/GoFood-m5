import mongoose from "mongoose"

const FoodCategorySchema = new mongoose.Schema({
  CategoryName: {
    type: String,
    required: [true, "Please provide a category name"],
    unique: true,
  },
  name: {
    type: String,
    required: [true, "Please provide a name"],
  },
})

export default mongoose.models.FoodCategory || mongoose.model("FoodCategory", FoodCategorySchema)
