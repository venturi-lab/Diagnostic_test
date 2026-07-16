import { useEffect, useState } from 'react'
import useCountdown from '../hooks/useCountdown'

const RESEND_COOLDOWN_SECONDS = 60

function OtpForm({ phone, onSubmit, onResend, loading, error }) {
  const [code, setCode] = useState('')
  const { remaining, start } = useCountdown()

  useEffect(() => {
    start(RESEND_COOLDOWN_SECONDS)
  }, [start])

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit(code)
  }

  const handleResend = () => {
    onResend()
    setCode('')
    start(RESEND_COOLDOWN_SECONDS)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-sm text-gray-600">
        Enter the 6-digit code sent to{' '}
        <span className="font-medium text-gray-900">{phone}</span>
      </p>

      <input
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        required
        value={code}
        onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
        placeholder="------"
        className="rounded-lg border border-gray-300 px-3 py-3 text-center text-2xl tracking-[0.5em] text-gray-900 focus:border-gray-900 focus:outline-none"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading || code.length !== 6}
        className="rounded-lg bg-gray-900 px-4 py-3 text-base font-medium text-white disabled:opacity-50"
      >
        {loading ? 'Verifying…' : 'Verify'}
      </button>

      <button
        type="button"
        onClick={handleResend}
        disabled={remaining > 0 || loading}
        className="text-sm font-medium text-gray-700 underline disabled:text-gray-400 disabled:no-underline"
      >
        {remaining > 0 ? `Resend code in ${remaining}s` : 'Resend code'}
      </button>
    </form>
  )
}

export default OtpForm
