import ConfigurationContext from '../contexts/ConfigurationContext'
import Dialog from '../components/Dialog'
import React, { useContext } from 'react'
import { useTranslation } from '../providers/TranslationProvider'

export default (props) => {

  const { title } = useContext(ConfigurationContext)
  const { t } = useTranslation()

  return (
    <Dialog
      header={
        <div className="PaddingTopS PaddingLeftM PaddingRightM TextLeft">
          <h1 className="LineHeightL FontSizeL">{title || t('donation.title')}</h1>
        </div>
      }
      body={
        <div className="PaddingLeftM PaddingRightM PaddingBottomXS">
          <div className="Card Skeleton">
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
