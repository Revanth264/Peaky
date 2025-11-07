'use client'

import { useEffect, useRef } from 'react'
import intlTelInput from 'intl-tel-input'

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  onValidE164?: (e164: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  id?: string
}

export default function PhoneInput({ 
  value, 
  onChange, 
  onValidE164,
  placeholder = "e.g. +91 6300 000 000",
  disabled = false,
  className = "",
  id
}: PhoneInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const itiRef = useRef<any>(null)
  const onChangeRef = useRef(onChange)
  const onValidE164Ref = useRef(onValidE164)

  const pushE164 = () => {
    const iti = itiRef.current
    const inputEl = inputRef.current
    if (!iti || !inputEl || !onValidE164Ref.current) return

    const rawValue = inputEl.value.trim()
    if (!rawValue) {
      onValidE164Ref.current('')
      return
    }

    let candidate: string | null = null

    try {
      const utils = (typeof window !== 'undefined' && (window as any).intlTelInputUtils) || null
      const formatted = utils
        ? iti.getNumber(utils.numberFormat.E164)
        : iti.getNumber()

      if (formatted) {
        const cleaned = formatted.replace(/\s+/g, '')
        if (/^\+[1-9]\d{6,14}$/.test(cleaned)) {
          candidate = cleaned
        }
      }
    } catch (err) {
      console.warn('intl-tel-input formatting failed, using fallback', err)
    }

    if (!candidate) {
      const stripped = rawValue.replace(/\s+/g, '')
      if (stripped.startsWith('+')) {
        candidate = stripped
      } else if (stripped.startsWith('00')) {
        candidate = `+${stripped.slice(2)}`
      } else {
        const countryData = iti.getSelectedCountryData()
        const dialCode = (countryData?.dialCode || '').replace(/[^\d]/g, '')
        const digitsOnly = rawValue.replace(/[^\d]/g, '')

        if (dialCode && digitsOnly) {
          const nationalDigits = digitsOnly.replace(/^0+/, '')
          candidate = `+${dialCode}${nationalDigits}`
        }
      }
    }

    if (candidate && /^\+[1-9]\d{6,14}$/.test(candidate)) {
      onValidE164Ref.current(candidate)
    } else {
      onValidE164Ref.current('')
    }
  }

  // Update refs when callbacks change
  useEffect(() => {
    onChangeRef.current = onChange
    onValidE164Ref.current = onValidE164
  }, [onChange, onValidE164])

  useEffect(() => {
    if (!inputRef.current || disabled) return

    itiRef.current = intlTelInput(inputRef.current, {
      preferredCountries: ["in", "us", "gb", "ca", "au", "de", "fr", "jp"],
      initialCountry: "auto",
      geoIpLookup: async (cb) => {
        try {
          const res = await fetch("https://ipapi.co/json/")
          const data = await res.json()
          cb((data && data.country_code && data.country_code.toLowerCase()) || "in")
        } catch {
          cb("in")
        }
      },
      utilsScript: typeof window !== "undefined"
        ? "/intl-utils.js"
        : undefined,
      nationalMode: false,
      autoPlaceholder: "polite",
      separateDialCode: true,
      customPlaceholder: () => placeholder,
    } as any)
    
    // Store instance on input element for easy access
    if (inputRef.current) {
      (inputRef.current as any).intlTelInput = itiRef.current
    }

    pushE164()

    const handleChange = () => {
      const iti = itiRef.current
      if (!iti || !inputRef.current) return

      const phoneNumber = inputRef.current.value
      onChangeRef.current(phoneNumber)
      pushE164()
    }

    const handleCountryChange = () => {
      const iti = itiRef.current
      if (!iti || !inputRef.current) return
      const phoneNumber = inputRef.current.value
      onChangeRef.current(phoneNumber)
      
      pushE164()
    }

    inputRef.current.addEventListener("countrychange", handleCountryChange)
    inputRef.current.addEventListener("blur", handleChange)
    inputRef.current.addEventListener("input", handleChange)

    return () => {
      if (inputRef.current) {
        inputRef.current.removeEventListener("countrychange", handleCountryChange)
        inputRef.current.removeEventListener("blur", handleChange)
        inputRef.current.removeEventListener("input", handleChange)
      }
      itiRef.current?.destroy()
      itiRef.current = null
    }
  }, [disabled, placeholder])

  // Update input value when prop changes
  useEffect(() => {
    if (inputRef.current && itiRef.current && value !== inputRef.current.value) {
      itiRef.current.setNumber(value)
      pushE164()
    }
  }, [value])

  return (
    <input
      ref={inputRef}
      id={id}
      type="tel"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={className}
      placeholder={placeholder}
    />
  )
}

