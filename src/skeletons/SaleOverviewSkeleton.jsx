import Dialog from '../components/Dialog'
import React from 'react'
import { useTranslation } from '../providers/TranslationProvider'

export default (props) => {

  const { t } = useTranslation()

  return (
    <Dialog
      header={
        <div className="PaddingTopS PaddingLeftM PaddingRightM TextLeft">
          <h1 className="LineHeightL FontSizeL">{t('sale.buy')}</h1>
        </div>
      }
      body={
        <div className="PaddingLeftM PaddingRightM PaddingBottomXS">
          <div className="Card Skeleton" style={{ height: '100px' }}>
            <div className="SkeletonBackground" />
          </div>
          <div className="Card Skeleton">
            <div className="SkeletonBackground" />
          </div>
        </div>
      }
      footer={
        <div className="PaddingTopXS PaddingRightM PaddingLeftM PaddingBottomM">
          <div className="SkeletonWrapper">
            <div className="ButtonPrimary Skeleton">
              <div className="SkeletonBackground" />
            </div>
          </div>
        </div>
      }
    />
  )
}
