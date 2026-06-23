import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en'
import zh from './locales/zh'
import ms from './locales/ms'
import th from './locales/th'
import vi from './locales/vi'
import id from './locales/id'
import hi from './locales/hi'

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    zh: { translation: zh },
    ms: { translation: ms },
    th: { translation: th },
    vi: { translation: vi },
    id: { translation: id },
    hi: { translation: hi },
  },
  lng: localStorage.getItem('lang') || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n
