import ChangableAmountContext from '../contexts/ChangableAmountContext'
import ConfigurationContext from '../contexts/ConfigurationContext'
import Dialog from '../components/Dialog'
import PaymentRoutingContext from '../contexts/PaymentRoutingContext'
import React, { useContext } from 'react'
import { useTranslation } from '../providers/TranslationProvider'

export default (props) => {
  const { amountsMissing, fixedAmount } = useContext(ChangableAmountContext)
  const { slowRouting, selectedRoute } = useContext(PaymentRoutingContext)
  const { title, action } = useContext(ConfigurationContext)
  const { t } = useTranslation()

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

  return (
    <Dialog
      header={
        <div className="PaddingTopS PaddingLeftM PaddingRightM TextLeft">
          <h1 className="LineHeightL FontSizeL">{getHeaderTitle()}</h1>
        </div>
      }
      alternativeHeaderAction={props.alternativeHeaderAction}
      body={
        <div className="PaddingLeftM PaddingRightM PaddingBottomXS">
          {amountsMissing && !fixedAmount &&
            <div className="Card Skeleton">
              <div className="SkeletonBackground" />
            </div>
          }
          <div className="Card Skeleton">
            <div className="SkeletonBackground" />
          </div>
        </div>
      }
      footer={
        <div className={["PaddingTopXS PaddingRightM PaddingLeftM", (selectedRoute == undefined && slowRouting) ? 'PaddingBottomS' : 'PaddingBottomM'].join(' ')}>
          <div className="SkeletonWrapper">
            <div className="ButtonPrimary Skeleton">
              <div className="SkeletonBackground" />
            </div>
          </div>
          {selectedRoute == undefined && slowRouting &&
            <div className="TextCenter Opacity05 PaddingTopS">
              <strong>{t('payment.loading')}</strong>
            </div>
          }
        </div>
      }
    />
  )
}
