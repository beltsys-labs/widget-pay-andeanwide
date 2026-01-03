/*#if _EVM

import { TokenImage } from '@depay/react-token-image-evm'

/*#elif _SVM

import { TokenImage } from '@depay/react-token-image-svm'

//#else */

import { TokenImage } from '@depay/react-token-image'

//#endif

import Blockchains from '@depay/web3-blockchains'
import ChangableAmountContext from '../contexts/ChangableAmountContext'
import ChevronRightIcon from '../icons/ChevronRightIcon'
import ConfigurationContext from '../contexts/ConfigurationContext'
import Dialog from '../components/Dialog'
import DropDown from '../components/DropDown'
import Footer from '../components/Footer'
import format from '../helpers/format'
import initMobileAppDebug from '../helpers/initMobileAppDebug'
import MenuIcon from '../icons/MenuIcon'
import PaymentContext from '../contexts/PaymentContext'
import PaymentOverviewSkeleton from '../skeletons/PaymentOverviewSkeleton'
import PaymentValueContext from '../contexts/PaymentValueContext'
import React, { useContext, useState, useEffect, useRef } from 'react'
import supportUrl from '../helpers/supportUrl'
import WalletContext from '../contexts/WalletContext'
import { Currency } from '@depay/local-currency'
import { NavigateStackContext } from '@depay/react-dialog-stack'
import { useTranslation } from '../providers/TranslationProvider'

// Mapeo de códigos de moneda a códigos de país para banderas
const CURRENCY_TO_COUNTRY_CODE = {
  'aed': 'ae', 'afn': 'af', 'all': 'al', 'amd': 'am', 'ang': 'cw',
  'aoa': 'ao', 'ars': 'ar', 'aud': 'au', 'awg': 'aw', 'azn': 'az',
  'bam': 'ba', 'bbd': 'bb', 'bdt': 'bd', 'bgn': 'bg', 'bhd': 'bh',
  'bif': 'bi', 'bmd': 'bm', 'bnd': 'bn', 'bob': 'bo', 'brl': 'br',
  'bsd': 'bs', 'btn': 'bt', 'bwp': 'bw', 'byn': 'by', 'bzd': 'bz',
  'cad': 'ca', 'cdf': 'cd', 'chf': 'ch', 'clf': 'cl', 'clp': 'cl',
  'cnh': 'cn', 'cny': 'cn', 'cop': 'co', 'crc': 'cr', 'cup': 'cu',
  'cve': 'cv', 'czk': 'cz', 'djf': 'dj', 'dkk': 'dk', 'dop': 'do',
  'dzd': 'dz', 'egp': 'eg', 'ern': 'er', 'etb': 'et', 'eur': 'eu',
  'fjd': 'fj', 'fkp': 'fk', 'fok': 'fo', 'gbp': 'gb', 'gel': 'ge',
  'ggp': 'gg', 'ghs': 'gh', 'gip': 'gi', 'gmd': 'gm', 'gnf': 'gn',
  'gtq': 'gt', 'gyd': 'gy', 'hkd': 'hk', 'hnl': 'hn', 'hrk': 'hr',
  'htg': 'ht', 'huf': 'hu', 'idr': 'id', 'ils': 'il', 'imp': 'im',
  'inr': 'in', 'iqd': 'iq', 'irr': 'ir', 'isk': 'is', 'jep': 'je',
  'jmd': 'jm', 'jod': 'jo', 'jpy': 'jp', 'kes': 'ke', 'kgs': 'kg',
  'khr': 'kh', 'kid': 'ki', 'kmf': 'km', 'krw': 'kr', 'kwd': 'kw',
  'kyd': 'ky', 'kzt': 'kz', 'lak': 'la', 'lbp': 'lb', 'lkr': 'lk',
  'lrd': 'lr', 'lsl': 'ls', 'lyd': 'ly', 'mad': 'ma', 'mdl': 'md',
  'mga': 'mg', 'mkd': 'mk', 'mmk': 'mm', 'mnt': 'mn', 'mop': 'mo',
  'mru': 'mr', 'mur': 'mu', 'mvr': 'mv', 'mwk': 'mw', 'mxn': 'mx',
  'myr': 'my', 'mzn': 'mz', 'nad': 'na', 'ngn': 'ng', 'nio': 'ni',
  'nok': 'no', 'npr': 'np', 'nzd': 'nz', 'omr': 'om', 'pab': 'pa',
  'pen': 'pe', 'pgk': 'pg', 'php': 'ph', 'pkr': 'pk', 'pln': 'pl',
  'pyg': 'py', 'qar': 'qa', 'ron': 'ro', 'rsd': 'rs', 'rub': 'ru',
  'rwf': 'rw', 'sar': 'sa', 'sbd': 'sb', 'scr': 'sc', 'sdg': 'sd',
  'sek': 'se', 'sgd': 'sg', 'shp': 'sh', 'sle': 'sl', 'sos': 'so',
  'srd': 'sr', 'ssp': 'ss', 'stn': 'st', 'syp': 'sy', 'szl': 'sz',
  'thb': 'th', 'tjs': 'tj', 'tmt': 'tm', 'tnd': 'tn', 'top': 'to',
  'try': 'tr', 'ttd': 'tt', 'tvd': 'tv', 'twd': 'tw', 'tzs': 'tz',
  'uah': 'ua', 'ugx': 'ug', 'usd': 'us', 'uyu': 'uy', 'uzs': 'uz',
  'ves': 've', 'vnd': 'vn', 'vuv': 'vu', 'wst': 'ws', 'xaf': 'cm',
  'xcd': 'ag', 'xdr': 'un', 'xof': 'sn', 'xpf': 'pf', 'yer': 'ye',
  'zar': 'za', 'zmw': 'zm', 'zwl': 'zw'
}

