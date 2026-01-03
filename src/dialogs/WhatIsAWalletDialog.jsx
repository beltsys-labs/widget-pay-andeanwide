import React from 'react'
import Dialog from '../components/Dialog'
import QuestionsGraphic from '../graphics/wallets/questions'
import { useTranslation } from '../providers/TranslationProvider'

export default (props) => {
  const { t } = useTranslation()

  return (
    <Dialog
      stacked={true}
      header={
        <div>
          <div className="PaddingTopS PaddingLeftM PaddingRightM TextCenter">
            <h1 className="LineHeightL FontSizeL">{t('wallet.whatIs.title')}</h1>
          </div>
        </div>
      }
      body={
        <div className="TextCenter PaddingLeftL PaddingRightL PaddingTopS">

          <div className="GraphicWrapper">
            <QuestionsGraphic />
          </div>

          <p className="FontSizeM PaddingTopS PaddingLeftM PaddingRightM">
            {t('wallet.whatIs.description')}
          </p>

          <div className="PaddingTopS">
            <a className="Link FontSizeM" href="https://ethereum.org/wallets/" target="_blank" rel="noopener noreferrer">
              {t('wallet.whatIs.learnMore')}
            </a>
          </div>
        </div>
      }
    />
  )
}
