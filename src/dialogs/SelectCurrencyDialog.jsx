import ConfigurationContext from '../contexts/ConfigurationContext'
import Dialog from '../components/Dialog'
import React, { useContext, useState, useEffect, useRef } from 'react'
import SUPPORTED_CURRENCIES from '../helpers/supportedCurrencies'
import { NavigateStackContext } from '@depay/react-dialog-stack'
import { useTranslation } from '../providers/TranslationProvider'
import { Currency } from '@depay/local-currency'

// Mapeo de códigos de moneda a códigos de país para banderas
const CURRENCY_TO_COUNTRY_CODE = {
  'aed': 'ae', 'afn': 'af', 'all': 'al', 'amd': 'am', 'ang': 'cw',
  'aoa': 'ao', 'ars': 'ar', 'aud': 'au', 'awg': 'aw', 'azn': 'az',
  'bam': 'ba', 'bbd': 'bb', 'bdt': 'bd', 'bgn': 'bg', 'bhd': 'bh',
  'bif': 'bi', 'bmd': 'bm', 'bnd': 'bn', 'bob': 'bo', 'brl': 'br',
  'bsd': 'bs', 'btn': 'bt', 'bwp': 'bw', 'byn': 'by', 'bzd': 'bz',
  'cad': 'ca', 'cdf': 'cd', 'chf': 'ch', 'clf': 'cl', 'clp': 'cl',
  'cnh': 'cn', 'cny': 'cn', 'cop': 'co', 'crc': 'cr', 'cup': 'cu',
  'cve': 'cv', 'czk': 'cz', 'djf': 'dj', 'dkk': 'dk', 'dop': 'do',
  'dzd': 'dz', 'egp': 'eg', 'ern': 'er', 'etb': 'et', 'eur': 'eu',
  'fjd': 'fj', 'fkp': 'fk', 'fok': 'fo', 'gbp': 'gb', 'gel': 'ge',
  'ggp': 'gg', 'ghs': 'gh', 'gip': 'gi', 'gmd': 'gm', 'gnf': 'gn',
  'gtq': 'gt', 'gyd': 'gy', 'hkd': 'hk', 'hnl': 'hn', 'hrk': 'hr',
  'htg': 'ht', 'huf': 'hu', 'idr': 'id', 'ils': 'il', 'imp': 'im',
  'inr': 'in', 'iqd': 'iq', 'irr': 'ir', 'isk': 'is', 'jep': 'je',
  'jmd': 'jm', 'jod': 'jo', 'jpy': 'jp', 'kes': 'ke', 'kgs': 'kg',
  'khr': 'kh', 'kid': 'ki', 'kmf': 'km', 'krw': 'kr', 'kwd': 'kw',
  'kyd': 'ky', 'kzt': 'kz', 'lak': 'la', 'lbp': 'lb', 'lkr': 'lk',
  'lrd': 'lr', 'lsl': 'ls', 'lyd': 'ly', 'mad': 'ma', 'mdl': 'md',
  'mga': 'mg', 'mkd': 'mk', 'mmk': 'mm', 'mnt': 'mn', 'mop': 'mo',
  'mru': 'mr', 'mur': 'mu', 'mvr': 'mv', 'mwk': 'mw', 'mxn': 'mx',
  'myr': 'my', 'mzn': 'mz', 'nad': 'na', 'ngn': 'ng', 'nio': 'ni',
  'nok': 'no', 'npr': 'np', 'nzd': 'nz', 'omr': 'om', 'pab': 'pa',
  'pen': 'pe', 'pgk': 'pg', 'php': 'ph', 'pkr': 'pk', 'pln': 'pl',
  'pyg': 'py', 'qar': 'qa', 'ron': 'ro', 'rsd': 'rs', 'rub': 'ru',
  'rwf': 'rw', 'sar': 'sa', 'sbd': 'sb', 'scr': 'sc', 'sdg': 'sd',
  'sek': 'se', 'sgd': 'sg', 'shp': 'sh', 'sle': 'sl', 'sos': 'so',
  'srd': 'sr', 'ssp': 'ss', 'stn': 'st', 'syp': 'sy', 'szl': 'sz',
  'thb': 'th', 'tjs': 'tj', 'tmt': 'tm', 'tnd': 'tn', 'top': 'to',
  'try': 'tr', 'ttd': 'tt', 'tvd': 'tv', 'twd': 'tw', 'tzs': 'tz',
  'uah': 'ua', 'ugx': 'ug', 'usd': 'us', 'uyu': 'uy', 'uzs': 'uz',
  'ves': 've', 'vnd': 'vn', 'vuv': 'vu', 'wst': 'ws', 'xaf': 'cm',
  'xcd': 'ag', 'xdr': 'un', 'xof': 'sn', 'xpf': 'pf', 'yer': 'ye',
  'zar': 'za', 'zmw': 'zm', 'zwl': 'zw'
}

