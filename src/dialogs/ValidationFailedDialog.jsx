import ClosableContext from '../contexts/ClosableContext'
import ConfigurationContext from '../contexts/ConfigurationContext'
import Dialog from '../components/Dialog'
import ErrorGraphic from '../graphics/wallets/error'
import link from '../helpers/link'
import PaymentTrackingContext from '../contexts/PaymentTrackingContext'
import React, { useContext } from 'react'
import supportUrl from '../helpers/supportUrl'
import WalletContext from '../contexts/WalletContext'
import { useTranslation } from '../providers/TranslationProvider'

export default () => {

  const { close } = useContext(ClosableContext)
  const { transaction } = useContext(PaymentTrackingContext)
  const { account, wallet } = useContext(WalletContext)
  const configuration = useContext(ConfigurationContext)
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
          <h1 className="LineHeightL Text FontSizeL PaddingTopS FontWeightBold">{t('validation.failed')}</h1>
          <div className="Text PaddingBottomS PaddingLeftS PaddingRightS">
            <div className="PaddingTopS">
              <strong className="FontSizeM">{t('validation.confirmingFailed')}</strong>
            </div>
            <div className="PaddingTopXS PaddingBottomS">
              <strong className="FontSizeM">{t('validation.contactSupport')}</strong>
            </div>
          </div>
        </div>
      }
      footer={
        <div className="PaddingTopXS PaddingRightM PaddingLeftM PaddingBottomM">
          <a
            href={link({
              url: supportUrl({
                configuration,
                params: {
                  wallet: wallet?.name,
                  account,
                  transaction: transaction?.id,
                  query: 'Payment validation failed'
                }
              }), target: '_blank', wallet
            })}
            target="_blank"
            className="ButtonPrimary"
          >
            {t('menu.contactSupport')}
          </a>
        </div>
      }
    />
  )
}
