/*#if _EVM

import { setProviderEndpoints } from '@depay/web3-client-evm'

/*#elif _SVM

import { setProviderEndpoints } from '@depay/web3-client-svm'

//#else */

import { setProviderEndpoints } from '@depay/web3-client'

//#endif

import ClosableProvider from '../providers/ClosableProvider'
import ConfigurationContext from '../contexts/ConfigurationContext'
import ErrorContext from '../contexts/ErrorContext'
import LoadingStack from '../stacks/LoadingStack'
import NavigateProvider from '../providers/NavigateProvider'
import PoweredBy from '../components/PoweredBy'
import React, { useState, useEffect, useContext } from 'react'
import UpdatableProvider from '../providers/UpdatableProvider'
import { Currency } from '@depay/local-currency'
import { verify } from '@depay/js-verify-signature-web'
import detectUserCurrency from '../helpers/detectUserCurrency'
import SUPPORTED_CURRENCIES from '../helpers/supportedCurrencies'

const PUBLIC_KEY = "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtqsu0wy94cpz90W4pGsJ\nSf0bfvmsq3su+R1J4AoAYz0XoAu2MXJZM8vrQvG3op7OgB3zze8pj4joaoPU2piT\ndH7kcF4Mde6QG4qKEL3VE+J8CL3qK2dUY0Umu20x/O9O792tlv8+Q/qAVv8yPfdM\nn5Je9Wc7VI5XeIBKP2AzsCkrXuzQlR48Ac5LpViNSSLu0mz5NTBoHkW2sz1sNWc6\nUpYISJkiKTvYc8Bo4p5xD6+ZmlL4hj1Ad/+26SjYcisX2Ut4QD7YKRBP2SbItVkI\nqp9mp6c6MCKNmEUkosxAr0KVfOcrk6/fcc4tI8g+KYZ32G11Ri8Xo4fgHH06DLYP\n3QIDAQAB\n-----END PUBLIC KEY-----\n"

