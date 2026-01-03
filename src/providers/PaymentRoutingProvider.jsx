/*#if _EVM

import { request } from '@depay/web3-client-evm'

/*#elif _SVM

import { request } from '@depay/web3-client-svm'

//#else */

import { request } from '@depay/web3-client'

//#endif

import Blockchains from '@depay/web3-blockchains'
import ChangableAmountContext from '../contexts/ChangableAmountContext'
import ConfigurationContext from '../contexts/ConfigurationContext'
import debounce from '../helpers/debounce'
import PaymentRoutingContext from '../contexts/PaymentRoutingContext'
import React, { useState, useContext, useEffect, useCallback, useRef } from 'react'
import round from '../helpers/round'
import routePayments from '../helpers/routePayments'
import UpdatableContext from '../contexts/UpdatableContext'
import WalletContext from '../contexts/WalletContext'
import ErrorContext from '../contexts/ErrorContext'
import { ethers } from 'ethers'

const RELOAD_PERIOD = 15_000;

export default (props) => {
  const [allRoutes, setAllRoutes] = useState()
  const [updatedRoutes, setUpdatedRoutes] = useState()
  const [updatedRouteWithNewPrice, setUpdatedRouteWithNewPrice] = useState()
  const [selectedRoute, setSelectedRoute] = useState()
  const [slowRouting, setSlowRouting] = useState(false)
  const [reloadCount, setReloadCount] = useState(0)
  const [allRoutesLoaded, setAllRoutesLoaded] = useState(false)
  const { account, wallet, solanaPayWallet } = useContext(WalletContext)
  const { updatable } = useContext(UpdatableContext)
  const configuration = useContext(ConfigurationContext)
  const { amountsMissing, amount } = useContext(ChangableAmountContext)
  const { setError } = useContext(ErrorContext)

  const getPaymentRoutes = async ({ allRoutes, selectedRoute, updatable }) => {
    if (updatable == false || !props.accept || !account) { return }
    let slowRoutingTimeout = setTimeout(() => { setSlowRouting(true) }, 3000)
    let allRoutesLoadedStart = Date.now()
    return new Promise((resolve, reject) => {
      routePayments(Object.assign({}, configuration, {
        accept: props.accept,
        account,
        best: (route) => {
          if (route && !selectedRoute) {
            roundAmounts([route]).then((routes) => {
              setSelectedRoute(routes[0])
              clearInterval(slowRoutingTimeout)
            })
          }
        }
      }))
        .then((routes) => {
          setUpdatedRoutes(routes)
          clearInterval(slowRoutingTimeout)
          resolve()
        }).catch((error) => {
          setError(error)
          resolve()
        })
    })
  }

  const updateRouteAmount = (route, amountBN) => {
    route.fromAmount = amountBN.toString()
  }

  const roundAmount = async (route, amountBN) => {
    if (route.directTransfer) { return route }
    let readableAmount = await route.fromToken.readable(amountBN || route.fromAmount)
    if (round(readableAmount) === 0) { return route }
    let roundedAmountBN = await route.fromToken.BigNumber(round(readableAmount))
    updateRouteAmount(route, roundedAmountBN)
    return route
  }

  const roundAmounts = async (routes) => {
    return Promise.all(routes.map((route) => roundAmount(route)))
  }

  const updateRouteWithNewPrice = async () => {
    setSelectedRoute({ ...updatedRouteWithNewPrice })
    setUpdatedRouteWithNewPrice(null)
  }

  const refreshPaymentRoutes = () => {
    // Mantener el selectedRoute actual para evitar que se ponga a undefined temporalmente
    // Esto mejora la experiencia del usuario al cambiar el amount
    return getPaymentRoutes({ allRoutes, selectedRoute, updatable })
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (allRoutesLoaded) { // do not reload if first routes have not been loaded yet
        setReloadCount(reloadCount + 1)
        getPaymentRoutes({ allRoutes, selectedRoute, updatable })
      }
    }, RELOAD_PERIOD);

    return () => clearTimeout(timeout)
  }, [reloadCount, allRoutes, allRoutesLoaded, selectedRoute, updatable])

  useEffect(() => {
    if (account && props.accept && !solanaPayWallet) {
      refreshPaymentRoutes()
    } else if (props.accept === undefined) {
      setSelectedRoute()
      setAllRoutesLoaded(false)
      setUpdatedRoutes()
      setAllRoutes()
    }
  }, [account, solanaPayWallet, props.accept])

  // Ref para rastrear el último fromAmount procesado y evitar actualizaciones innecesarias
  const lastProcessedFromAmountRef = useRef()
  
  const updateAllRoutes = useCallback(debounce((selectedRoute, updatedRoutes) => {
    if (updatedRoutes === undefined) { return }
    if (updatedRoutes.length == 0) {
      setAllRoutes(updatedRoutes)
      lastProcessedFromAmountRef.current = undefined
    } else {
      roundAmounts(updatedRoutes).then((roundedRoutes) => {
        if (typeof selectedRoute == 'undefined') {
          let selectRoute = roundedRoutes[0]
          const newFromAmount = selectRoute?.fromAmount?.toString()
          // Solo actualizar si el fromAmount realmente cambió
          if (lastProcessedFromAmountRef.current !== newFromAmount) {
            setSelectedRoute(selectRoute)
            lastProcessedFromAmountRef.current = newFromAmount
          }
        } else {
          const updatedSelectedRoute = roundedRoutes[
            roundedRoutes.findIndex(
              (route) => (
                route.fromToken.address == selectedRoute.fromToken.address &&
                route.blockchain == selectedRoute.blockchain
              )
            )
          ]
          if (updatedSelectedRoute) {
            const currentFromAmount = selectedRoute?.fromAmount?.toString()
            const newFromAmount = updatedSelectedRoute.fromAmount?.toString()
            // Solo actualizar si el fromAmount realmente cambió y es diferente del último procesado
            if (currentFromAmount !== newFromAmount && lastProcessedFromAmountRef.current !== newFromAmount) {
              setSelectedRoute({ ...updatedSelectedRoute })
              setUpdatedRouteWithNewPrice(updatedSelectedRoute)
              lastProcessedFromAmountRef.current = newFromAmount
            }
          } else {
            const firstRouteFromAmount = roundedRoutes[0]?.fromAmount?.toString()
            // Solo actualizar si el fromAmount realmente cambió
            if (lastProcessedFromAmountRef.current !== firstRouteFromAmount) {
              setSelectedRoute(roundedRoutes[0])
              lastProcessedFromAmountRef.current = firstRouteFromAmount
            }
          }
        }
        roundedRoutes.assets = updatedRoutes.assets
        setAllRoutes(roundedRoutes)
        setAllRoutesLoaded(true)
      })
    }
  }, 500), [])

  useEffect(() => {
    updateAllRoutes(selectedRoute, updatedRoutes)
  }, [selectedRoute, updatedRoutes])

  return (
    <PaymentRoutingContext.Provider value={{
      selectedRoute,
      setSelectedRoute,
      refreshPaymentRoutes,
      allRoutes,
      allRoutesLoaded,
      slowRouting,
      updatedRouteWithNewPrice,
      updateRouteWithNewPrice
    }}>
      {props.children}
    </PaymentRoutingContext.Provider>
  )
}
