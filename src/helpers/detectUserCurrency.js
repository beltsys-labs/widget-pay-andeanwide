import SUPPORTED_CURRENCIES from './supportedCurrencies'

// Mapeo completo de códigos de país ISO 3166-1 alpha-2 a monedas
// Cubre todos los 170 países/monedas soportados
const countryToCurrency = {
    // Europa
    'AD': 'EUR', 'AL': 'ALL', 'AT': 'EUR', 'AX': 'EUR', 'BA': 'BAM', 'BE': 'EUR',
    'BG': 'BGN', 'BY': 'BYN', 'CH': 'CHF', 'CY': 'EUR', 'CZ': 'CZK', 'DE': 'EUR',
    'DK': 'DKK', 'EE': 'EUR', 'ES': 'EUR', 'FI': 'EUR', 'FO': 'DKK', 'FR': 'EUR',
    'GB': 'GBP', 'GG': 'GBP', 'GI': 'GIP', 'GR': 'EUR', 'HR': 'EUR', 'HU': 'HUF',
    'IE': 'EUR', 'IM': 'GBP', 'IS': 'ISK', 'IT': 'EUR', 'JE': 'GBP', 'LI': 'CHF',
    'LT': 'EUR', 'LU': 'EUR', 'LV': 'EUR', 'MC': 'EUR', 'MD': 'MDL', 'ME': 'EUR',
    'MK': 'MKD', 'MT': 'EUR', 'NL': 'EUR', 'NO': 'NOK', 'PL': 'PLN', 'PT': 'EUR',
    'RO': 'RON', 'RS': 'RSD', 'RU': 'RUB', 'SE': 'SEK', 'SI': 'EUR', 'SK': 'EUR',
    'SM': 'EUR', 'UA': 'UAH', 'VA': 'EUR', 'XK': 'EUR',

    // América del Norte
    'US': 'USD', 'CA': 'CAD', 'MX': 'MXN', 'BZ': 'BZD', 'CR': 'CRC', 'GT': 'GTQ',
    'HN': 'HNL', 'NI': 'NIO', 'PA': 'PAB', 'SV': 'SVC',

    // Caribe
    'AG': 'XCD', 'AW': 'AWG', 'BB': 'BBD', 'BM': 'BMD', 'BS': 'BSD', 'CU': 'CUP',
    'CW': 'ANG', 'DM': 'XCD', 'DO': 'DOP', 'GD': 'XCD', 'HT': 'HTG', 'JM': 'JMD',
    'KN': 'XCD', 'KY': 'KYD', 'LC': 'XCD', 'MS': 'XCD', 'PR': 'USD', 'TC': 'USD',
    'TT': 'TTD', 'VC': 'XCD', 'VG': 'USD', 'VI': 'USD',

    // América del Sur
    'AR': 'ARS', 'BO': 'BOB', 'BR': 'BRL', 'CL': 'CLP', 'CO': 'COP', 'EC': 'USD',
    'FK': 'FKP', 'GF': 'EUR', 'GY': 'GYD', 'PE': 'PEN', 'PY': 'PYG', 'SR': 'SRD',
    'UY': 'UYU', 'VE': 'VES',

    // África
    'AE': 'AED', 'AF': 'AFN', 'AO': 'AOA', 'BF': 'XOF', 'BI': 'BIF', 'BJ': 'XOF',
    'BW': 'BWP', 'CD': 'CDF', 'CF': 'XAF', 'CG': 'XAF', 'CI': 'XOF', 'CM': 'XAF',
    'CV': 'CVE', 'DJ': 'DJF', 'DZ': 'DZD', 'EG': 'EGP', 'EH': 'MAD', 'ER': 'ERN',
    'ET': 'ETB', 'GA': 'XAF', 'GH': 'GHS', 'GM': 'GMD', 'GN': 'GNF', 'GW': 'XOF',
    'KE': 'KES', 'KM': 'KMF', 'LR': 'LRD', 'LS': 'LSL', 'LY': 'LYD', 'MA': 'MAD',
    'MG': 'MGA', 'ML': 'XOF', 'MR': 'MRU', 'MU': 'MUR', 'MW': 'MWK', 'MZ': 'MZN',
    'NA': 'NAD', 'NE': 'XOF', 'NG': 'NGN', 'RW': 'RWF', 'SC': 'SCR', 'SD': 'SDG',
    'SL': 'SLE', 'SN': 'XOF', 'SO': 'SOS', 'SS': 'SSP', 'ST': 'STN', 'SZ': 'SZL',
    'TD': 'XAF', 'TG': 'XOF', 'TN': 'TND', 'TZ': 'TZS', 'UG': 'UGX', 'ZA': 'ZAR',
    'ZM': 'ZMW', 'ZW': 'ZWL',

    // Asia
    'AM': 'AMD', 'AZ': 'AZN', 'BD': 'BDT', 'BH': 'BHD', 'BN': 'BND', 'BT': 'BTN',
    'CN': 'CNY', 'GE': 'GEL', 'HK': 'HKD', 'ID': 'IDR', 'IL': 'ILS',
    'IN': 'INR', 'IQ': 'IQD', 'IR': 'IRR', 'JO': 'JOD', 'JP': 'JPY', 'KG': 'KGS',
    'KH': 'KHR', 'KP': 'KPW', 'KR': 'KRW', 'KW': 'KWD', 'KZ': 'KZT', 'LA': 'LAK',
    'LB': 'LBP', 'LK': 'LKR', 'MM': 'MMK', 'MN': 'MNT', 'MO': 'MOP', 'MV': 'MVR',
    'MY': 'MYR', 'NP': 'NPR', 'OM': 'OMR', 'PH': 'PHP', 'PK': 'PKR', 'PS': 'ILS',
    'QA': 'QAR', 'SA': 'SAR', 'SG': 'SGD', 'SY': 'SYP', 'TH': 'THB', 'TJ': 'TJS',
    'TM': 'TMT', 'TR': 'TRY', 'TW': 'TWD', 'UZ': 'UZS', 'VN': 'VND', 'YE': 'YER',

    // Oceanía
    'AS': 'USD', 'AU': 'AUD', 'CK': 'NZD', 'FJ': 'FJD', 'FM': 'USD', 'GU': 'USD',
    'KI': 'AUD', 'MH': 'USD', 'MP': 'USD', 'NC': 'XPF', 'NF': 'AUD', 'NR': 'AUD',
    'NU': 'NZD', 'NZ': 'NZD', 'PF': 'XPF', 'PG': 'PGK', 'PN': 'NZD', 'PW': 'USD',
    'SB': 'SBD', 'TK': 'NZD', 'TO': 'TOP', 'TV': 'AUD', 'VU': 'VUV', 'WF': 'XPF',
    'WS': 'WST',

    // Territorios y otros
    'AQ': 'EUR', 'BL': 'EUR', 'BQ': 'USD', 'BV': 'NOK', 'CC': 'AUD', 'CX': 'AUD',
    'GP': 'EUR', 'GS': 'GBP', 'HM': 'AUD', 'IO': 'USD', 'MF': 'EUR', 'MQ': 'EUR',
    'PM': 'EUR', 'RE': 'EUR', 'SH': 'SHP', 'SJ': 'NOK', 'SX': 'ANG', 'TF': 'EUR',
    'TL': 'USD', 'UM': 'USD', 'YT': 'EUR'
}

