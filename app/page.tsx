"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ChevronRight, Search, Star } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Navbar } from "@/components/navbar"
import { foodService } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface FoodCategory {
  CategoryName: string
  name: string
  _id: string
}

interface FoodItem {
  _id: string
  name: string
  img: string
  options: { half?: string; full: string; regular?: string; medium?: string; large?: string }
  description: string
  CategoryName: string
}

export default function Home() {
  const [foodCategories, setFoodCategories] = useState<FoodCategory[]>([])
  const [foodItems, setFoodItems] = useState<FoodItem[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const data = await foodService.getFoodData()

        if (data && Array.isArray(data) && data.length >= 2) {
          setFoodCategories(data[1])
          setFoodItems(data[0])
        } else {
          throw new Error("Invalid data format received from API")
        }
      } catch (error) {
        console.error("Failed to fetch food data:", error)
        toast({
          title: "Notice",
          description: "Using sample data. Connect to backend for real data.",
          variant: "default",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [toast])

  // Group food items by category to create "restaurants"
  const restaurants = foodCategories.map((category) => {
    const items = foodItems.filter((item) => item.CategoryName === category.CategoryName)

    // Get the average price for the category
    const avgPrice =
      items.length > 0
        ? items.reduce((sum, item) => {
            const price = Number.parseFloat(item.options.full || item.options.regular || "0")
            return sum + price
          }, 0) / items.length
        : 0

    // Determine price range
    let priceRange = "$"
    if (avgPrice > 200) priceRange = "$$$"
    else if (avgPrice > 100) priceRange = "$$"

    return {
      id: category._id,
      name: category.CategoryName,
      cuisine: [category.CategoryName, "Indian"],
      rating: (3.5 + Math.random() * 1.5).toFixed(1),
      deliveryTime: Math.floor(20 + Math.random() * 20),
      deliveryFee: (Math.random() * 3 + 1).toFixed(2),
      price: priceRange,
      distance: (Math.random() * 3 + 0.5).toFixed(1),
      image: items[0]?.img || "/placeholder.svg?height=300&width=400",
    }
  })

  // Create cuisine categories from food categories
  const cuisines = foodCategories.map((category) => ({
    id: category._id,
    name: category.CategoryName,
    icon: "/placeholder.svg?height=50&width=50",
  }))

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-orange-50 to-white py-12">
          <div className="container px-4">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              Delicious food, delivered to your door
            </h1>
            <p className="mt-4 max-w-2xl text-gray-500">
              Order from your favorite local restaurants with free delivery on your first order.
            </p>
          </div>
        </section>
        <section className="py-8">
          <div className="container px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Popular Restaurants</h2>
              <Link href="/restaurants" className="flex items-center text-orange-500 text-sm font-medium">
                View all
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
            <div className="relative">
              <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input placeholder="Search restaurants or cuisines" className="pl-9" />
                  </div>
                  <Tabs defaultValue="delivery" className="w-[300px]">
                    <TabsList>
                      <TabsTrigger value="delivery">Delivery</TabsTrigger>
                      <TabsTrigger value="pickup">Pickup</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="rounded-lg border overflow-hidden animate-pulse">
                      <div className="aspect-[4/3] bg-gray-200" />
                      <div className="p-4 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-200 rounded w-1/2" />
                        <div className="h-3 bg-gray-200 rounded w-5/6" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {restaurants.map((restaurant) => (
                    <Link
                      key={restaurant.id}
                      href={`/restaurant/${restaurant.id}`}
                      className="group rounded-lg border overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="aspect-[4/3] relative">
                        <img
                          src={restaurant.image || "/placeholder.svg?height=300&width=400"}
                          alt={restaurant.name}
                          className="object-cover w-full h-full"
                        />
                        <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded text-sm font-medium">
                          {restaurant.deliveryTime} min
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-bold group-hover:text-orange-500 transition-colors">{restaurant.name}</h3>
                          <div className="flex items-center bg-green-50 px-1.5 py-0.5 rounded">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                            <span className="text-xs font-medium">{restaurant.rating}</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">{restaurant.cuisine.join(", ")}</p>
                        <div className="mt-2 flex items-center text-sm text-gray-500">
                          <span className="flex items-center">
                            {restaurant.price}
                            <span className="mx-1">•</span>
                            {restaurant.distance} km
                          </span>
                          <span className="ml-auto text-sm font-medium text-gray-500">
                            ₹{restaurant.deliveryFee} delivery
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
        <section className="py-8 bg-orange-50">
          <div className="container px-4">
            <h2 className="text-2xl font-bold mb-6">Cuisines</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {cuisines.map((cuisine) => (
                <Link
                  key={cuisine.id}
                  href={`/cuisine/${cuisine.id}`}
                  className="flex flex-col items-center p-4 bg-white rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-2">
                    <img
                      src={cuisine.icon || "/placeholder.svg?height=50&width=50"}
                      alt={cuisine.name}
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  <span className="text-sm font-medium">{cuisine.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-8 bg-gray-50">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div>
              <h3 className="font-bold text-xl text-orange-500 mb-4">GoFood</h3>
              <p className="text-gray-500 max-w-md">
                Connecting you with the best restaurants in your area for a delicious dining experience.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
              <div>
                <h4 className="font-semibold mb-3">About</h4>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li>
                    <Link href="#">About Us</Link>
                  </li>
                  <li>
                    <Link href="#">Careers</Link>
                  </li>
                  <li>
                    <Link href="#">Investors</Link>
                  </li>
                  <li>
                    <Link href="#">Company Blog</Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Support</h4>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li>
                    <Link href="#">Contact Us</Link>
                  </li>
                  <li>
                    <Link href="#">Help Center</Link>
                  </li>
                  <li>
                    <Link href="#">Safety</Link>
                  </li>
                  <li>
                    <Link href="#">Terms of Service</Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Get the App</h4>
                <ul className="space-y-2 text-sm text-gray-500">
                  <li>
                    <Link href="#">iOS App</Link>
                  </li>
                  <li>
                    <Link href="#">Android App</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} TastyBites. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
