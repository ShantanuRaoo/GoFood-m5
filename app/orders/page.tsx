"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Navbar } from "@/components/navbar"
import { useAuth } from "@/context/auth-context"
import { foodService } from "@/lib/api"

interface OrderItem {
  id: string
  name: string
  qty: number
  size: string
  price: number
}

interface Order {
  _id: string
  order_date: string
  items: OrderItem[]
  total_price: number
  delivery_address: string
  phone_number: string
  payment_method: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const { isAuthenticated, token } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please login to view your orders",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    const fetchOrders = async () => {
      try {
        setLoading(true)
        if (!token) {
          throw new Error("Authentication token not found")
        }

        const response = await foodService.getMyOrders(token)

        if (response.orderData && response.orderData.order_data) {
          setOrders(response.orderData.order_data.reverse())
        } else {
          setOrders([])
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error)
        toast({
          title: "Error",
          description: "Failed to load your orders. Please try again later.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [isAuthenticated, router, toast, token])

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">My Orders</h1>
          <p className="text-gray-500 mt-2">View your order history</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-4">No orders yet</h2>
            <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
            <Button asChild className="bg-orange-500 hover:bg-orange-600">
              <Link href="/">Browse Restaurants</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order._id}>
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                      <CardTitle>Order #{order._id.slice(-6)}</CardTitle>
                      <CardDescription>{formatDate(order.order_date)}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium bg-green-100 text-green-800 px-2 py-1 rounded">
                        Delivered
                      </span>
                      <span className="text-sm font-medium">Total: ₹{order.total_price.toFixed(2)}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Items</h3>
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>
                              {item.qty} × {item.name} ({item.size})
                            </span>
                            <span>₹{(item.price * item.qty).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium mb-2">Delivery Address</h3>
                      <p className="text-sm text-gray-600">{order.delivery_address}</p>
                    </div>
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium mb-1">Payment Method</h3>
                        <p className="text-sm text-gray-600 capitalize">{order.payment_method}</p>
                      </div>
                      <div>
                        <h3 className="font-medium mb-1">Phone Number</h3>
                        <p className="text-sm text-gray-600">{order.phone_number}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <footer className="border-t py-8 bg-gray-50 mt-12">
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
