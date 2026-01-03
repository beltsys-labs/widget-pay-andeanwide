import React, { createContext, useContext, useMemo } from 'react'
import defaultLocales from '../helpers/locales'

const TranslationContext = createContext()

export const useTranslation = () => {
    const context = useContext(TranslationContext)
    if (!context) {
        throw new Error('useTranslation must be used within a TranslationProvider')
    }
    return context
}

export const TranslationProvider = ({ children, locale = 'en', translations = {} }) => {

    const t = useMemo(() => (key, params = {}) => {
        let translation = null
        
        // 1. Check user provided translations for the specific locale
        if (translations[locale] && translations[locale][key]) {
            translation = translations[locale][key]
        }
        // 2. Check default translations for the specific locale
        else if (defaultLocales[locale] && defaultLocales[locale][key]) {
            translation = defaultLocales[locale][key]
        }
        // 3. Fallback to English user provided
        else if (translations['en'] && translations['en'][key]) {
            translation = translations['en'][key]
        }
        // 4. Fallback to English default
        else if (defaultLocales['en'][key]) {
            translation = defaultLocales['en'][key]
        }
        // 5. Return key as last resort
        else {
            return key
        }
        
        // Interpolate parameters if provided
        if (translation && params && Object.keys(params).length > 0) {
            return translation.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
                return params[paramKey] !== undefined ? params[paramKey] : match
            })
        }
        
        return translation
    }, [locale, translations])

    return (
        <TranslationContext.Provider value={{ t, locale }}>
            {children}
        </TranslationContext.Provider>
    )
}

export default TranslationProvider
