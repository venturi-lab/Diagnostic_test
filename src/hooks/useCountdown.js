import { useCallback, useEffect, useState } from 'react'

function useCountdown() {
  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    if (remaining <= 0) return undefined
    const timeout = setTimeout(() => setRemaining((seconds) => seconds - 1), 1000)
    return () => clearTimeout(timeout)
  }, [remaining])

  const start = useCallback((seconds) => setRemaining(seconds), [])

  return { remaining, start }
}

export default useCountdown
