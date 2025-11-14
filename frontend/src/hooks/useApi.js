import { useState, useCallback } from "react"

// Custom hook for API calls with loading and error states
export const useApi = (apiFunction) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const execute = useCallback(
    async (...args) => {
      try {
        setLoading(true)
        setError(null)
        const result = await apiFunction(...args)
        setData(result.data || result)
        return result
      } catch (err) {
        const errorMessage = err.message || "An error occurred"
        setError(errorMessage)
        console.error("[API Error]", errorMessage)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [apiFunction],
  )

  return { data, loading, error, execute }
}

export default useApi
