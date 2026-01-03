import ChevronLeftIcon from '../icons/ChevronLeftIcon'
import ClosableContext from '../contexts/ClosableContext'
import CloseIcon from '../icons/CloseIcon'
import React, { useContext } from 'react'
import { NavigateStackContext } from '@depay/react-dialog-stack'
import { useTranslation } from '../providers/TranslationProvider'

export default (props) => {

  const { navigate } = useContext(NavigateStackContext)
  const { close, closable } = useContext(ClosableContext)
  const { t } = useTranslation()

  return (
    <div className={["Dialog", props.className].join(' ')}>

      <div className={["DialogHeader", props.stacked ? 'TextCenter' : ''].join(' ')}>
        {props.stacked &&
          <div className="DialogHeaderActionLeft PaddingTopS PaddingLeftS PaddingRightS">
            <button type="button" onClick={() => navigate('back')} className="ButtonCircular" title={t('dialog.goBack')}>
              <ChevronLeftIcon />
            </button>
          </div>
        }
        {closable && props.closable !== false &&
          <div className="DialogHeaderActionRight PaddingTopS PaddingLeftS PaddingRightS">
            {props.alternativeHeaderAction}
            <button type="button" onClick={close} className="ButtonCircular" title={t('dialog.close')}>
              <CloseIcon />
            </button>
          </div>
        }
        {props.header}
      </div>

      <div ref={props.bodyRef} className={["DialogBody", props.bodyClassName].join(' ')}>
        {props.body}
      </div>

      {props.footer !== false &&
        <div className="DialogFooter">
          {props.footer}
        </div>
      }
    </div>
  )
}
