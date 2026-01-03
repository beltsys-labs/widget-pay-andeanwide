import addressEllipsis from '../helpers/addressEllipsis'

import Blockchains from '@depay/web3-blockchains'
import ChangableAmountContext from '../contexts/ChangableAmountContext'
import ClosableContext from '../contexts/ClosableContext'
import ConfigurationContext from '../contexts/ConfigurationContext'
import Dialog from '../components/Dialog'
import QuestionsGraphic from '../graphics/wallets/questions'
import React, { useContext, useEffect, useState } from 'react'
import WalletContext from '../contexts/WalletContext'
import { Currency } from '@depay/local-currency'
import { useTranslation } from '../providers/TranslationProvider'
import supportUrl from '../helpers/supportUrl'

export default () => {

  const configuration = useContext(ConfigurationContext)
  const { accept, currencyCode, amount: amountConfiguration } = configuration
  const { amount } = useContext(ChangableAmountContext)
  const { close } = useContext(ClosableContext)
  const { wallet } = useContext(WalletContext)
  const [walletAddress, setWalletAddress] = useState()
  const { t } = useTranslation()
  
  // Formatear el amount necesario
  const displayedCurrencyCode = (amountConfiguration != undefined && amountConfiguration.token) ? null : currencyCode
  const formattedAmount = displayedCurrencyCode && amount
    ? new Currency({ amount: amount.toFixed(2), code: currencyCode }).toString()
    : amount
    ? amount.toFixed(2)
    : null

  useEffect(() => {
    wallet.account().then(setWalletAddress)
  }, [wallet])

  return (
    <Dialog
      header={
        <div className="PaddingTopS PaddingLeftM PaddingRightM TextLeft">
          <a
            href={supportUrl({
              configuration,
              params: {
                account: walletAddress,
                wallet: wallet?.name,
                query: t('noFunds.message')
              }
            })}
            target="_blank"
            className="Card secondary small inlineBlock"
          >
            {t('noFunds.contactSupport')}
          </a>
        </div>
      }
      body={
        <div className="TextCenter">

          <div className="GraphicWrapper">
            <QuestionsGraphic />
          </div>

          <div className="PaddingTopXS PaddingBottomXS">

            <h1 className="LineHeightL Text FontSizeL PaddingTopXS FontWeightBold">{t('noFunds.title')}</h1>

            <div className="Text PaddingTopS PaddingBottomXS PaddingLeftM PaddingRightM">
              <strong className="FontSizeM">
                {t('noFunds.message')}
                {formattedAmount && (
                  <span className="DisplayBlock PaddingTopXS">
                    {t('noFunds.requiredAmount', { amount: formattedAmount })}
                  </span>
                )}
              </strong>
            </div>

            <div className="Text PaddingTopXS PaddingBottomS PaddingLeftM PaddingRightM">
              {[...new Set(accept.map((accept) => accept.blockchain))].map((blockchain) => {
                return (
                  <div key={blockchain} className="Card tiny disabled inlineBlock MarginRightXS MarginBottomXS">
                    <img className={"BlockchainLogo small bottomRight " + Blockchains[blockchain].name} style={{ backgroundColor: Blockchains[blockchain].logoBackgroundColor }} src={Blockchains[blockchain].logo} alt={Blockchains[blockchain].label} title={Blockchains[blockchain].label} />
                    <span className="PaddingLeftXS ResponsiveText FontWeightLight">{Blockchains[blockchain].label}</span>
                  </div>
                )
              })}
            </div>

            <div className="Text PaddingBottomXS PaddingLeftM PaddingRightM">
              <div className="Card tiny disabled transparent center Opacity03">
                <div className="ResponsiveText FontWeightLight TextCenter">{walletAddress}</div>
              </div>
            </div>

          </div>
        </div>
      }
      footer={
        <div className="PaddingTopXS PaddingRightM PaddingLeftM PaddingBottomM">
          <button className="ButtonPrimary" onClick={close}>
            {t('noFunds.ok')}
          </button>
        </div>
      }
    />
  )
}
