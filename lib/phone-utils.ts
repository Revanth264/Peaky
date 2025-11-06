/**
 * Format phone number to E.164 format
 * E.164 format: +[country code][number]
 * Example: +919876543210
 */
export function formatToE164(phoneNumber: string, defaultCountryCode: string = '+91'): string {
  // Remove all non-digit characters except +
  let cleaned = phoneNumber.replace(/[^\d+]/g, '')
  
  // If already starts with +, return as is (should be valid E.164)
  if (cleaned.startsWith('+')) {
    return cleaned
  }
  
  // Remove leading zeros
  cleaned = cleaned.replace(/^0+/, '')
  
  // If empty, return empty
  if (!cleaned) {
    return ''
  }
  
  // Add country code if not present
  if (!cleaned.startsWith('+')) {
    // Remove + from defaultCountryCode if present
    const countryCode = defaultCountryCode.replace(/^\+/, '')
    cleaned = `+${countryCode}${cleaned}`
  }
  
  return cleaned
}

/**
 * Validate E.164 phone number format
 */
export function isValidE164(phoneNumber: string): boolean {
  // E.164: + followed by 1-15 digits
  const e164Regex = /^\+[1-9]\d{1,14}$/
  return e164Regex.test(phoneNumber)
}

/**
 * Format phone number for display
 */
export function formatForDisplay(phoneNumber: string): string {
  if (!phoneNumber) return ''
  
  // If E.164 format, format nicely
  if (phoneNumber.startsWith('+')) {
    const countryCode = phoneNumber.substring(1, 3) // Assuming 2-digit country code
    const number = phoneNumber.substring(3)
    
    // Format Indian numbers nicely
    if (countryCode === '91' && number.length === 10) {
      return `+91 ${number.substring(0, 5)} ${number.substring(5)}`
    }
    
    return phoneNumber
  }
  
  return phoneNumber
}