// Mapeo de códigos de moneda a nombres completos
const CURRENCY_NAMES = {
  'aed': 'UAE Dirham', 'afn': 'Afghan Afghani', 'all': 'Albanian Lek',
  'amd': 'Armenian Dram', 'ang': 'Netherlands Antillian Guilder', 'aoa': 'Angolan Kwanza',
  'ars': 'Argentine Peso', 'aud': 'Australian Dollar', 'awg': 'Aruban Florin',
  'azn': 'Azerbaijani Manat', 'bam': 'Bosnia and Herzegovina Mark', 'bbd': 'Barbados Dollar',
  'bdt': 'Bangladeshi Taka', 'bgn': 'Bulgarian Lev', 'bhd': 'Bahraini Dinar',
  'bif': 'Burundian Franc', 'bmd': 'Bermudian Dollar', 'bnd': 'Brunei Dollar',
  'bob': 'Bolivian Boliviano', 'brl': 'Brazilian Real', 'bsd': 'Bahamian Dollar',
  'btn': 'Bhutanese Ngultrum', 'bwp': 'Botswana Pula', 'byn': 'Belarusian Ruble',
  'bzd': 'Belize Dollar', 'cad': 'Canadian Dollar', 'cdf': 'Congolese Franc',
  'chf': 'Swiss Franc', 'clf': 'Chilean Unidad de Fomento', 'clp': 'Chilean Peso',
  'cnh': 'Offshore Chinese Renminbi', 'cny': 'Chinese Renminbi', 'cop': 'Colombian Peso',
  'crc': 'Costa Rican Colon', 'cup': 'Cuban Peso', 'cve': 'Cape Verdean Escudo',
  'czk': 'Czech Koruna', 'djf': 'Djiboutian Franc', 'dkk': 'Danish Krone',
  'dop': 'Dominican Peso', 'dzd': 'Algerian Dinar', 'egp': 'Egyptian Pound',
  'ern': 'Eritrean Nakfa', 'etb': 'Ethiopian Birr', 'eur': 'Euro',
  'fjd': 'Fiji Dollar', 'fkp': 'Falkland Islands Pound', 'fok': 'Faroese Króna',
  'gbp': 'Pound Sterling', 'gel': 'Georgian Lari', 'ggp': 'Guernsey Pound',
  'ghs': 'Ghanaian Cedi', 'gip': 'Gibraltar Pound', 'gmd': 'Gambian Dalasi',
  'gnf': 'Guinean Franc', 'gtq': 'Guatemalan Quetzal', 'gyd': 'Guyanese Dollar',
  'hkd': 'Hong Kong Dollar', 'hnl': 'Honduran Lempira', 'hrk': 'Croatian Kuna',
  'htg': 'Haitian Gourde', 'huf': 'Hungarian Forint', 'idr': 'Indonesian Rupiah',
  'ils': 'Israeli New Shekel', 'imp': 'Manx Pound', 'inr': 'Indian Rupee',
  'iqd': 'Iraqi Dinar', 'irr': 'Iranian Rial', 'isk': 'Icelandic Króna',
  'jep': 'Jersey Pound', 'jmd': 'Jamaican Dollar', 'jod': 'Jordanian Dinar',
  'jpy': 'Japanese Yen', 'kes': 'Kenyan Shilling', 'kgs': 'Kyrgyzstani Som',
  'khr': 'Cambodian Riel', 'kid': 'Kiribati Dollar', 'kmf': 'Comorian Franc',
  'krw': 'South Korean Won', 'kwd': 'Kuwaiti Dinar', 'kyd': 'Cayman Islands Dollar',
  'kzt': 'Kazakhstani Tenge', 'lak': 'Lao Kip', 'lbp': 'Lebanese Pound',
  'lkr': 'Sri Lanka Rupee', 'lrd': 'Liberian Dollar', 'lsl': 'Lesotho Loti',
  'lyd': 'Libyan Dinar', 'mad': 'Moroccan Dirham', 'mdl': 'Moldovan Leu',
  'mga': 'Malagasy Ariary', 'mkd': 'Macedonian Denar', 'mmk': 'Burmese Kyat',
  'mnt': 'Mongolian Tögrög', 'mop': 'Macanese Pataca', 'mru': 'Mauritanian Ouguiya',
  'mur': 'Mauritian Rupee', 'mvr': 'Maldivian Rufiyaa', 'mwk': 'Malawian Kwacha',
  'mxn': 'Mexican Peso', 'myr': 'Malaysian Ringgit', 'mzn': 'Mozambican Metical',
  'nad': 'Namibian Dollar', 'ngn': 'Nigerian Naira', 'nio': 'Nicaraguan Córdoba',
  'nok': 'Norwegian Krone', 'npr': 'Nepalese Rupee', 'nzd': 'New Zealand Dollar',
  'omr': 'Omani Rial', 'pab': 'Panamanian Balboa', 'pen': 'Peruvian Sol',
  'pgk': 'Papua New Guinean Kina', 'php': 'Philippine Peso', 'pkr': 'Pakistani Rupee',
  'pln': 'Polish Złoty', 'pyg': 'Paraguayan Guaraní', 'qar': 'Qatari Riyal',
  'ron': 'Romanian Leu', 'rsd': 'Serbian Dinar', 'rub': 'Russian Ruble',
  'rwf': 'Rwandan Franc', 'sar': 'Saudi Riyal', 'sbd': 'Solomon Islands Dollar',
  'scr': 'Seychellois Rupee', 'sdg': 'Sudanese Pound', 'sek': 'Swedish Krona',
  'sgd': 'Singapore Dollar', 'shp': 'Saint Helena Pound', 'sle': 'Sierra Leonean Leone',
  'sos': 'Somali Shilling', 'srd': 'Surinamese Dollar', 'ssp': 'South Sudanese Pound',
  'stn': 'São Tomé and Príncipe Dobra', 'syp': 'Syrian Pound', 'szl': 'Eswatini Lilangeni',
  'thb': 'Thai Baht', 'tjs': 'Tajikistani Somoni', 'tmt': 'Turkmenistan Manat',
  'tnd': 'Tunisian Dinar', 'top': 'Tongan Paʻanga', 'try': 'Turkish Lira',
  'ttd': 'Trinidad and Tobago Dollar', 'tvd': 'Tuvaluan Dollar', 'twd': 'New Taiwan Dollar',
  'tzs': 'Tanzanian Shilling', 'uah': 'Ukrainian Hryvnia', 'ugx': 'Ugandan Shilling',
  'usd': 'United States Dollar', 'uyu': 'Uruguayan Peso', 'uzs': 'Uzbekistani So\'m',
  'ves': 'Venezuelan Bolívar Soberano', 'vnd': 'Vietnamese Đồng', 'vuv': 'Vanuatu Vatu',
  'wst': 'Samoan Tālā', 'xaf': 'Central African CFA Franc', 'xcd': 'East Caribbean Dollar',
  'xdr': 'Special Drawing Rights', 'xof': 'West African CFA franc', 'xpf': 'CFP Franc',
  'yer': 'Yemeni Rial', 'zar': 'South African Rand', 'zmw': 'Zambian Kwacha',
  'zwl': 'Zimbabwean Dollar'
}

