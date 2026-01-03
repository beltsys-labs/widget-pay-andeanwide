import ConfigurationContext from '../contexts/ConfigurationContext'
import ConversionRateContext from '../contexts/ConversionRateContext'
import ErrorContext from '../contexts/ErrorContext'
import React, { useState, useEffect, useContext } from 'react'
import { Currency } from '@depay/local-currency'

// API local para tasas de cambio
const EXCHANGERATE_API_BASE = `http://localhost:3000/exchange-fiat-rates`

export default (props) => {
  const { setError } = useContext(ErrorContext)
  const { amount, currency, configCurrency } = useContext(ConfigurationContext)
  const [conversionRate, setConversionRate] = useState()
  const [fixedCurrencyConversionRate, setFixedCurrencyConversionRate] = useState()
  const [configCurrencyConversionRate, setConfigCurrencyConversionRate] = useState()

  useEffect(() => {
    // Función para obtener tasa de conversión desde API local
    const getConversionFromExchangeRateAPI = async (currencyCode) => {
      try {
        const response = await fetch(`${EXCHANGERATE_API_BASE}/pair/usd/${currencyCode.toLowerCase()}`)
        if (response.status === 200) {
          const data = await response.json()
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

    // Función para obtener tasa de conversión usando ExchangeRate-API
    const getConversionRate = async (currencyCode, isFixedCurrency = false) => {
      const conversion = await getConversionFromExchangeRateAPI(currencyCode)
      
      if (conversion && conversion.amount) {
        return conversion.amount
      } else {
        return null
      }
    }

    // Obtener tasa de conversión para moneda fija (si existe)
    if (typeof amount == 'object' && amount.currency) {
      getConversionRate(amount.currency, true).then((rate) => {
        if (rate) {
          setFixedCurrencyConversionRate(rate)
        }
      }).catch((error) => {
        // Error fetching fixed currency conversion rate
      })
    }
    
    // Obtener tasa de conversión para moneda de configuración (si existe y es diferente de la moneda del usuario)
    if (configCurrency && configCurrency.toLowerCase() !== currency?.toLowerCase()) {
      // Si configCurrency es USD, la tasa es 1.0 directamente
      if (configCurrency.toLowerCase() === 'usd') {
        setConfigCurrencyConversionRate(1.0)
      } else {
        getConversionRate(configCurrency, false).then((rate) => {
          if (rate) {
            setConfigCurrencyConversionRate(rate)
          }
        }).catch((error) => {
          // Error fetching config currency conversion rate
        })
      }
    } else {
      // Si no hay configCurrency o es la misma que currency, usar la misma tasa
      setConfigCurrencyConversionRate(null)
    }
    
    // Obtener tasa de conversión para moneda base (moneda del usuario)
    getConversionRate(currency, false).then((rate) => {
      if (rate) {
        setConversionRate(rate)
      }
    }).catch((error) => {
      // Error fetching conversion rate
    })
  }, [amount, currency, configCurrency])

  return (
    <ConversionRateContext.Provider value={{
      conversionRate,
      fixedCurrencyConversionRate,
      configCurrencyConversionRate
    }}>
      {props.children}
    </ConversionRateContext.Provider>
  )
}
