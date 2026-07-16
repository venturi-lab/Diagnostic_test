import { useState } from 'react'

const PHONE_PATTERN = /^\+[1-9]\d{6,14}$/

const initialForm = {
  name: '',
  email: '',
  phone: '',
  targetCountry: '',
  targetCourse: '',
}

function Field({ id, label, error, ...inputProps }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={id}
        name={id}
        className="rounded-lg border border-gray-300 px-3 py-2 text-base text-gray-900 focus:border-gray-900 focus:outline-none"
        {...inputProps}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}

function LeadForm({ onSubmit, loading, error }) {
  const [form, setForm] = useState(initialForm)
  const [phoneError, setPhoneError] = useState('')

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const phone = form.phone.trim()
    if (!PHONE_PATTERN.test(phone)) {
      setPhoneError('Enter your phone number in international format, e.g. +919876543210')
      return
    }
    setPhoneError('')
    onSubmit({ ...form, phone })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Field
        id="name"
        label="Full name"
        type="text"
        required
        value={form.name}
        onChange={handleChange('name')}
      />

      <Field
        id="email"
        label="Email"
        type="email"
        required
        value={form.email}
        onChange={handleChange('email')}
      />

      <Field
        id="phone"
        label="Phone number"
        type="tel"
        inputMode="tel"
        required
        placeholder="+919876543210"
        value={form.phone}
        onChange={handleChange('phone')}
        error={phoneError}
      />

      <Field
        id="targetCountry"
        label="Target country"
        type="text"
        required
        value={form.targetCountry}
        onChange={handleChange('targetCountry')}
      />

      <Field
        id="targetCourse"
        label="Target course"
        type="text"
        required
        value={form.targetCourse}
        onChange={handleChange('targetCourse')}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 rounded-lg bg-gray-900 px-4 py-3 text-base font-medium text-white disabled:opacity-50"
      >
        {loading ? 'Sending code…' : 'Continue'}
      </button>
    </form>
  )
}

export default LeadForm
