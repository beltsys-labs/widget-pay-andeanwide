/*#if _EVM

import Token from '@depay/web3-tokens-evm'

/*#elif _SVM

import Token from '@depay/web3-tokens-svm'

//#else */

import Token from '@depay/web3-tokens'

//#endif

import Blockchains from '@depay/web3-blockchains'
import ChangableAmountContext from '../contexts/ChangableAmountContext'
import ConfigurationContext from '../contexts/ConfigurationContext'
import ConversionRateContext from '../contexts/ConversionRateContext'
import debounce from '../helpers/debounce'
import ErrorContext from '../contexts/ErrorContext'
import React, { useCallback, useState, useEffect, useContext } from 'react'
import round from '../helpers/round'
import tokenAmountForUSD from '../helpers/tokenAmountForUSD'
import WalletContext from '../contexts/WalletContext'
import { Decimal } from 'decimal.js'

export default (props) => {
  const configurationsMissAmounts = (configurations) => {
    return !configurations.every((configuration) => {
      return (
        typeof configuration.amount != 'undefined' || typeof configuration.fromAmount != 'undefined'
      )
    })
  }
  const { amount: configuredAmount, toAmount, accept, currencyCode, configCurrency, currency: userCurrency, feePlatform = 0 } = useContext(ConfigurationContext)
  const configuration = useContext(ConfigurationContext)
  const [amountsMissing, setAmountsMissing] = useState(configurationsMissAmounts(accept))
  let { account } = useContext(WalletContext)
  const { conversionRate, fixedCurrencyConversionRate, configCurrencyConversionRate } = useContext(ConversionRateContext)
  const { setError } = useContext(ErrorContext)
  const [acceptWithAmount, setAcceptWithAmount] = useState()
  const [fixedAmount] = useState((typeof configuredAmount == 'object' && configuredAmount.fix && configuredAmount.currency) ? configuredAmount.fix : null)
  const [fixedCurrency] = useState((typeof configuredAmount == 'object' && configuredAmount.fix && configuredAmount.currency) ? configuredAmount.currency : null)
  
  // Función para convertir un amount de la moneda de configuración a la moneda del usuario
  const convertAmountFromConfigToUser = useCallback((amountInConfigCurrency) => {
    // Si no hay configCurrency o es la misma que userCurrency, no hay conversión
    if (!configCurrency || !userCurrency || configCurrency.toLowerCase() === userCurrency.toLowerCase()) {
      return amountInConfigCurrency
    }
    
    // Si configCurrency es USD, usar 1.0 directamente
    const effectiveConfigRate = configCurrency.toLowerCase() === 'usd' ? 1.0 : configCurrencyConversionRate
    
    // Si no tenemos las tasas de conversión, retornar el amount original
    if (!effectiveConfigRate || !conversionRate) {
      return amountInConfigCurrency
    }
    
    // Convertir: amountInConfigCurrency (en configCurrency) -> USD -> userCurrency
    // 1. Convertir de configCurrency a USD: amountInConfigCurrency / effectiveConfigRate
    //    Si configCurrency es USD, effectiveConfigRate = 1.0, entonces usdAmount = amountInConfigCurrency
    const usdAmount = amountInConfigCurrency / effectiveConfigRate
    // 2. Convertir de USD a userCurrency: usdAmount * conversionRate
    //    conversionRate es la tasa de ExchangeRate-API: 1 USD = conversionRate userCurrency
    const convertedAmount = usdAmount * conversionRate
    
    return convertedAmount
  }, [configCurrency, userCurrency, configCurrencyConversionRate, conversionRate])
  
  // Función para calcular rawStartAmount desde configuredAmount
  const calculateRawStartAmount = () => {
    if (amountsMissing) {
      if ((typeof configuredAmount == "object" && configuredAmount.start != null && configuredAmount.start !== undefined)) {
        const startValue = configuredAmount.start
        return startValue
      } else if (typeof configuredAmount == "object" && configuredAmount.fix != null && configuredAmount.fix !== undefined) {
        const fixValue = configuredAmount.fix
        return fixValue
      } else {
        return 1
      }
    } else {
      return undefined
    }
  }
  
  // Guardar el amount en la moneda de configuración (o USD si no hay configCurrency)
  // Esto nos permite convertir siempre desde una base conocida cuando cambia la moneda del usuario
  const [amountInBaseCurrency, setAmountInBaseCurrency] = useState(1)
  
  // Inicializar el amount con el valor raw (se convertirá cuando las tasas estén disponibles)
  const [amount, setAmount] = useState(1)
  
  // Actualizar amountInBaseCurrency cuando configuredAmount esté disponible
  // PERO solo si el usuario no ha modificado el amount manualmente
  useEffect(() => {
    // Si el cambio viene del usuario, no sobrescribir
    if (userChangeRef.current) {
      return
    }
    
    const rawStartAmount = calculateRawStartAmount()
    
    if (rawStartAmount !== undefined && rawStartAmount !== null && rawStartAmount !== 0) {
      if (amountInBaseCurrency !== rawStartAmount) {
        setAmountInBaseCurrency(rawStartAmount)
        // Actualizar amount inicial cuando rawStartAmount es diferente de amountInBaseCurrency
        // Esto asegura que el amount se actualice correctamente cuando se pasa un fix diferente de 1
        if (amount !== rawStartAmount) {
          setAmount(rawStartAmount)
        }
      }
    }
  }, [amountsMissing, configuredAmount, amountInBaseCurrency, amount])

  useEffect(() => {
    setAmountsMissing(configurationsMissAmounts(accept))
  }, [accept])

  // Ref para mantener el accept más reciente
  const acceptRef = React.useRef(accept)
  useEffect(() => {
    acceptRef.current = accept
  }, [accept])

  const getAmounts = ({ amount, conversionRate, fixedCurrencyConversionRate }) => {
    // Obtener feePlatform de la configuración (valor por defecto 0)
    const platformFee = feePlatform ? parseFloat(feePlatform) : 0
    const currentAccept = acceptRef.current
    
    if (configuredAmount && configuredAmount.token) {
      // Si hay feePlatform, aplicarlo al amount para el swap
      // El amount mostrado permanece igual, pero el amount para el swap es mayor
      const amountForSwap = platformFee > 0 
        ? amount / (1 - (platformFee / 100))
        : amount
      return Promise.resolve(currentAccept.map(() => amountForSwap))
    } else {
      // Aplicar feePlatform al usdAmount antes de convertir a tokens
      const usdAmount = amount / conversionRate
      const usdAmountForSwap = platformFee > 0
        ? usdAmount / (1 - (platformFee / 100))
        : usdAmount
      return Promise.all(currentAccept.map((accept) => {
        return tokenAmountForUSD({
          blockchain: accept.blockchain,
          token: accept.token,
          amount: usdAmountForSwap,
        })
      }))
    }
  }

  // Función interna para actualizar amounts (sin debounce)
  const updateAmountsInternal = useCallback(({ account, amount, conversionRate, fixedCurrencyConversionRate }) => {
    const currentAccept = acceptRef.current
    // Si no hay accept válido, no hacer nada
    if (!currentAccept || !Array.isArray(currentAccept) || currentAccept.length === 0) {
      return
    }
    
    getAmounts({ amount, conversionRate, fixedCurrencyConversionRate }).then((amounts) => {
      // Verificar que todos los amounts estén disponibles
      const allAmountsAvailable = amounts.every(amt => amt !== undefined && amt !== null)
      
      if (!allAmountsAvailable) {
        return
      }
      
      const newAcceptWithAmount = currentAccept.map((configuration, index) => {
        return (
          { ...configuration, amount: parseFloat(round(amounts[index])) }
        )
      })
      setAcceptWithAmount(newAcceptWithAmount)
      
      // NO desactivar skeleton aquí - esperar a que el payment se actualice
    }).catch((error) => {
      setError(error)
      // Desactivar skeleton incluso si hay error
      if (isUpdatingAmount) {
        setIsUpdatingAmount(false)
      }
    })
  }, [isUpdatingAmount])

  // Versión debounced para actualizaciones automáticas
  const updateAmounts = useCallback(debounce(updateAmountsInternal, 500), [updateAmountsInternal])

  // Ref para rastrear si el cambio viene del usuario (para evitar que el useEffect sobrescriba)
  const userChangeRef = React.useRef(false)
  
  // Estado para indicar que se está actualizando el amount (para mostrar skeleton)
  const [isUpdatingAmount, setIsUpdatingAmount] = React.useState(false)
  
  // Wrapper para setAmount que también actualiza amountInBaseCurrency cuando el usuario modifica el amount
  // IMPORTANTE: Solo usar esto cuando el usuario modifica el amount manualmente, NO cuando se convierte automáticamente
  const setAmountWithBaseUpdate = useCallback((newAmount) => {
    if (amountsMissing) {
      // Marcar que este es un cambio del usuario
      userChangeRef.current = true
      setIsUpdatingAmount(true) // Activar skeleton
      
      // Si hay configCurrency y es diferente de userCurrency, convertir de vuelta a configCurrency
      if (configCurrency && userCurrency && configCurrency.toLowerCase() !== userCurrency.toLowerCase()) {
        if (configCurrencyConversionRate && conversionRate) {
          // Convertir de userCurrency a configCurrency: newAmount (en userCurrency) -> USD -> configCurrency
          const usdAmount = newAmount / conversionRate
          const amountInConfigCurrency = usdAmount * configCurrencyConversionRate
          setAmountInBaseCurrency(amountInConfigCurrency)
        }
      } else {
        // Si no hay conversión, el amount es directo
        setAmountInBaseCurrency(newAmount)
      }
      setAmount(newAmount)
      
      // Actualizar acceptWithAmount inmediatamente cuando el usuario cambia el amount
      // Esto asegura que las rutas se recalculen con el nuevo amount
      if (account && conversionRate) {
        // Llamar a updateAmountsInternal directamente (sin debounce) para actualizar inmediatamente
        updateAmountsInternal({ account, amount: newAmount, conversionRate, fixedCurrencyConversionRate })
      }
      
      // Resetear la bandera después de un delay para permitir actualizaciones automáticas futuras
      setTimeout(() => {
        userChangeRef.current = false
      }, 700) // 700ms para dar tiempo a que updateAmounts (debounced 500ms) se complete
    }
  }, [amountsMissing, configCurrency, userCurrency, configCurrencyConversionRate, conversionRate])

  // Calcular el amount convertido directamente (no usar estado para evitar problemas de timing)
  const convertedAmount = React.useMemo(() => {
    if (amountsMissing && amountInBaseCurrency !== undefined && amountInBaseCurrency !== null) {
      // Si tenemos configCurrency y es diferente de userCurrency, convertir
      if (configCurrency && userCurrency && configCurrency.toLowerCase() !== userCurrency.toLowerCase()) {
        if (configCurrencyConversionRate && conversionRate) {
          const result = convertAmountFromConfigToUser(amountInBaseCurrency)
          return result
        } else {
          return amountInBaseCurrency
        }
      }
      // Si no hay conversión, usar el amount base directamente
      return amountInBaseCurrency
    }
    return amount
  }, [amountsMissing, amountInBaseCurrency, configCurrency, userCurrency, configCurrencyConversionRate, conversionRate, convertAmountFromConfigToUser, amount])

  // Actualizar el amount cuando cambien las tasas de conversión o la moneda del usuario
  // Usar el convertedAmount calculado arriba
  // NO actualizar si el cambio viene del usuario (para evitar sobrescribir cambios manuales)
  useEffect(() => {
    // Si el cambio viene del usuario, no sobrescribir
    if (userChangeRef.current) {
      return
    }
    
    if (amountsMissing && convertedAmount !== undefined && convertedAmount !== null) {
      // Solo actualizar si el amount es diferente (para evitar loops infinitos)
      if (Math.abs(amount - convertedAmount) > 0.0001) {
        setAmount(convertedAmount)
      }
    }
  }, [convertedAmount, amountsMissing, amount, userCurrency, setAmount])

  useEffect(() => {
    // CRÍTICO: Usar convertedAmount directamente, no amount
    // convertedAmount siempre tiene el valor correcto convertido a la moneda actual del usuario
    if (!amountsMissing || !account || !conversionRate) {
      return
    }
    
    if (fixedAmount && !fixedCurrencyConversionRate) {
      return
    }
    
    // Si convertedAmount no está disponible aún, esperar
    if (convertedAmount === undefined || convertedAmount === null) {
      return
    }
    
    // Si el cambio viene del usuario, NO actualizar aquí porque ya se actualizó inmediatamente
    // Esto evita que el debounce sobrescriba el cambio del usuario
    if (userChangeRef.current) {
      return
    }
    
    // NO llamar a setAcceptWithAmount() sin argumentos - esto lo pone a undefined
    updateAmounts({ account, amount: convertedAmount, conversionRate, fixedCurrencyConversionRate })
  }, [amountsMissing, account, conversionRate, fixedAmount, fixedCurrencyConversionRate, convertedAmount, userCurrency, updateAmounts])

  return (
    <ChangableAmountContext.Provider value={{
      amountsMissing,
      fixedAmount,
      fixedCurrency,
      acceptWithAmount,
      amount,
      setAmount: setAmountWithBaseUpdate,
      isUpdatingAmount,
      setIsUpdatingAmount,
    }}>
      {props.children}
    </ChangableAmountContext.Provider>
  )
}
