import ChangableAmountContext from '../contexts/ChangableAmountContext'
import ConfigurationContext from '../contexts/ConfigurationContext'
import PaymentAmountRoutingContext from '../contexts/PaymentAmountRoutingContext'
import PaymentRoutingProvider from './PaymentRoutingProvider'
import React, { useState, useEffect, useContext } from 'react'

export default (props)=>{
  const { amountsMissing, acceptWithAmount } = useContext(ChangableAmountContext)
  const { accept: configuredAccept } = useContext(ConfigurationContext)
  const [ accept, setAccept ] = useState()

  useEffect(()=>{
    if(amountsMissing) {
      if (acceptWithAmount && Array.isArray(acceptWithAmount) && acceptWithAmount.length > 0) {
        // Crear una nueva referencia del array para forzar la detección del cambio
        const newAccept = JSON.parse(JSON.stringify(acceptWithAmount))
        setAccept(newAccept)
      }
    } else {
      setAccept(configuredAccept)
    }
  }, [amountsMissing, acceptWithAmount, configuredAccept])

  return(
    <PaymentAmountRoutingContext.Provider value={{}}>
      <PaymentRoutingProvider accept={ accept } container={ props.container } document={ props.document }>
        { props.children }
      </PaymentRoutingProvider>
    </PaymentAmountRoutingContext.Provider>
  )
}
