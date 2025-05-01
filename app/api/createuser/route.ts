import { NextResponse } from "next/server"
import dbConnect from "@/lib/db"
import User from "@/models/User"

export async function POST(request: Request) {
  try {
    await dbConnect()

    const body = await request.json()
    const { name, email, password, location } = body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "User already exists",
        },
        { status: 400 },
      )
    }

    // Create new user
    const user = await User.create({
      name,
      email,
      password,
      location,
    })

    // Generate JWT token (you'll need to implement this)
    const authToken = generateToken(user._id)

    return NextResponse.json({
      success: true,
      userId: user._id,
      userName: user.name,
      authToken,
      location: user.location,
    })
  } catch (error) {
    console.error("Error creating user:", error)
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
