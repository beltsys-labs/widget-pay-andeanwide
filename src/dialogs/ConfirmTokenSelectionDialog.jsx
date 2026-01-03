/*#if _EVM

import { TokenImage } from '@depay/react-token-image-evm'

/*#elif _SVM

import { TokenImage } from '@depay/react-token-image-svm'

//#else */

import { TokenImage } from '@depay/react-token-image'

//#endif

import addressEllipsis from '../helpers/addressEllipsis'
import Blockchains from '@depay/web3-blockchains'
import ClosableContext from '../contexts/ClosableContext'
import Dialog from '../components/Dialog'
import msToTime from '../helpers/msToTime'
import React, { useState, useContext } from 'react'
import SelectionContext from '../contexts/SelectionContext'
import { useTranslation } from '../providers/TranslationProvider'

export default (props) => {

  const { selection } = useContext(SelectionContext)
  const { setOpen } = useContext(ClosableContext)
  const token = selection.token
  const address = token.address || token.external_id
  const logo = token.logo || token.image
  const blockchain = Blockchains.findByName(token.blockchain)
  const { t } = useTranslation()

  let age = token.first_transfer ? msToTime(new Date() - new Date(token.first_transfer)) : undefined
  if (age) {
    age = [
      ((age.year && age.year >= 1) ? (age.year >= 2 ? t('time.years', { count: age.year }) : t('time.year')) : undefined),
      ((age.month && age.month >= 1) ? (age.month >= 2 ? t('time.months', { count: age.month }) : t('time.month')) : undefined),
      ((age.day && age.day >= 1 && age.month <= 1 && age.year < 1) ? (age.day >= 2 ? t('time.days', { count: age.day }) : t('time.day')) : undefined)
    ].filter(n => n).join(' ')
  }

  let holders = token.unique_senders ? token.unique_senders : undefined
  if (holders) {
    if (holders > 1000000) {
      holders = t("holders.millions")
    } else if (holders > 100000) {
      holders = t("holders.hundredsThousands")
    } else if (holders > 2000) {
      holders = t("holders.thousands")
    } else if (holders > 100) {
      holders = t("holders.hundreds")
    } else {
      holders = t("holders.few")
    }
  }

  const onClickConfirm = () => {
    setOpen(false)
    props.resolve({
      blockchain: token.blockchain,
      address: token.external_id || token.address,
      symbol: token.symbol,
      name: token.name,
      decimals: token.decimals,
      logo: token.image || token.logo,
      routable: token.routable
    })
    setTimeout(props.unmount, 300)
  }

  return (
    <Dialog
      header={
        <div className="PaddingTopS PaddingLeftM PaddingRightM">
          <div>
            <h1 className="LineHeightL FontSizeL">{t('confirm.selection')}</h1>
          </div>
        </div>
      }
      stacked={true}
      body={
        <div className="PaddingTopS PaddingLeftM PaddingRightM">
          <div className="TokenImage medium TextCenter">
            {logo && <img src={logo} />}
            {!logo && <TokenImage blockchain={token.blockchain} address={address} />}
          </div>
          <div className="PaddingTopS TextCenter">
            <div className="Alert FontSizeS">
              <strong>{t('confirm.review')}</strong>
            </div>
          </div>
          <div className="PaddingTopXS">
            <table className="Table TextLeft FontSizeS">
              <tbody>
                <tr>
                  <td>
                    <div className='TableSubTitle'>{t('confirm.address')}</div>
                  </td>
                  <td>
                    <div>
                      <a className="Link" title={address} href={blockchain.explorerUrlFor({ token: address })} target="_blank" rel="noopener noreferrer">
                        {addressEllipsis(address, 8)}
                      </a>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className='TableSubTitle'>{t('confirm.blockchain')}</div>
                  </td>
                  <td>
                    <div>{blockchain.label}</div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className='TableSubTitle'>{t('confirm.symbol')}</div>
                  </td>
                  <td>
                    <div>{token.symbol}</div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className='TableSubTitle'>{t('confirm.name')}</div>
                  </td>
                  <td>
                    <div>{token.name}</div>
                  </td>
                </tr>
                {age &&
                  <tr>
                    <td>
                      <div className='TableSubTitle'>{t('confirm.age')}</div>
                    </td>
                    <td>
                      <div>{age}</div>
                    </td>
                  </tr>
                }
                {holders &&
                  <tr>
                    <td>
                      <div className='TableSubTitle'>{t('confirm.holders')}</div>
                    </td>
                    <td>
                      <div>{holders}</div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
      footer={
        <div className="PaddingTopS PaddingRightM PaddingLeftM PaddingBottomS">
          <button className='ButtonPrimary' onClick={onClickConfirm}>
            {t('confirm.button')}
          </button>
        </div>
      }
    />
  )
}
