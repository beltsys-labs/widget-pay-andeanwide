import link from '../helpers/link'
import React, { useContext, useEffect } from 'react'
import WalletContext from '../contexts/WalletContext'
import ConfigurationContext from '../contexts/ConfigurationContext'
import { useTranslation } from '../providers/TranslationProvider'

export default () => {
  const walletContext = useContext(WalletContext)
  const configuration = useContext(ConfigurationContext)
  const { t, locale } = useTranslation()
  const wallet = walletContext ? walletContext.wallet : undefined

  if (configuration?.footer === false) { return null }

  // Prioritize configuration over translations
  const poweredByName = configuration?.poweredBy?.name || t('poweredBy.text')
  const poweredByUrl = configuration?.poweredBy?.url || t('poweredBy.link')
  
  // Construir el título dinámicamente según el idioma
  let poweredByTitle
  if (configuration?.poweredBy?.name) {
    // Si viene del payload, construir según el idioma
    const prefixes = {
      en: 'powered by',
      es: 'desarrollado por',
      fr: 'propulsé par',
      pt: 'desenvolvido por'
    }
    const prefix = prefixes[locale] || prefixes.en
    poweredByTitle = `${prefix} ${poweredByName}`
  } else {
    // Si no viene del payload, usar la traducción completa
    poweredByTitle = t('poweredBy.title')
  }

  return (
    <div className="PoweredByWrapper">
      <a href={link({ url: poweredByUrl, target: '_blank', wallet })} rel="noopener noreferrer" target="_blank" className="PoweredByLink" title={poweredByTitle}>{poweredByName}</a>
    </div>
  )
}
