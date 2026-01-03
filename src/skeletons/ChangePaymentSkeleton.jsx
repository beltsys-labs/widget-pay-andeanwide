import Dialog from '../components/Dialog'
import React, { useContext } from 'react'
import { useTranslation } from '../providers/TranslationProvider'

export default (props) => {

  const { t } = useTranslation()

  return (
    <Dialog
      stacked={true}
      header={
        <div className="PaddingTopS PaddingLeftM PaddingRightM PaddingBottomS">
          <h1 className="LineHeightL FontSizeL TextCenter">{t('paymentOptions.title')}</h1>
        </div>
      }
      body={
        <div className="MaxHeight PaddingTopXS">
          <div className="PaddingLeftM PaddingRightM">
            <div className="Card Skeleton">
              <div className="SkeletonBackground" />
            </div>
            <div className="Card Skeleton">
              <div className="SkeletonBackground" />
            </div>
            <div className="Card Skeleton">
              <div className="SkeletonBackground" />
            </div>
          </div>
        </div>
      }
      footer={
        <div className="PaddingBottomXS">
          <div className="TextCenter Opacity05 PaddingTopS PaddingBottomS">
            <strong>{t('paymentOptions.loading')}</strong>
          </div>
        </div>
      }
    />
  )
}
