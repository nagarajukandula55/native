"use client"

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import { getMe, logout as sdkLogout } from "@/lib/an-sdk/auth"

const UserContext = createContext(null)

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const generation = useRef(0)

  const refreshUser = useCallback(async () => {
    const requestGeneration = ++generation.current
    try {
      const currentUser = await getMe()
      if (requestGeneration !== generation.current) return null
      setUser(currentUser || null)
      return currentUser || null
    } catch (err) {
      console.error(err)
      if (requestGeneration === generation.current) setUser(null)
      return null
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    const requestGeneration = ++generation.current

    ;(async () => {
      try {
        const currentUser = await getMe()
        if (!cancelled && requestGeneration === generation.current) setUser(currentUser || null)
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
    generation.current += 1
    sdkLogout()
    setUser(null)
  }, [])

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === "an_token") { setUser(null); refreshUser(); }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [refreshUser])

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
