import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import FoodItem from "@/models/FoodItem"
import FoodCategory from "@/models/FoodCategory"

export async function POST(request: Request) {
  try {
    await dbConnect()

    // Fetch food items and categories
    const foodItems = await FoodItem.find({})
    const foodCategories = await FoodCategory.find({})

    // If no data exists, seed the database with initial data
    if (foodItems.length === 0 || foodCategories.length === 0) {
      await seedDatabase()

      // Fetch again after seeding
      const foodItems = await FoodItem.find({})
      const foodCategories = await FoodCategory.find({})

      return NextResponse.json([foodItems, foodCategories])
    }

    return NextResponse.json([foodItems, foodCategories])
  } catch (error) {
    console.error("Error fetching food data:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Server error",
      },
      { status: 500 },
    )
  }
}

// Helper function to seed the database with initial data
async function seedDatabase() {
  // Define food categories
  const categories = [
    { CategoryName: "Biryani", name: "Biryani" },
    { CategoryName: "Curry", name: "Curry" },
    { CategoryName: "South Indian", name: "South Indian" },
    { CategoryName: "Pizza", name: "Pizza" },
  ]

  // Define food items
  const items = [
    {
      name: "Chicken Biryani",
      img: "https://media.istockphoto.com/id/1345624336/photo/chicken-biriyani.jpg?s=612x612&w=0&k=20&c=adU_N0P-1SKMQLZu5yu7aPknfLLgbViI8XILqLP92A4=",
      options: { half: "140", full: "220" },
      description: "Fragrant basmati rice cooked with tender chicken pieces and aromatic spices.",
      CategoryName: "Biryani",
    },
    {
      name: "Veg Biryani",
      img: "https://media.istockphoto.com/id/1363306842/photo/veg-biryani-or-veg-pulao-served-in-a-white-bowl-selective-focus.jpg?s=612x612&w=0&k=20&c=jCPrWOLTdBJZFsECXGJ0qd8V2YRJvl_RUIm4YBGZz5c=",
      options: { half: "110", full: "180" },
      description: "Fragrant basmati rice cooked with mixed vegetables and aromatic spices.",
      CategoryName: "Biryani",
    },
    {
      name: "Paneer Butter Masala",
      img: "https://media.istockphoto.com/id/1320788605/photo/paneer-butter-masala-or-cheese-cottage-curry-in-black-bowl-on-dark-background-selective-focus.jpg?s=612x612&w=0&k=20&c=_UkPzXMwp3LYl0-qiB7-c_yl1zQ4qEXDOYoXO5Jc6qs=",
      options: { half: "150", full: "240" },
      description: "Cottage cheese cubes in a rich and creamy tomato-based gravy.",
      CategoryName: "Curry",
    },
    {
      name: "Butter Chicken",
      img: "https://media.istockphoto.com/id/1093661590/photo/butter-chicken-curry-with-tender-chicken-breast-cream-butter-honey.jpg?s=612x612&w=0&k=20&c=XeXkHzxGxVsGJkGrGI9vWFQnEBTR6uhXLjMNZ8DKM-0=",
      options: { half: "170", full: "260" },
      description: "Tender chicken pieces in a rich and creamy tomato-based gravy.",
      CategoryName: "Curry",
    },
    {
      name: "Masala Dosa",
      img: "https://media.istockphoto.com/id/1156896083/photo/masala-dosa.jpg?s=612x612&w=0&k=20&c=qiIya8rlVW6jDtDaBPG7vBTdHZKKcB9kKM4oG7Mz9T4=",
      options: { regular: "120" },
      description: "Crispy rice crepe filled with spiced potato filling, served with chutney and sambar.",
      CategoryName: "South Indian",
    },
    {
      name: "Idli Sambar",
      img: "https://media.istockphoto.com/id/638506124/photo/idli-with-coconut-chutney-and-sambhar.jpg?s=612x612&w=0&k=20&c=y0_NCJnCh_LoFbTBrYvXOxA7K0NaiGgvYBKFgBnFGlE=",
      options: { regular: "80" },
      description: "Steamed rice cakes served with lentil soup and coconut chutney.",
      CategoryName: "South Indian",
    },
    {
      name: "Margherita Pizza",
      img: "https://media.istockphoto.com/id/1280329631/photo/italian-pizza-margherita-with-tomatoes-and-mozzarella-cheese-on-wooden-cutting-board-close-up.jpg?s=612x612&w=0&k=20&c=3Rt-h2MX5PQIVoV7O_BNTVlMR0JKHiejlAcyS16nf_Y=",
      options: { regular: "180", medium: "280", large: "350" },
      description: "Classic pizza with tomato sauce, mozzarella cheese, and fresh basil.",
      CategoryName: "Pizza",
    },
    {
      name: "Pepperoni Pizza",
      img: "https://media.istockphoto.com/id/1042948900/photo/pepperoni-pizza-on-wooden-table.jpg?s=612x612&w=0&k=20&c=APVGShxs1OY_YAEcHKRGQJ-3hJdIEbxR5BCYnABQRSQ=",
      options: { regular: "220", medium: "320", large: "420" },
      description: "Pizza topped with tomato sauce, mozzarella cheese, and pepperoni slices.",
      CategoryName: "Pizza",
    },
  ]

  // Insert categories
  await FoodCategory.insertMany(categories)

  // Insert food items
  await FoodItem.insertMany(items)

  console.log("Database seeded successfully")
}
