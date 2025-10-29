import { createContext, useState, useContext, useEffect } from "react"
import { API_BASE_URL } from "../services/Api.js"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [requires2FA, setRequires2FA] = useState(false)
  const [pendingEmail, setPendingEmail] = useState("")

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    const userData = localStorage.getItem("userData")

    if (token && userData) {
      setUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Login failed")
      }

      if (data.requires2FA) {
        setRequires2FA(true)
        setPendingEmail(email)
        return { requires2FA: true, message: "2FA code sent to your email" }
      }

      const { token, user } = data
      localStorage.setItem("authToken", token)
      localStorage.setItem("userData", JSON.stringify(user))
      setUser(user)
      return { success: true, user }
    } catch (error) {
      throw new Error(error.message || "Login failed. Please try again.")
    }
  }

  const verify2FA = async (code) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-2fa`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email: pendingEmail, code }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "2FA verification failed")
      }

      const { token, user } = data
      localStorage.setItem("authToken", token)
      localStorage.setItem("userData", JSON.stringify(user))
      setUser(user)
      setRequires2FA(false)
      setPendingEmail("")
      return { success: true, user }
    } catch (error) {
      throw new Error(error.message || "Invalid verification code")
    }
  }

  const register = async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Registration failed")
      }

      return { success: true, message: data.message || "Registration successful" }
    } catch (error) {
      throw new Error(error.message || "Registration failed. Please try again.")
    }
  }

  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      })
      localStorage.removeItem("authToken")
      localStorage.removeItem("userData")
      setUser(null)
      setRequires2FA(false)
      setPendingEmail("")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const forgotPassword = async (email) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to send reset email")
      }

      return data
    } catch (error) {
      throw new Error(error.message || "Failed to send reset email")
    }
  }

  const value = {
    user,
    login,
    register,
    logout,
    verify2FA,
    requires2FA,
    pendingEmail,
    setRequires2FA,
    setPendingEmail,
    loading,
    forgotPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
