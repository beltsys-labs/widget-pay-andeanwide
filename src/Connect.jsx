import ClosableProvider from './providers/ClosableProvider'
import ConnectStack from './stacks/ConnectStack'
import ensureDocument from './helpers/ensureDocument'
import ErrorProvider from './providers/ErrorProvider'
import mount from './helpers/mount'
import PoweredBy from './components/PoweredBy'
import React from 'react'
import requireReactVersion from './helpers/requireReactVersion'
import SelectionProvider from './providers/SelectionProvider'
import TranslationProvider from './providers/TranslationProvider'
import UpdatableProvider from './providers/UpdatableProvider'

let Connect = (options) => {
  requireReactVersion()
  let style, error, document, locale, translations, poweredBy, supportUrl
  if (typeof options == 'object') ({ style, error, document, locale, translations, poweredBy, supportUrl } = options)

  return new Promise(async (resolve, reject) => {

    let unmount = mount({ style, document: ensureDocument(document) }, (unmount) => {
      const rejectBeforeUnmount = () => {
        reject('USER_CLOSED_DIALOG')
        unmount()
      }
      return (container) =>
        <TranslationProvider locale={locale} translations={translations}>
          <ErrorProvider errorCallback={error} container={container} unmount={unmount}>
            <ConfigurationProvider configuration={{ poweredBy, supportUrl }}>
              <UpdatableProvider>
                <ClosableProvider unmount={rejectBeforeUnmount}>
                  <SelectionProvider>
                    <ConnectStack
                      document={document}
                      container={container}
                      resolve={resolve}
                      reject={reject}
                      autoClose={true}
                    />
                    <PoweredBy />
                  </SelectionProvider>
                </ClosableProvider>
              </UpdatableProvider>
            </ConfigurationProvider>
          </ErrorProvider>
        </TranslationProvider>
    })
  })
}

export default Connect
