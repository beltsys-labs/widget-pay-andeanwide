import { Currency } from '@depay/local-currency'

// API local para tasas de cambio
const EXCHANGERATE_API_BASE = `http://localhost:3000/exchange-fiat-rates`

// Función para obtener tasa de conversión desde API local (fallback)
const getConversionFromExchangeRateAPI = async (currencyCode) => {
  try {
    const response = await fetch(`${EXCHANGERATE_API_BASE}/pair/usd/${currencyCode.toLowerCase()}`)
    if (response.status === 200) {
      const data = await response.json()
      // Asumimos que la API local devuelve un formato similar: { conversion_rate: X } o { rate: X }
      const conversionRate = data.conversion_rate || data.rate || data.rateValue
      if (conversionRate) {
        // API local devuelve: 1 USD = X currency
        // Necesitamos el mismo formato que Currency.fromUSD: {amount: X, code: currency}
        return {
          amount: conversionRate,
          code: currencyCode.toUpperCase(),
          timeZone: 'UTC'
        }
      }
    }
  } catch (error) {
    // Error fetching conversion
  }
  return null
}

// Función para validar si la tasa de conversión es sospechosa (posible fallback)
const isValidConversionRate = (conversion, requestedCurrencyCode) => {
  if (!conversion) {
    return false
  }
  
  const conversionAmount = conversion.amount
  const conversionCode = conversion.code
  const requestedCode = requestedCurrencyCode?.toUpperCase()
  
  // Verificar que el código de la conversión coincida con el solicitado
  if (conversionCode && requestedCode) {
    const conversionCodeUpper = conversionCode.toUpperCase()
    const requestedCodeUpper = requestedCode.toUpperCase()
    if (conversionCodeUpper !== requestedCodeUpper) {
      return false
    }
  }
  
  // Si el amount es exactamente 1, es muy sospechoso para la mayoría de monedas
  // Algunas monedas como USD podrían tener 1, pero otras como VES deberían ser mucho más altas
  if (conversionAmount === 1) {
    // Monedas que legítimamente podrían tener tasa cercana a 1
    const currenciesNearOne = ['USD', 'USDT', 'USDC']
    if (!currenciesNearOne.includes(requestedCode)) {
      return false
    }
  }
  
  return true
}

/**
 * Obtiene la tasa de conversión de USD a una moneda específica
 * Primero intenta con la API de DePay, si falla o es inválida, usa ExchangeRate-API como fallback
 * @param {string} currencyCode - Código de la moneda (ej: 'VES', 'EUR')
 * @param {number} usdAmount - Cantidad en USD a convertir (por defecto 1)
 * @returns {Promise<Object>} - Objeto con formato {amount: X, code: 'CURRENCY', timeZone: '...'}
 */
export default async (currencyCode, usdAmount = 1) => {
  // Primero intentar con la API de DePay
  try {
    const conversion = await Currency.fromUSD({ amount: usdAmount, code: currencyCode })
    
    // Validar la conversión
    if (isValidConversionRate(conversion, currencyCode) && conversion?.amount) {
      return conversion
    }
  } catch (error) {
    // DePay API failed, trying ExchangeRate-API fallback
  }
  
  // Fallback a ExchangeRate-API
  const fallbackConversion = await getConversionFromExchangeRateAPI(currencyCode)
  
  if (fallbackConversion) {
    // Ajustar el amount según el usdAmount solicitado
    return {
      ...fallbackConversion,
      amount: fallbackConversion.amount * usdAmount
    }
  } else {
    throw new Error(`Failed to get conversion rate for ${currencyCode}`)
  }
}

