import jwt from "jsonwebtoken"

const JWT_SECRET = "your-jwt-secret" // In production, use an environment variable

export function generateToken(userId: string) {
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: "30d",
  })
}

export function verifyToken(token: string) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded.id
  } catch (error) {
    return null
  }
}
