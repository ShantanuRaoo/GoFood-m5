"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronLeft, Clock, MapPin, Minus, Plus, ShoppingBag, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Navbar } from "@/components/navbar"
import { foodService } from "@/lib/api"
import { useCart, type CartItem } from "@/context/cart-context"

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

export default function RestaurantPage({ params }: { params: { id: string } }) {
  const { toast } = useToast()
  const { items, addItem, updateQuantity } = useCart()
  const [foodCategory, setFoodCategory] = useState<FoodCategory | null>(null)
  const [foodItems, setFoodItems] = useState<FoodItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const data = await foodService.getFoodData()

        if (data && Array.isArray(data) && data.length >= 2) {
          // Find the category by ID
          const category = data[1].find((cat: FoodCategory) => cat._id === params.id)
          setFoodCategory(category || null)

          // Filter items by category
          if (category) {
            const items = data[0].filter((item: FoodItem) => item.CategoryName === category.CategoryName)
            setFoodItems(items)
          }
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

        // Use mock data if API fails
        const mockData = getMockFoodData()
        const category = mockData[1].find((cat: FoodCategory) => cat._id === params.id)
        setFoodCategory(category || null)

        if (category) {
          const items = mockData[0].filter((item: FoodItem) => item.CategoryName === category.CategoryName)
          setFoodItems(items)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id, toast])

  // Add this helper function to the component
  function getMockFoodData() {
    const foodItems = [
      {
        _id: "1",
        name: "Chicken Biryani",
        img: "/placeholder.svg?height=200&width=200",
        options: { half: "140", full: "220" },
        description: "Fragrant basmati rice cooked with tender chicken pieces and aromatic spices.",
        CategoryName: "Biryani",
      },
      {
        _id: "2",
        name: "Veg Biryani",
        img: "/placeholder.svg?height=200&width=200",
        options: { half: "110", full: "180" },
        description: "Fragrant basmati rice cooked with mixed vegetables and aromatic spices.",
        CategoryName: "Biryani",
      },
      // More items as needed...
    ]

    const foodCategories = [
      {
        _id: "c1",
        CategoryName: "Biryani",
        name: "Biryani",
      },
      {
        _id: "c2",
        CategoryName: "Curry",
        name: "Curry",
      },
      {
        _id: "c3",
        CategoryName: "South Indian",
        name: "South Indian",
      },
      {
        _id: "c4",
        CategoryName: "Pizza",
        name: "Pizza",
      },
    ]

    return [foodItems, foodCategories]
  }

  const handleAddToCart = (item: FoodItem, size: string, price: number) => {
    const cartItem: CartItem = {
      id: item._id,
      name: item.name,
      price: price,
      quantity: 1,
      image: item.img,
      description: item.description,
      size: size,
    }

    addItem(cartItem)

    toast({
      title: "Added to cart",
      description: `${item.name} (${size}) has been added to your cart.`,
    })
  }

  // Calculate cart total for this restaurant
  const cartItems = items.filter((item) => foodItems.some((foodItem) => foodItem._id === item.id))

  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)
  const deliveryFee = 2.99

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </div>
    )
  }

  if (!foodCategory) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center flex-col p-4">
          <h2 className="text-2xl font-bold mb-4">Restaurant not found</h2>
          <p className="text-gray-500 mb-6">The restaurant you're looking for doesn't exist or has been removed.</p>
          <Button asChild className="bg-orange-500 hover:bg-orange-600">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Create restaurant data from category
  const restaurant = {
    id: foodCategory._id,
    name: foodCategory.CategoryName,
    cuisine: [foodCategory.CategoryName, "Indian"],
    rating: (3.5 + Math.random() * 1.5).toFixed(1),
    deliveryTime: Math.floor(20 + Math.random() * 20),
    deliveryFee: deliveryFee,
    price: "$$",
    distance: (Math.random() * 3 + 0.5).toFixed(1),
    image: foodItems[0]?.img || "/placeholder.svg?height=300&width=800",
    description: `Serving the best ${foodCategory.CategoryName.toLowerCase()} in town. Our ingredients are locally sourced and prepared fresh daily.\`,  in town. Our ingredients are locally sourced and prepared fresh daily.`,
    address: "123 Main St, Anytown, USA",
    hours: "11:00 AM - 10:00 PM",
  }

  // Group food items by category for menu sections
  const menuCategories = [
    {
      category: "Popular Items",
      items: foodItems.slice(0, Math.min(2, foodItems.length)),
    },
    {
      category: "Main Dishes",
      items: foodItems.filter((item) => item.options.full || item.options.regular || item.options.large),
    },
    {
      category: "Sides",
      items: foodItems.filter((item) => item.options.half || (item.options.regular && !item.options.large)),
    },
  ].filter((category) => category.items.length > 0)

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="relative h-64 bg-gray-200">
          <img
            src={restaurant.image || "/placeholder.svg"}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <Link href="/" className="absolute top-4 left-4 bg-white p-2 rounded-full shadow-md">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </div>
        <div className="container px-4 py-6">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{restaurant.name}</h1>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                <span>{restaurant.cuisine.join(", ")}</span>
                <span>•</span>
                <span>{restaurant.price}</span>
                <span>•</span>
                <span className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                  {restaurant.rating}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-4 text-sm">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{restaurant.deliveryTime} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{restaurant.distance} miles</span>
                </div>
              </div>
              <p className="mt-4 text-gray-600">{restaurant.description}</p>
              <div className="mt-6">
                <Tabs defaultValue="menu">
                  <TabsList>
                    <TabsTrigger value="menu">Menu</TabsTrigger>
                    <TabsTrigger value="info">Info</TabsTrigger>
                    <TabsTrigger value="reviews">Reviews</TabsTrigger>
                  </TabsList>
                  <TabsContent value="menu" className="mt-6">
                    {menuCategories.map((category) => (
                      <div key={category.category} className="mb-8">
                        <h2 className="text-xl font-bold mb-4">{category.category}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {category.items.map((item) => (
                            <div
                              key={item._id}
                              className="flex gap-4 p-4 border rounded-lg hover:shadow-sm transition-shadow"
                            >
                              <div className="flex-1">
                                <h3 className="font-bold">{item.name}</h3>
                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                                <div className="mt-2">
                                  {Object.entries(item.options).map(([size, price]) => (
                                    <div key={size} className="flex items-center justify-between mt-1">
                                      <span className="text-sm capitalize">
                                        {size}: ₹{price}
                                      </span>
                                      <Button
                                        size="sm"
                                        onClick={() => handleAddToCart(item, size, Number.parseFloat(price))}
                                        className="bg-orange-500 hover:bg-orange-600"
                                      >
                                        Add
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="w-20 h-20 rounded overflow-hidden flex-shrink-0">
                                <img
                                  src={item.img || "/placeholder.svg"}
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                  <TabsContent value="info">
                    <div className="mt-6 space-y-4">
                      <div>
                        <h3 className="font-bold">Hours</h3>
                        <p className="text-gray-600">{restaurant.hours}</p>
                      </div>
                      <div>
                        <h3 className="font-bold">Address</h3>
                        <p className="text-gray-600">{restaurant.address}</p>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="reviews">
                    <div className="mt-6">
                      <p className="text-gray-500">Reviews coming soon.</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
            <div className="md:w-80">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg flex items-center gap-2 mb-4">
                    <ShoppingBag className="h-5 w-5" />
                    Your Order
                  </h3>
                  {cartItems.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <ShoppingBag className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>Your cart is empty</p>
                      <p className="text-sm mt-1">Add items to get started</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4 mb-4">
                        {cartItems.map((item) => (
                          <div key={item.id + item.size} className="flex justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="w-6 text-center">{item.quantity}</span>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                                <span className="font-medium">
                                  {item.name} {item.size && `(${item.size})`}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">₹{(item.price * item.quantity).toFixed(2)}</div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal</span>
                          <span>₹{cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Delivery Fee</span>
                          <span>₹{restaurant.deliveryFee.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-bold pt-2 border-t">
                          <span>Total</span>
                          <span>₹{(cartTotal + restaurant.deliveryFee).toFixed(2)}</span>
                        </div>
                      </div>
                      <Button asChild className="w-full mt-4 bg-orange-500 hover:bg-orange-600">
                        <Link href="/checkout">Proceed to Checkout</Link>
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
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
            <p>© {new Date().getFullYear()} GoFood. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
