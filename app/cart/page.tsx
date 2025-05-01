"use client"

import { useState } from "react"
import Link from "next/link"
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Navbar } from "@/components/navbar"
import { useCart } from "@/context/cart-context"
import { useAuth } from "@/context/auth-context"

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice } = useCart()
  const { isAuthenticated } = useAuth()
  const [isRemoving, setIsRemoving] = useState<string | null>(null)

  const deliveryFee = items.length > 0 ? 2.99 : 0
  const tax = (totalPrice * 0.05).toFixed(2)
  const total = (Number.parseFloat(totalPrice.toFixed(2)) + deliveryFee + Number.parseFloat(tax)).toFixed(2)

  const handleRemoveItem = (id: string) => {
    setIsRemoving(id)
    setTimeout(() => {
      removeItem(id)
      setIsRemoving(null)
    }, 300)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-semibold mb-4">Your cart is empty</h2>
            <p className="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet.</p>
            <Button asChild className="bg-orange-500 hover:bg-orange-600">
              <Link href="/">Browse Restaurants</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Cart Items ({items.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id + (item.size || "")}
                      className={`flex items-center gap-4 p-4 border rounded-lg transition-opacity ${
                        isRemoving === item.id ? "opacity-50" : "opacity-100"
                      }`}
                    >
                      <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0">
                        <img
                          src={item.image || "/placeholder.svg?height=64&width=64"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h3 className="font-medium">{item.name}</h3>
                          <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                        {item.size && <p className="text-sm text-gray-500 capitalize">Size: {item.size}</p>}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
            <div>
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>₹{totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Delivery Fee</span>
                      <span>₹{deliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax (5%)</span>
                      <span>₹{tax}</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>₹{total}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full bg-orange-500 hover:bg-orange-600">
                    <Link href={isAuthenticated ? "/checkout" : "/login"}>
                      {isAuthenticated ? "Proceed to Checkout" : "Login to Checkout"}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
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
