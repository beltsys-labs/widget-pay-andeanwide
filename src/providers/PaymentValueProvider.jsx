/*#if _EVM

import Token from '@depay/web3-tokens-evm'

/*#elif _SVM

import Token from '@depay/web3-tokens-svm'

//#else */

import Token from '@depay/web3-tokens'

//#endif

import ChangableAmountContext from '../contexts/ChangableAmountContext'
import ConfigurationContext from '../contexts/ConfigurationContext'
import PaymentContext from '../contexts/PaymentContext'
import PaymentValueContext from '../contexts/PaymentValueContext'
import React, { useState, useEffect, useContext } from 'react'
import UpdatableContext from '../contexts/UpdatableContext'
import usdAmountForToken from '../helpers/usdAmountForToken'
import { Currency } from '@depay/local-currency'

// API local para tasas de cambio
const EXCHANGERATE_API_BASE = `http://localhost:3000/exchange-fiat-rates`

// Función para convertir USD a moneda usando API local
const convertUSDToCurrency = async (usdAmount, currencyCode) => {
  try {
    const response = await fetch(`${EXCHANGERATE_API_BASE}/pair/usd/${currencyCode.toLowerCase()}`)
    if (response.status === 200) {
      const data = await response.json()
      // Asumimos que la API local devuelve un formato similar: { conversion_rate: X } o { rate: X }
      const conversionRate = data.conversion_rate || data.rate || data.rateValue
      if (conversionRate) {
        // API local devuelve: 1 USD = X currency
        // Necesitamos convertir usdAmount a la moneda: usdAmount * conversion_rate
        const convertedAmount = usdAmount * conversionRate
        return new Currency({ amount: convertedAmount, code: currencyCode.toUpperCase() })
      }
    }
  } catch (error) {
    // Error converting USD to currency
  }
  return null
}

export default (props)=>{

  const { updatable } = useContext(UpdatableContext)
  const { amount: configuredAmount, currencyCode } = useContext(ConfigurationContext)
  const { amount } = useContext(ChangableAmountContext)
  const { payment } = useContext(PaymentContext)
  const [ paymentValue, setPaymentValue ] = useState()
  const [ displayedPaymentValue, setDisplayedPaymentValue ] = useState()
  const { currency } = useContext(ConfigurationContext)
  
  const updatePaymentValue = ({ updatable, payment })=>{
    if(updatable == false || payment?.route == undefined) { return }
    setPaymentValue(null)
    usdAmountForToken({
      blockchain: payment.route.blockchain,
      token: payment.route.fromToken.address,
      amount: payment.route.fromAmount,
      decimals: payment.route.fromDecimals,
    }).then(async (usdAmount)=>{
      if(usdAmount != undefined && usdAmount != null) {
        // Usar ExchangeRate-API para convertir USD a la moneda seleccionada
        const converted = await convertUSDToCurrency(usdAmount, currency)
        if (converted) {
          setPaymentValue(converted)
        } else {
          // Fallback a Currency.fromUSD si ExchangeRate-API falla
          Currency.fromUSD({ amount: usdAmount, code: currency })
            .then(setPaymentValue)
        }
      }
    })
  }

  useEffect(()=>{
    if(paymentValue && amount && configuredAmount && configuredAmount.fix) {
      setDisplayedPaymentValue(paymentValue.toString())
    } else if(amount && (configuredAmount == undefined || configuredAmount?.token != true)) {
      setDisplayedPaymentValue(new Currency({ amount: amount.toFixed(2), code: currencyCode }).toString())
    } else if(paymentValue && paymentValue.toString().length && configuredAmount?.token != true) {
      setDisplayedPaymentValue(paymentValue.toString())
    } else if(payment) {
      setDisplayedPaymentValue(`${payment.symbol} ${payment.amount}`)
    }
  }, [paymentValue, payment, amount, configuredAmount])
  
  useEffect(()=>{
    if(payment) { updatePaymentValue({ updatable, payment }) }
  }, [updatable, payment])

  return(
    <PaymentValueContext.Provider value={{
      paymentValue,
      displayedPaymentValue,
    }}>
      { props.children }
    </PaymentValueContext.Provider>
  )
}
