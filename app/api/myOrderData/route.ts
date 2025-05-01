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
    const { email } = body

    // Find orders by email
    const orders = await Order.find({ email }).sort({ "order_data.order_date": -1 })

    return NextResponse.json({
      success: true,
      orderData: {
        order_data: orders.map((order) => order.order_data),
      },
    })
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Server error",
      },
      { status: 500 },
    )
  }
}