/**
 * Detecta la moneda del usuario basándose en su configuración regional del navegador
 * @returns {string|null} Código de moneda en minúsculas (ej: 'usd', 'eur', 'ves') o null si no se puede detectar
 */
export default () => {
    try {
        // Obtener la configuración regional del usuario
        const locale = navigator.language || navigator.userLanguage || 'en-US'
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

        const localeParts = locale.split('-')
        const countryCode = localeParts[1]?.toUpperCase()
        const languageCode = localeParts[0]?.toLowerCase()

        // Mapeo de timezones a códigos de país (para usar con locale-currency)
        const timeZoneToCountry = {
            'Europe/Madrid': 'ES', 'Europe/Paris': 'FR', 'Europe/Berlin': 'DE',
            'Europe/Rome': 'IT', 'Europe/Amsterdam': 'NL', 'Europe/Brussels': 'BE',
            'Europe/Vienna': 'AT', 'Europe/Lisbon': 'PT', 'Europe/Dublin': 'IE',
            'Europe/Athens': 'GR', 'Europe/Helsinki': 'FI', 'Europe/Stockholm': 'SE',
            'Europe/Oslo': 'NO', 'Europe/Copenhagen': 'DK', 'Europe/Warsaw': 'PL',
            'Europe/Prague': 'CZ', 'Europe/Budapest': 'HU', 'Europe/Bucharest': 'RO',
            'Europe/Sofia': 'BG', 'Europe/Zagreb': 'HR', 'Europe/Belgrade': 'RS',
            'America/New_York': 'US', 'America/Chicago': 'US', 'America/Denver': 'US',
            'America/Los_Angeles': 'US', 'America/Toronto': 'CA', 'America/Mexico_City': 'MX',
            'America/Sao_Paulo': 'BR', 'America/Buenos_Aires': 'AR', 'America/Bogota': 'CO',
            'America/Santiago': 'CL', 'America/Lima': 'PE', 'America/Caracas': 'VE',
            'Asia/Tokyo': 'JP', 'Asia/Shanghai': 'CN', 'Asia/Seoul': 'KR',
            'Asia/Hong_Kong': 'HK', 'Asia/Singapore': 'SG', 'Asia/Bangkok': 'TH',
            'Asia/Jakarta': 'ID', 'Asia/Manila': 'PH', 'Asia/Kuala_Lumpur': 'MY',
            'Asia/Dubai': 'AE', 'Asia/Riyadh': 'SA', 'Asia/Tel_Aviv': 'IL',
            'Asia/Kolkata': 'IN', 'Australia/Sydney': 'AU', 'Australia/Melbourne': 'AU',
            'Pacific/Auckland': 'NZ'
        }

        // Mapeo de idiomas a códigos de país (fallback cuando no hay código de país en el locale)
        const languageToCountry = {
            'es': 'ES', // Español -> España (EUR)
            'en': 'US', // Inglés -> Estados Unidos (USD)
            'fr': 'FR', // Francés -> Francia (EUR)
            'de': 'DE', // Alemán -> Alemania (EUR)
            'it': 'IT', // Italiano -> Italia (EUR)
            'pt': 'BR', // Portugués -> Brasil (BRL)
            'nl': 'NL', // Holandés -> Países Bajos (EUR)
            'pl': 'PL', // Polaco -> Polonia (PLN)
            'ru': 'RU', // Ruso -> Rusia (RUB)
            'ja': 'JP', // Japonés -> Japón (JPY)
            'zh': 'CN', // Chino -> China (CNY)
            'ko': 'KR', // Coreano -> Corea del Sur (KRW)
            'ar': 'AE', // Árabe -> Emiratos Árabes Unidos (AED)
            'hi': 'IN', // Hindi -> India (INR)
            'tr': 'TR', // Turco -> Turquía (TRY)
            'th': 'TH', // Tailandés -> Tailandia (THB)
            'vi': 'VN', // Vietnamita -> Vietnam (VND)
            'id': 'ID', // Indonesio -> Indonesia (IDR)
            'ms': 'MY', // Malayo -> Malasia (MYR)
            'cs': 'CZ', // Checo -> República Checa (CZK)
            'sk': 'SK', // Eslovaco -> Eslovaquia (EUR)
            'hu': 'HU', // Húngaro -> Hungría (HUF)
            'ro': 'RO', // Rumano -> Rumania (RON)
            'bg': 'BG', // Búlgaro -> Bulgaria (BGN)
            'el': 'GR', // Griego -> Grecia (EUR)
            'sv': 'SE', // Sueco -> Suecia (SEK)
            'no': 'NO', // Noruego -> Noruega (NOK)
            'da': 'DK', // Danés -> Dinamarca (DKK)
            'fi': 'FI', // Finlandés -> Finlandia (EUR)
            'he': 'IL', // Hebreo -> Israel (ILS)
            'uk': 'UA' // Ucraniano -> Ucrania (UAH)
        }

        let currencyCode = null

        // Método 1: Usar el código de país del locale (ej: 'es-ES' -> 'ES' -> 'EUR')
        if (countryCode && countryToCurrency[countryCode]) {
            currencyCode = countryToCurrency[countryCode].toLowerCase()
        }

        // Método 2: Si no se detectó, intentar desde el timezone
        if (!currencyCode && timeZone && timeZoneToCountry[timeZone]) {
            const countryFromTimezone = timeZoneToCountry[timeZone]
            if (countryToCurrency[countryFromTimezone]) {
                currencyCode = countryToCurrency[countryFromTimezone].toLowerCase()
            }
        }

        // Método 4: Si no se detectó, intentar extraer el país del timezone de manera más inteligente
        // Algunos timezones tienen el nombre del país en el formato (ej: 'America/Mexico_City' -> 'MX')
        if (!currencyCode && timeZone) {
            try {
                // Intentar extraer código de país del timezone (ej: 'America/Mexico_City' -> 'MX')
                const timezoneParts = timeZone.split('/')
                if (timezoneParts.length > 1) {
                    const location = timezoneParts[1].replace('_', ' ')
                    // Buscar si hay un mapeo conocido o intentar con locale-currency
                    // Nota: Esto es un fallback, ya que los timezones no siempre mapean directamente a países
                }
            } catch (e) {
                // Error extracting country from timezone
            }
        }

        // Método 3: Si no se detectó, intentar desde el idioma
        // Este es el último recurso, ya que un idioma puede corresponder a múltiples países con diferentes monedas
        if (!currencyCode && languageCode && languageToCountry[languageCode]) {
            const countryFromLanguage = languageToCountry[languageCode]
            if (countryToCurrency[countryFromLanguage]) {
                currencyCode = countryToCurrency[countryFromLanguage].toLowerCase()
            }
        }

        // Método 5: Si no se detectó, usar USD como fallback
        if (!currencyCode) {
            currencyCode = 'usd'
        }

        // Verificar que la moneda detectada esté en la lista de soportadas
        if (SUPPORTED_CURRENCIES.includes(currencyCode)) {
            return currencyCode
        }

        // Si la moneda detectada no está soportada, usar USD como fallback
        return 'usd'
    } catch (error) {
        // Fallback a USD si hay algún error
        return 'usd'
    }
}

