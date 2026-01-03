import Blockchains from '@depay/web3-blockchains'
import Dialog from '../components/Dialog'
import PaymentContext from '../contexts/PaymentContext'
import React, { useState, useContext } from 'react'
import WalletContext from '../contexts/WalletContext'
import { NavigateStackContext } from '@depay/react-dialog-stack'
import { useTranslation } from '../providers/TranslationProvider'

export default (props) => {

  const { payment } = useContext(PaymentContext)
  const { wallet } = useContext(WalletContext)
  const { navigate } = useContext(NavigateStackContext)
  const [attemptedNetworkSwitch, setAttemptedNetworkSwitch] = useState(false)
  const blockchain = Blockchains.findByName(payment.route.blockchain)
  const { t } = useTranslation()

  const switchNetwork = () => {
    wallet.switchTo(payment.blockchain)
    navigate('back')
  }

  return (
    <Dialog
      stacked={true}
      header={
        <div className="PaddingTopS PaddingLeftM PaddingRightM">
          <h1 className="LineHeightL FontSizeL">{t('network.wrong')}</h1>
        </div>
      }
      body={
        <div className="PaddingTopS PaddingLeftM PaddingRightM PaddingBottomXS TextCenter">
          <div className="GraphicWrapper">
            <img className="Graphic" src={blockchain.logoWhiteBackground} />
          </div>
          <h1 className="LineHeightL Text FontSizeL PaddingTopS FontWeightBold">{t('network.connectTo', { blockchain: blockchain.label })}</h1>
          <div className="Text PaddingTopS PaddingBottomS PaddingLeftS PaddingRightS">
            <strong className="FontSizeM">
              {t('network.checkConnection')}
            </strong>
          </div>
        </div>
      }
      footer={
        <div className="PaddingTopXS PaddingRightM PaddingLeftM PaddingBottomM">
          <button type="button" className="ButtonPrimary" onClick={switchNetwork}>
            {t('network.switch')}
          </button>
        </div>
      }
    />
  )
}
