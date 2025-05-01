"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Navbar } from "@/components/navbar"
import { useCart } from "@/context/cart-context"
import { useAuth } from "@/context/auth-context"
import { foodService } from "@/lib/api"

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [zip, setZip] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)

  const { items, totalPrice, clearCart } = useCart()
  const { user, token, isAuthenticated } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const deliveryFee = 2.99
  const tax = (totalPrice * 0.05).toFixed(2)
  const total = (Number.parseFloat(totalPrice.toFixed(2)) + deliveryFee + Number.parseFloat(tax)).toFixed(2)

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please login to continue with checkout",
        variant: "destructive",
      })
      router.push("/login")
    }

    // Pre-fill user location if available
    if (user?.location) {
      const locationParts = user.location.split(",")
      if (locationParts.length > 1) {
        setCity(locationParts[0].trim())
        setState(locationParts[1].trim())
      } else {
        setAddress(user.location)
      }
    }
  }, [isAuthenticated, router, toast, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!address || !city || !state || !zip || !phone) {
      toast({
        title: "Error",
        description: "Please fill in all delivery information",
        variant: "destructive",
      })
      return
    }

    if (items.length === 0) {
      toast({
        title: "Error",
        description: "Your cart is empty",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      // Format order data for the API
      const orderData = {
        email: user?.email,
        order_data: {
          order_date: new Date().toISOString(),
          items: items.map((item) => ({
            id: item.id,
            name: item.name,
            qty: item.quantity,
            size: item.size || "regular",
            price: item.price,
          })),
          total_price: Number.parseFloat(total),
          delivery_address: `${address}, ${city}, ${state} ${zip}`,
          phone_number: phone,
          payment_method: paymentMethod,
        },
      }

      if (!token) {
        throw new Error("Authentication token not found")
      }

      const response = await foodService.placeOrder(orderData, token)

      if (response.success) {
        toast({
          title: "Order placed successfully",
          description: "Your order has been placed and will be delivered soon",
        })

        clearCart()
        router.push("/orders")
      } else {
        throw new Error(response.error || "Failed to place order")
      }
    } catch (error) {
      console.error("Order error:", error)
      toast({
        title: "Error",
        description: "Failed to place your order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container px-4 py-8">
        <div className="mb-6">
          <Link href="/" className="flex items-center text-sm text-orange-500 font-medium">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Restaurant
          </Link>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Information</CardTitle>
                  <CardDescription>Enter your delivery address</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        placeholder="123 Main St"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          placeholder="Anytown"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          placeholder="CA"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zip">ZIP Code</Label>
                        <Input
                          id="zip"
                          placeholder="12345"
                          value={zip}
                          onChange={(e) => setZip(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        placeholder="(555) 123-4567"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                  <CardDescription>Select your preferred payment method</CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="card" onValueChange={setPaymentMethod}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="card">Credit Card</TabsTrigger>
                      <TabsTrigger value="upi">UPI</TabsTrigger>
                      <TabsTrigger value="cash">Cash</TabsTrigger>
                    </TabsList>
                    <TabsContent value="card" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="card-number">Card Number</Label>
                        <Input id="card-number" placeholder="1234 5678 9012 3456" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiry">Expiry Date</Label>
                          <Input id="expiry" placeholder="MM/YY" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvc">CVC</Label>
                          <Input id="cvc" placeholder="123" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="name-on-card">Name on Card</Label>
                        <Input id="name-on-card" placeholder="John Doe" />
                      </div>
                    </TabsContent>
                    <TabsContent value="upi" className="mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="upi-id">UPI ID</Label>
                        <Input id="upi-id" placeholder="yourname@upi" />
                        <p className="text-sm text-gray-500 mt-2">
                          You will receive a payment request on your UPI app when you place the order.
                        </p>
                      </div>
                    </TabsContent>
                    <TabsContent value="cash" className="mt-4">
                      <div className="text-center py-4">
                        <p>Please have the exact amount ready for the delivery person.</p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                  <CardDescription>Review your order</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div key={item.id + (item.size || "")} className="flex justify-between text-sm">
                          <span>
                            {item.quantity} × {item.name} {item.size && `(${item.size})`}
                          </span>
                          <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <Separator />
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>₹{totalPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery Fee</span>
                        <span>₹{deliveryFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax</span>
                        <span>₹{tax}</span>
                      </div>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>₹{total}</span>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-orange-500 hover:bg-orange-600"
                      disabled={loading || items.length === 0}
                    >
                      {loading ? "Processing..." : "Place Order"}
                    </Button>
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-4">
                      <CreditCard className="h-4 w-4" />
                      <span>Secure payment processing</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
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
