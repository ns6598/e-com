import { useState, useEffect } from 'react'

/**
 * Custom hook to synchronize state with window.localStorage
 * Robust against missing, corrupted or malformed data
 * @param {string} key
 * @param {*} initialValue
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      if (typeof window === 'undefined') {
        return initialValue
      }
      const item = window.localStorage.getItem(key)
      if (!item) return initialValue

      const parsed = JSON.parse(item)

      // If initialValue is an array, ensure parsed is also an array
      if (Array.isArray(initialValue) && !Array.isArray(parsed)) {
        return initialValue
      }

      return parsed
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}", falling back to initialValue:`, error)
      return initialValue
    }
  })

  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(storedValue))
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  return [storedValue, setStoredValue]
}