// Mapeo de códigos de moneda a símbolos
const CURRENCY_SYMBOLS = {
  'usd': '$', 'eur': '€', 'gbp': '£', 'ves': 'Bs', 'cop': '$',
  'ars': '$', 'mxn': '$', 'pen': 'S/', 'brl': 'R$', 'clp': '$',
  'jpy': '¥', 'cny': '¥', 'inr': '₹', 'krw': '₩', 'thb': '฿',
  'rub': '₽', 'try': '₺', 'zar': 'R', 'aud': 'A$', 'nzd': 'NZ$',
  'cad': 'C$', 'chf': 'CHF', 'sek': 'kr', 'nok': 'kr', 'dkk': 'kr',
  'pln': 'zł', 'huf': 'Ft', 'czk': 'Kč', 'ron': 'lei', 'bgn': 'лв',
  'ils': '₪', 'aed': 'د.إ', 'sar': '﷼', 'qar': '﷼', 'kwd': 'د.ك',
  'bhd': '.د.ب', 'omr': '﷼', 'jod': 'د.ا', 'lbp': '£', 'egp': '£',
  'ngn': '₦', 'kes': 'KSh', 'ghs': '₵', 'zmw': 'ZK', 'ugx': 'USh',
  'tzs': 'TSh', 'etb': 'Br', 'mad': 'د.م.', 'tnd': 'د.ت', 'dzd': 'د.ج',
  'xof': 'CFA', 'xaf': 'FCFA', 'xpf': 'F'
}

