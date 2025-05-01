import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import Order from "@/models/Order"
import { verifyToken } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    await dbConnect()

    // Verify authentication token
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 },
      )
    }

    const token = authHeader.split(" ")[1]
    const userId = verifyToken(token)

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid token",
        },
        { status: 401 },
      )
    }

    const body = await request.json()
    const { email, order_data } = body

    // Create new order
    const order = await Order.create({
      email,
      order_data,
    })

    return NextResponse.json({
      success: true,
      orderId: order._id,
    })
  } catch (error) {
    console.error("Error placing order:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Server error",
      },
      { status: 500 },
    )
  }
}
