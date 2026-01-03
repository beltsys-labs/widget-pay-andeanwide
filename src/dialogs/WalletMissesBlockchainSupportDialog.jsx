import Blockchains from '@depay/web3-blockchains'
import Dialog from '../components/Dialog'
import QuestionsGraphic from '../graphics/wallets/questions'
import React, { useContext } from 'react'
import supportUrl from '../helpers/supportUrl'
import WalletContext from '../contexts/WalletContext'
import ConfigurationContext from '../contexts/ConfigurationContext'
import { NavigateStackContext } from '@depay/react-dialog-stack'
import { useTranslation } from '../providers/TranslationProvider'

export default (props) => {

  const { navigate } = useContext(NavigateStackContext)
  const configuration = useContext(ConfigurationContext)
  const { accept } = configuration
  const { wallet } = useContext(WalletContext)
  const blockchains = [...new Set(accept.map((configuration) => configuration.blockchain))].map((blockchainName) => Blockchains[blockchainName])
  const { t } = useTranslation()

  return (
    <Dialog
      header={
        <div className="PaddingTopS PaddingLeftM PaddingRightM TextLeft">
          <a
            href={supportUrl({
              configuration,
              params: {
                wallet: wallet?.name,
                blockchains: blockchains.map((blockchain) => blockchain.name).join(','),
                query: 'Wallet does not support blockchain'
              }
            })}
            target="_blank"
            className="Card secondary small inlineBlock"
          >
            {t('noFunds.contactSupport')}
          </a>
        </div>
      }
      body={
        <div className="TextCenter">
          <div className="GraphicWrapper">
            <QuestionsGraphic />
          </div>
          <h1 className="LineHeightL Text FontSizeL PaddingTopS FontWeightBold">{t('wallet.missingBlockchainSupport.title')}</h1>
          <div className="Text PaddingTopS PaddingBottomS PaddingLeftM PaddingRightM">
            <div>
              <strong className="FontSizeM">
                {t('wallet.missingBlockchainSupport.subtitle')}
              </strong>
            </div>
            <div className="PaddingTopS">
              <strong className="FontSizeM">
                {t('wallet.missingBlockchainSupport.connectDifferent')}
              </strong>
            </div>
          </div>
          <div className="PaddingBottomM">
            {blockchains.map((blockchain) => {
              return (
                <div key={blockchain.name} className="Card tiny disabled inlineBlock MarginRightXS MarginBottomXS">
                  <img className={"BlockchainLogo small bottomRight " + blockchain.name} style={{ backgroundColor: blockchain.logoBackgroundColor }} src={blockchain.logo} alt={blockchain.label} title={blockchain.label} />
                  <span className="PaddingLeftXS ResponsiveText FontWeightLight">{blockchain.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      }
      footer={
        <div className="PaddingTopXS PaddingRightM PaddingLeftM PaddingBottomM">
          <button className="ButtonPrimary" onClick={() => props.disconnect()}>
            {t('wallet.connectAnother')}
          </button>
        </div>
      }
    />
  )
}