export default (props) => {
  const { navigate } = useContext(NavigateStackContext)
  const { currency: currentCurrency, setCurrency } = useContext(ConfigurationContext)
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredCurrencies, setFilteredCurrencies] = useState(SUPPORTED_CURRENCIES)
  const searchElement = useRef()

  // Filtrar monedas basándose en el término de búsqueda
  useEffect(() => {
    if (!searchTerm) {
      setFilteredCurrencies(SUPPORTED_CURRENCIES)
    } else {
      const term = searchTerm.toLowerCase()
      setFilteredCurrencies(
        SUPPORTED_CURRENCIES.filter(code => {
          const codeLower = code.toLowerCase()
          const name = CURRENCY_NAMES[code]?.toLowerCase() || ''
          const symbol = CURRENCY_SYMBOLS[code] || ''
          // Buscar por código (case-insensitive), nombre o símbolo
          return codeLower.includes(term) || name.includes(term) || symbol.includes(searchTerm)
        })
      )
    }
  }, [searchTerm])

  // Enfocar el campo de búsqueda al montar
  useEffect(() => {
    setTimeout(() => {
      if (searchElement.current) {
        searchElement.current.focus()
      }
    }, 200)
  }, [])

  const selectCurrency = (currencyCode) => {
    if (setCurrency) {
      setCurrency(currencyCode)
    }
    navigate('back')
  }

  return (
    <Dialog
      stacked={true}
      header={
        <div className="PaddingTopS PaddingLeftM PaddingRightM PaddingBottomXS">
          <h1 className="LineHeightL FontSizeL TextCenter">{t('currency.select') || 'Select Currency'}</h1>
          <div className="PaddingTopS PaddingBottomXS">
            <input
              type="text"
              ref={searchElement}
              className="Search"
              placeholder={t('currency.search') || 'Search currency...'}
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>
        </div>
      }
      body={
        <div className="DialogBody ScrollHeightL PaddingTopXS PaddingBottomS" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <div className="PaddingLeftM PaddingRightM">
            {filteredCurrencies.length > 0 ? filteredCurrencies.map((currencyCode) => {
              const isSelected = currentCurrency?.toLowerCase() === currencyCode.toLowerCase()
              const currencyName = CURRENCY_NAMES[currencyCode] || currencyCode.toUpperCase()
              const countryCode = CURRENCY_TO_COUNTRY_CODE[currencyCode.toLowerCase()]
              
              return (
                <button
                  key={currencyCode}
                  type="button"
                  className={`Card ${isSelected ? 'selected' : ''}`}
                  title={`Select ${currencyCode.toUpperCase()}`}
                  onClick={() => selectCurrency(currencyCode)}
                >
                  <div className="CardBody">
                    <div className="CardBodyWrapper">
                      <div className="CardText">
                        <div className="TokenAmountRow" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {countryCode ? (
                            <img 
                              src={`https://flagcdn.com/w20/${countryCode}.png`}
                              alt=""
                              style={{ width: '20px', height: '15px', objectFit: 'cover', borderRadius: '2px' }}
                              onError={(e) => {
                                e.target.style.display = 'none'
                              }}
                            />
                          ) : (
                            <span style={{ width: '20px', display: 'inline-block' }}></span>
                          )}
                          <span className="TokenSymbolCell" style={{ fontWeight: 'bold' }}>
                            {currencyCode.toUpperCase()}
                          </span>
                          <span>&nbsp;</span>
                          <span className="TokenAmountCell">
                            {currencyName}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="CardAction">
                      <span style={{ color: 'var(--primary-color, #0080FF)' }}>✓</span>
                    </div>
                  )}
                </button>
              )
            }) : (
              <div className="TextCenter Opacity05 PaddingTopS PaddingBottomS">
                <strong>{t('currency.noneFound') || 'No currencies found'}</strong>
              </div>
            )}
          </div>
        </div>
      }
      footer={false}
    />
  )
}

