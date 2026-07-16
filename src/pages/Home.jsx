import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import LeadForm from '../components/LeadForm'
import OtpForm from '../components/OtpForm'

function getAuthErrorMessage(error) {
  const message = error?.message || ''
  if (/expired/i.test(message)) {
    return 'That code has expired. Request a new one and try again.'
  }
  if (/invalid|token/i.test(message)) {
    return 'That code is incorrect. Please check and try again.'
  }
  if (/phone/i.test(message)) {
    return 'That phone number looks invalid. Please check and try again.'
  }
  return message || 'Something went wrong. Please try again.'
}

function Home() {
  const [step, setStep] = useState('form')
  const [leadData, setLeadData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const sendOtp = async (phone) => {
    const { error: otpError } = await supabase.auth.signInWithOtp({ phone })
    if (otpError) throw otpError
  }

  const handleFormSubmit = async (form) => {
    setLoading(true)
    setError('')
    try {
      await sendOtp(form.phone)
      setLeadData(form)
      setStep('otp')
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError('')
    try {
      await sendOtp(leadData.phone)
    } catch (err) {
      setError(getAuthErrorMessage(err))
    }
  }

  const handleOtpSubmit = async (token) => {
    setLoading(true)
    setError('')
    try {
      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        phone: leadData.phone,
        token,
        type: 'sms',
      })
      if (verifyError) throw verifyError

      // LEAD HANDOFF POINT — data synced to DB, qualifies user for counselor follow-up
      const { error: insertError } = await supabase.from('leads').insert({
        user_id: data.user.id,
        name: leadData.name,
        email: leadData.email,
        target_country: leadData.targetCountry,
        target_course: leadData.targetCourse,
      })
      if (insertError) throw insertError

      setStep('success')
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  if (step === 'success') {
    return (
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-xl font-semibold text-gray-900">
          You're verified, {leadData.name}!
        </h1>
        <p className="text-sm text-gray-600">
          Our mentors are reviewing your profile and will reach out shortly.
        </p>
      </div>
    )
  }

  if (step === 'otp') {
    return (
      <OtpForm
        phone={leadData.phone}
        onSubmit={handleOtpSubmit}
        onResend={handleResend}
        loading={loading}
        error={error}
      />
    )
  }

  return <LeadForm onSubmit={handleFormSubmit} loading={loading} error={error} />
}

export default Home