export default (props) => {
  const { setError } = useContext(ErrorContext)

  // Obtener la moneda de configuración (si existe) - SOLO desde amount.currency, NO desde currency
  // Esta es la moneda en la que vienen los amounts en la configuración
  const getConfigCurrency = () => {
    // Solo verificar si viene en amount.currency
    if (props.configuration.amount && typeof props.configuration.amount === 'object' && props.configuration.amount.currency) {
      const configCurrency = props.configuration.amount.currency.toLowerCase()
      if (SUPPORTED_CURRENCIES.includes(configCurrency)) {
        return configCurrency
      }
    }
    // NO usar props.configuration.currency - esa se ignora completamente
    return null
  }

  // SIEMPRE usar la moneda detectada del usuario como moneda por defecto del widget
  // IGNORAR completamente props.configuration.currency
  const getInitialCurrency = () => {
    const detected = detectUserCurrency()
    return detected
  }

  const configCurrency = getConfigCurrency()
  const initialCurrency = getInitialCurrency()
  const currencyCode = new Currency({ code: initialCurrency }).code

  // Inicializar configuración EXCLUYENDO currency de props.configuration para usar siempre la detectada
  const initialConfiguration = !props.configuration?.integration ? (() => {
    const { currency: _, ...configWithoutCurrency } = props.configuration
    return { ...configWithoutCurrency, currencyCode, currency: initialCurrency, configCurrency }
  })() : undefined

  const [configuration, setConfiguration] = useState(initialConfiguration)

  // Función para cambiar la moneda dinámicamente
  const setCurrency = (newCurrency) => {
    const currencyLower = newCurrency.toLowerCase()
    if (SUPPORTED_CURRENCIES.includes(currencyLower)) {
      const newCurrencyCode = new Currency({ code: currencyLower }).code
      setConfiguration(prev => ({
        ...prev,
        currency: currencyLower,
        currencyCode: newCurrencyCode
      }))
    }
  }

  const loadConfiguration = (id, attempt) => {
    if (attempt > 3) {
      const msg = 'Unable to load payment configuration!'
      setError(msg)
      throw (msg)
      return
    }
    const retry = () => { setTimeout(() => loadConfiguration(id, attempt + 1), 1000) }
    fetch(
      `https://public.depay.com/configurations/${id}?v=3`,
      {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: props.configuration?.payload ? JSON.stringify({ payload: props.configuration.payload }) : undefined
      }
    ).catch(retry).then(async (response) => {
      if (response.status == 200) {
        let { id: configurationId, configuration } = JSON.parse(await response.text())

        let verified = await verify({
          signature: response.headers.get('x-signature'),
          publicKey: PUBLIC_KEY,
          data: JSON.stringify(configuration)
        })

        if (verified) {
          // Construir localConfigurationWithValues EXCLUYENDO currency (para no sobrescribir la detectada)
          const localConfigurationWithValues = Object.entries(props.configuration).reduce((acc, [key, value]) => {
            // IGNORAR currency de props.configuration - siempre usar la detectada del usuario
            if (value !== undefined && key !== 'currency') { 
              acc[key] = value 
            }
            return acc
          }, {})
          if (!configuration?.accept || !configuration?.accept?.length > 0) {
            // Configuration is missing token acceptance!
            loadConfiguration(id, attempt + 1)
          }
          if (configuration.accept.some((configuration) => !configuration.protocolFee)) {
            const msg = 'Configuration is missing protocol fee!'
            setError(msg)
            throw (msg)
          }
          // Preservar la moneda detectada del usuario (SIEMPRE, no sobrescribir con la del servidor)
          // La moneda del servidor solo se usa si viene en amount.currency como configCurrency
          // IGNORAR completamente configuration.currency del servidor y de props.configuration
          let serverConfigCurrency = null
          if (configuration?.amount && typeof configuration.amount === 'object' && configuration.amount.currency) {
            const serverAmountCurrency = configuration.amount.currency.toLowerCase()
            if (SUPPORTED_CURRENCIES.includes(serverAmountCurrency)) {
              serverConfigCurrency = serverAmountCurrency
            }
          }
          const finalConfigCurrency = serverConfigCurrency || configCurrency
          // SIEMPRE usar la moneda detectada del usuario (initialCurrency), nunca la del servidor ni la de props.configuration
          const finalCurrency = initialCurrency
          const finalCurrencyCode = new Currency({ code: finalCurrency }).code
          // NO incluir configuration.currency ni props.configuration.currency en la configuración final
          // Solo usar la detectada del usuario (finalCurrency)
          setConfiguration({ ...configuration, ...localConfigurationWithValues, id: configurationId, currencyCode: finalCurrencyCode, currency: finalCurrency, configCurrency: finalConfigCurrency })
        } else {
          const msg = 'Configuration response not verified!'
          setError(msg)
          throw (msg)
        }
      } else { retry() }
    })
  }

  useEffect(() => {
    if (configuration?.providers != undefined) {
      Object.entries(props.configuration.providers).forEach((entry) => {
        setProviderEndpoints(entry[0], entry[1])
      })
    }
  }, [configuration])

  useEffect(() => {
    if (props.configuration?.integration) {
      loadConfiguration(props.configuration?.integration, 1)
    }
  }, [props.configuration])

  if (props.configuration?.integration && !configuration) {

    return (
      <UpdatableProvider>
        <ClosableProvider unmount={props.unmount} closable={false}>
          <NavigateProvider>
            <PoweredBy />
            <LoadingStack
              text={false}
              document={props.document}
              container={props.container}
            />
          </NavigateProvider>
        </ClosableProvider>
      </UpdatableProvider>
    )

  } else {

    return (
      <ConfigurationContext.Provider value={{ ...configuration, setCurrency }}>
        {props.children}
      </ConfigurationContext.Provider>
    )
  }
}
