import ChangableAmountContext from '../contexts/ChangableAmountContext'
import ConfigurationContext from '../contexts/ConfigurationContext'
import ConversionRateContext from '../contexts/ConversionRateContext'
import Dialog from '../components/Dialog'
import ErrorContext from '../contexts/ErrorContext'
import format from '../helpers/format'
import PaymentRoutingContext from '../contexts/PaymentRoutingContext'
import PaymentValueContext from '../contexts/PaymentValueContext'
import React, { useContext, useState, useEffect, useRef } from 'react'
import useEvent from '../hooks/useEvent'
import WalletContext from '../contexts/WalletContext'
import { Currency } from '@depay/local-currency'
import { Decimal } from 'decimal.js'
import { NavigateStackContext } from '@depay/react-dialog-stack'
import { useTranslation } from '../providers/TranslationProvider'

export default (props) => {
  const { navigate } = useContext(NavigateStackContext)
  const { setError } = useContext(ErrorContext)
  const { account } = useContext(WalletContext)
  const { amount, setAmount } = useContext(ChangableAmountContext)
  const { displayedPaymentValue } = useContext(PaymentValueContext)
  const { currencyCode, amount: amountConfiguration, configCurrency, currency: userCurrency } = useContext(ConfigurationContext)
  const { conversionRate, configCurrencyConversionRate } = useContext(ConversionRateContext)
  const { allRoutes, setSelectedRoute } = useContext(PaymentRoutingContext)
  
  // Función para convertir un amount de la moneda de configuración a la moneda del usuario
  const convertAmountFromConfigToUser = (amountInConfigCurrency) => {
    // Si no hay configCurrency o es la misma que userCurrency, no hay conversión
    if (!configCurrency || !userCurrency || configCurrency.toLowerCase() === userCurrency.toLowerCase()) {
      return amountInConfigCurrency
    }
    
    // Si no tenemos las tasas de conversión, retornar el amount original
    if (!configCurrencyConversionRate || !conversionRate) {
      return amountInConfigCurrency
    }
    
    // Convertir: amountInConfigCurrency (en configCurrency) -> USD -> userCurrency
    const usdAmount = amountInConfigCurrency / configCurrencyConversionRate
    const convertedAmount = usdAmount * conversionRate
    
    return convertedAmount
  }
  
  const rawMin = typeof amountConfiguration == "object" && amountConfiguration.min ? amountConfiguration.min : 1
  const min = Math.round(convertAmountFromConfigToUser(rawMin))
  const rawMax = typeof amountConfiguration == "object" && amountConfiguration.max ? amountConfiguration.max : undefined
  const max = rawMax ? Math.round(convertAmountFromConfigToUser(rawMax)) : undefined
  const step = typeof amountConfiguration == "object" && amountConfiguration.step ? amountConfiguration.step : 1
  const displayedCurrencyCode = (amountConfiguration != undefined && amountConfiguration.token) ? null : currencyCode
  const inputElement = useRef()
  const { t } = useTranslation()
  
  // Inicializar inputAmount redondeado a entero
  const [inputAmount, setInputAmount] = useState(() => {
    const initialValue = amount ? Math.round(parseFloat(amount)) : min
    return initialValue
  })
  
  // Actualizar inputAmount cuando amount cambie, siempre redondeado a entero
  useEffect(() => {
    if (amount !== undefined && amount !== null) {
      const roundedAmount = Math.round(parseFloat(amount))
      if (roundedAmount !== inputAmount) {
        setInputAmount(roundedAmount)
      }
    }
  }, [amount])

  const changeAmountAndGoBack = useEvent(() => {
    let newAmount = toValidValue(parseFloat(inputAmount))
    if (newAmount != amount) {
      setSelectedRoute(undefined)
      setAmount(newAmount)
    }
    navigate('back')
  })

  const changeAmount = (value) => {
    // Permitir escribir libremente, validar solo al perder el foco
    if (value === '' || value === null || value === undefined) {
      setInputAmount('')
      return
    }
    const numValue = parseFloat(value)
    if (isNaN(numValue)) { 
      return 
    }
    setInputAmount(value)
  }

  const toValidStep = (value) => {
    if (step) {
      value = parseFloat(
        new Decimal(
          Math.floor(
            new Decimal(value).div(step)
          )
        ).mul(step).toString()
      )
    }
    return value
  }

  const toValidValue = (value) => {
    // Primero: convertir a número y redondear a entero
    if (isNaN(value) || value === null || value === undefined) {
      return min
    }
    value = Math.round(parseFloat(value))
    
    // Segundo: aplicar mínimo
    value = Math.max(min, value)
    
    // Tercero: aplicar máximo si está definido
    if (max !== undefined && max !== null && !isNaN(max)) {
      value = Math.min(max, value)
    }
    
    // Cuarto: asegurar que no sea menor que min después de todas las validaciones
    value = Math.max(min, value)
    
    return value
  }

  const setValidValue = (value) => {
    const validValue = toValidValue(value)
    setInputAmount(validValue)
  }

  useEffect(() => {

    setTimeout(() => {
      if (inputElement.current) { inputElement.current.focus() }
    }, 200)

    const handleKeyDown = (event) => {
      if (event.key === 'Enter') {
        if (inputElement.current) { inputElement.current.blur() }
        setTimeout(changeAmountAndGoBack, 200)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  return (
    <Dialog
      stacked={true}
      header={
        <div className="PaddingTopS PaddingLeftM PaddingRightM PaddingBottomS">
          <h1 className="LineHeightL FontSizeL TextCenter">{t('amount.change')}</h1>
          <div className="FontSizeL TextCenter FontWeightBold"><strong>{displayedCurrencyCode}</strong></div>
        </div>
      }
      body={
        <div className="MaxHeight PaddingTopXS">
          <div className="PaddingLeftM PaddingRightM">
            <div className='PaddingTopS TextCenter PaddingBottomL'>

              <div className="PaddingBottomM">
                <input
                  ref={inputElement}
                  min={min}
                  max={max}
                  step={step}
                  className='Input FontSizeXXL TextAlignCenter'
                  type="number"
                  name="amount"
                  value={inputAmount ? parseFloat(inputAmount) : ''}
                  onChange={(event) => { changeAmount(event.target.value) }}
                  onBlur={(event) => { setValidValue(event.target.value) }}
                />
              </div>

            </div>
          </div>
        </div>
      }
      footer={
        <div className="PaddingTopXS PaddingRightM PaddingLeftM PaddingBottomM">
          <button className="ButtonPrimary" onClick={changeAmountAndGoBack}>
            {t('payment.done')}
          </button>
        </div>
      }
    />
  )
}