export default (props) => {
  const configuration = useContext(ConfigurationContext)
  const { currencyCode, amount: amountConfiguration, currency, title, action } = configuration
  const { payment, paymentState } = useContext(PaymentContext)
  const { amount, amountsMissing, fixedAmount, fixedCurrency, isUpdatingAmount, setIsUpdatingAmount } = useContext(ChangableAmountContext)
  const { disconnect, wallet, account } = useContext(WalletContext)
  const { paymentValue, displayedPaymentValue } = useContext(PaymentValueContext)
  const { navigate } = useContext(NavigateStackContext)
  const { t } = useTranslation()
  const [showDropDown, setShowDropDown] = useState(false)
  const displayedCurrencyCode = (amountConfiguration != undefined && amountConfiguration.token) ? null : currencyCode

  // Determinar la clave de traducción para el título según el action
  const getHeaderTitle = () => {
    if (title) {
      return title
    }
    if (action === 'recharge') {
      return t('recharge.title')
    } else if (action === 'donation') {
      return t('donation.title')
    }
    return t('payment.title')
  }
  
  // Ref para rastrear el último payment amount y desactivar skeleton cuando se actualiza
  const lastPaymentAmountRef = useRef()
  
  // Desactivar skeleton cuando el payment se actualiza después de un cambio del usuario
  useEffect(() => {
    if (isUpdatingAmount && payment && payment.amount) {
      const currentPaymentAmount = payment.amount.toString()
      // Si el payment cambió (nuevo amount), desactivar skeleton
      if (lastPaymentAmountRef.current !== currentPaymentAmount && lastPaymentAmountRef.current !== undefined) {
        setIsUpdatingAmount(false)
      }
      lastPaymentAmountRef.current = currentPaymentAmount
    }
  }, [payment, isUpdatingAmount, setIsUpdatingAmount])
  
  const alternativeHeaderActionElement = (
    <span className="DropDownWrapper">
      <button type="button" onClick={() => setShowDropDown(!showDropDown)} className="ButtonCircular">
        <MenuIcon />
      </button>
      {showDropDown && <DropDown hide={() => setShowDropDown(false)}
        items={[
          {
            label: t("menu.contactSupport"), action: () => {
              window.open(supportUrl({
                configuration,
                params: {
                  wallet: wallet?.name,
                  account,
                  query: t("menu.needHelp")
                }
              }), '_blank')
            }
          },
          paymentState == 'initialized' ? { label: t("menu.disconnectWallet"), action: disconnect } : undefined,
        ].filter(Boolean)}
      />}
    </span>
  )
  let initMobileAppDebugCounter = useRef()

  if (payment == undefined || isUpdatingAmount) { return (<PaymentOverviewSkeleton alternativeHeaderAction={alternativeHeaderActionElement} />) }

  return (
    <Dialog
      header={
        <div className="PaddingTopS PaddingLeftM PaddingRightM TextLeft">
          <h1 onClick={() => {
            initMobileAppDebugCounter.current = (initMobileAppDebugCounter.current || 0) + 1
            if (initMobileAppDebugCounter.current >= 5) {
              initMobileAppDebug()
            }
          }} className="LineHeightL FontSizeL">{getHeaderTitle()}</h1>
        </div>
      }
      alternativeHeaderAction={alternativeHeaderActionElement}
      body={
        <div className="PaddingLeftM PaddingRightM">
          {displayedCurrencyCode && (currency !== false) &&
            <button
              type="button"
              className={["Card", (paymentState == 'initialized' ? '' : 'disabled')].join(' ')}
              title={paymentState == 'initialized' ? (t("currency.change") || "Change Currency") : undefined}
              onClick={() => {
                if (paymentState != 'initialized') { return }
                navigate('SelectCurrency')
              }}
            >
              <div className="CardBody">
                <div className="CardBodyWrapper">
                  <h4 className="CardTitle">
                    {t("currency.title") || "Currency"}
                  </h4>
                  <div className="CardText">
                    <div className="TokenAmountRow" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {(() => {
                        const countryCode = CURRENCY_TO_COUNTRY_CODE[currency?.toLowerCase()]
                        return countryCode ? (
                          <img 
                            src={`https://flagcdn.com/w20/${countryCode}.png`}
                            alt=""
                            style={{ width: '20px', height: '15px', objectFit: 'cover', borderRadius: '2px' }}
                            onError={(e) => {
                              e.target.style.display = 'none'
                            }}
                          />
                        ) : null
                      })()}
                      <span className="TokenSymbolCell" style={{ fontWeight: 'bold' }}>
                        {currencyCode.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="CardAction">
                <ChevronRightIcon />
              </div>
            </button>
          }
          {amountsMissing &&
            <button
              type="button"
              className={["Card", (paymentState == 'initialized' && !fixedAmount ? '' : 'disabled')].join(' ')}
              title={paymentState == 'initialized' && !fixedAmount ? t("payment.changeAmount") : undefined}
              onClick={() => {
                if (paymentState != 'initialized' || fixedAmount) { return }
                navigate('ChangeAmount')
              }}
            >
              <div className="CardBody">
                <div className="CardBodyWrapper">
                  <h4 className="CardTitle">
                    {t("payment.amount")}
                  </h4>
                  <div className="CardText">
                    {
                      displayedCurrencyCode &&
                      <div className="TokenAmountRow">
                        {new Currency({ amount: amount.toFixed(2), code: currencyCode }).toString()}
                      </div>
                    }
                    {
                      !displayedCurrencyCode &&
                      <div className="TokenAmountRow">
                        {amount}
                      </div>
                    }
                  </div>
                </div>
              </div>
              {!fixedAmount && (
                <div className="CardAction">
                  <ChevronRightIcon />
                </div>
              )}
            </button>
          }
          <button
            type="button"
            className={["Card", (paymentState == 'initialized' ? '' : 'disabled')].join(' ')}
            title={paymentState == 'initialized' ? t("payment.changePayment") : undefined}
            onClick={() => {
              if (paymentState != 'initialized') { return }
              navigate('ChangePayment')
            }}
          >
            <div className="CardImage" title={payment.name}>
              <TokenImage
                blockchain={payment.blockchain.name}
                address={payment.token}
              />
              <img className={"BlockchainLogo small bottomRight " + payment.blockchain.name} style={{ backgroundColor: payment.blockchain.logoBackgroundColor }} src={payment.blockchain.logo} alt={payment.blockchain.label} title={payment.blockchain.label} />
            </div>
            <div className="CardBody">
              <div className="CardBodyWrapper">
                {amountsMissing && !fixedCurrency &&
                  <h4 className="CardTitle">
                    {t("payment.title")}
                  </h4>
                }
                <div className="CardText">
                  <div className="TokenAmountRow">
                    <span className="TokenSymbolCell">
                      {payment.symbol}
                    </span>
                    <span>&nbsp;</span>
                    <span className="TokenAmountCell">
                      {format(payment.amount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="CardAction">
              <ChevronRightIcon />
            </div>
          </button>
        </div>
      }
      footer={
        <div className="PaddingTopXS PaddingRightM PaddingLeftM PaddingBottomM">
          <Footer />
        </div>
      }
    />
  )
}
