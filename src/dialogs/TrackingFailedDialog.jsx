import Dialog from '../components/Dialog'
import ErrorGraphic from '../graphics/wallets/error'
import ConfigurationContext from '../contexts/ConfigurationContext'
import PaymentTrackingContext from '../contexts/PaymentTrackingContext'
import React, { useContext } from 'react'
import supportUrl from '../helpers/supportUrl'
import { NavigateStackContext } from '@depay/react-dialog-stack'
import { useTranslation } from '../providers/TranslationProvider'

export default () => {

  const { continueTryTracking, transaction } = useContext(PaymentTrackingContext)
  const { navigate } = useContext(NavigateStackContext)
  const configuration = useContext(ConfigurationContext)
  const { t } = useTranslation()

  const tryAgain = () => {
    continueTryTracking()
    navigate('back')
  }

  return (
    <Dialog
      stacked={false}
      header={
        <div className="PaddingTopS PaddingLeftM PaddingRightM TextLeft">
          <a
            href={supportUrl({
              configuration,
              params: {
                transaction: transaction?.id,
                query: 'Tracking payment failed'
              }
            })}
            target="_blank"
            className="Card secondary small inlineBlock"
          >
            {t('menu.contactSupport')}
          </a>
        </div>
      }
      body={
        <div className="TextCenter">
          <div className="GraphicWrapper">
            <ErrorGraphic />
          </div>
          <h1 className="LineHeightL Text FontSizeL PaddingTopS FontWeightBold">{t('tracking.failed')}</h1>
          <div className="Text PaddingTopS PaddingBottomS PaddingLeftS PaddingRightS">
            <strong className="FontSizeM">
              {t('tracking.checkInternet')}
            </strong>
            <div className="PaddingTopS">
              <span>{t('tracking.reportIt')}</span>
            </div>
          </div>
        </div>
      }
      footer={
        <div className="PaddingTopXS PaddingRightM PaddingLeftM PaddingBottomM">
          <button className='ButtonPrimary' onClick={tryAgain}>
            {t('payment.tryAgain')}
          </button>
        </div>
      }
    />
  )
}
