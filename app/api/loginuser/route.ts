import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import User from "@/models/User"

export async function POST(request: Request) {
  try {
    await dbConnect()

    const body = await request.json()
    const { email, password } = body

    // Find user by email
    const user = await User.findOne({ email }).select("+password")
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid credentials",
        },
        { status: 401 },
      )
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password)
    if (!isMatch) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid credentials",
        },
        { status: 401 },
      )
    }

    // Generate JWT token
    const authToken = generateToken(user._id)

    return NextResponse.json({
      success: true,
      userId: user._id,
      userName: user.name,
      authToken,
      location: user.location,
    })
  } catch (error) {
    console.error("Error logging in user:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Server error",
      },
      { status: 500 },
    )
  }
}

// Helper function to generate JWT token
function generateToken(id: string) {
  // In a real implementation, you would use a JWT library
  // For now, we'll just return a simple token
  return `token_${id}_${Date.now()}`
}
