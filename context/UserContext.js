"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { getMe, logout as sdkLogout } from "@/lib/an-sdk/auth"

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await getMe()
      setUser(currentUser || null)
      return currentUser || null
    } catch (err) {
      console.error(err)
      setUser(null)
      return null
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const currentUser = await getMe()
        if (!cancelled) setUser(currentUser || null)
      } catch (err) {
        console.error(err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const logout = useCallback(() => {
    sdkLogout()
    setUser(null)
  }, [])

  return (
    <UserContext.Provider value={{ user, setUser, loading, refreshUser, logout }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return (
    useContext(UserContext) || {
      user: null,
      setUser: () => {},
      loading: false,
      refreshUser: async () => null,
      logout: () => {},
    }
  )
}
