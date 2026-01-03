import ClosableContext from '../contexts/ClosableContext'
import ConfigurationContext from '../contexts/ConfigurationContext'
import Dialog from '../components/Dialog'
import ErrorGraphic from '../graphics/wallets/error'
import link from '../helpers/link'
import PaymentTrackingContext from '../contexts/PaymentTrackingContext'
import React, { useContext } from 'react'
import WalletContext from '../contexts/WalletContext'
import { useTranslation } from '../providers/TranslationProvider'

export default () => {

  const { close } = useContext(ClosableContext)
  const { transaction } = useContext(PaymentTrackingContext)
  const { wallet } = useContext(WalletContext)
  const { t } = useTranslation()

  return (
    <Dialog
      stacked={false}
      header={
        <div className="PaddingTopS PaddingLeftM PaddingRightM">
        </div>
      }
      body={
        <div className="TextCenter">
          <div className="GraphicWrapper">
            <ErrorGraphic />
          </div>
          <h1 className="LineHeightL Text FontSizeL PaddingTopS FontWeightBold">{t('payment.failed')}</h1>
          <div className="Text PaddingBottomS PaddingLeftS PaddingRightS">
            <div className="PaddingTopS">
              <strong className="FontSizeM">{t('payment.didNotSucceed')}</strong>
            </div>
            <div className="PaddingTopXS">
              <strong className="FontSizeM">{t('payment.pleaseTryAgain')}</strong>
            </div>
            <div className="PaddingTopS">
              {transaction &&
                <a className="Link" title="Check transaction details" href={link({ url: transaction?.url, target: '_blank', wallet })} target="_blank" rel="noopener noreferrer">
                  {t('payment.viewDetails')}
                </a>
              }
            </div>
          </div>
        </div>
      }
      footer={
        <div className="PaddingTopXS PaddingRightM PaddingLeftM PaddingBottomM">
          <button className='ButtonPrimary' onClick={() => close()}>
            {t('payment.tryAgain')}
          </button>
        </div>
      }
    />
  )
}
