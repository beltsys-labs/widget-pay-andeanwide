import ConfigurationContext from '../contexts/ConfigurationContext'
import Dialog from '../components/Dialog'
import LoadingText from '../components/LoadingText'
import React, { useContext } from 'react'
import { useTranslation } from '../providers/TranslationProvider'

export default (props) => {
  const { t } = useTranslation()
  return (
    <Dialog
      closable={false}
      header={
        <div className="PaddingTopS PaddingLeftM PaddingRightM TextLeft">
          <h1 className="LineHeightL FontSizeL"><LoadingText>{t('loading')}</LoadingText></h1>
        </div>
      }
      body={
        <div className="PaddingLeftM PaddingRightM PaddingBottomXS">
          <div className="Card Skeleton">
            <div className="SkeletonBackground" />
          </div>
        </div>
      }
      footer={
        <div className="PaddingTopXS PaddingRightM PaddingLeftM PaddingBottomS">
          <div className="PaddingBottomXS">
            <div className="SkeletonWrapper PaddingBottomXS">
              <div className="ButtonPrimary Skeleton">
                <div className="SkeletonBackground" />
              </div>
            </div>
          </div>
          {props.text !== false &&
            <div className="TextCenter Opacity05 PaddingTopXS">
              <strong>{props.text}</strong>
            </div>
          }
        </div>
      }
    />
  )
}
