import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import LanguageSwitcher from '../components/LanguageSwitcher'
import ContactModal from '../components/ContactModal'

const PLANS = ['starter', 'pro', 'enterprise'] as const
const TOKEN_PACKS = ['small', 'medium', 'large'] as const

export default function HomePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [showContact, setShowContact] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur border-b border-gray-100 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold text-gray-900">AI Marketing OS</span>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-gray-900">{t('nav.features')}</a>
            <a href="#pricing" className="hover:text-gray-900">{t('nav.pricing')}</a>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <button onClick={() => navigate('/login')} className="text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-1.5">{t('nav.login')}</button>
            <button onClick={() => navigate('/login')} className="text-sm font-semibold bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">{t('nav.getStarted')}</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 text-center bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <span>🚀</span> AI-Powered Marketing Tools
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            {t('hero.title')}
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10">{t('hero.subtitle')}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button onClick={() => navigate('/login')} className="px-8 py-4 bg-blue-600 text-white text-lg font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200">
              {t('hero.cta')} →
            </button>
            <p className="text-sm text-gray-500">{t('hero.ctaSub')}</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">{t('features.title')}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { key: 'analysis', icon: '🔍', color: 'bg-blue-50 text-blue-600' },
              { key: 'copy', icon: '✍️', color: 'bg-purple-50 text-purple-600' },
              { key: 'landing', icon: '🖥️', color: 'bg-green-50 text-green-600' },
              { key: 'video', icon: '🎬', color: 'bg-orange-50 text-orange-600' },
            ].map(({ key, icon, color }) => (
              <div key={key} className="p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 ${color}`}>{icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{t(`features.${key}.title`)}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{t(`features.${key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-2">{t('pricing.title')}</h2>
          <p className="text-center text-gray-600 mb-12">{t('pricing.subtitle')}</p>
          <div className="grid md:grid-cols-3 gap-8">
            {PLANS.map(plan => {
              const p = t(`pricing.${plan}`, { returnObjects: true }) as Record<string, string>
              const isPro = plan === 'pro'
              const isEnterprise = plan === 'enterprise'
              return (
                <div key={plan} className={`relative bg-white rounded-2xl p-8 border-2 ${isPro ? 'border-blue-500 shadow-xl' : 'border-gray-100'}`}>
                  {isPro && p.badge && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full">{p.badge}</div>
                  )}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{p.name}</h3>
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-extrabold text-gray-900">{p.price}</span>
                      {!isEnterprise && <span className="text-gray-500 mb-1">{p.period}</span>}
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {['tokens', 'videos', 'files', 'support'].map(feature => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="text-green-500 font-bold">✓</span> {p[feature]}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => isEnterprise ? setShowContact(true) : navigate('/login')}
                    className={`w-full py-3 rounded-xl font-semibold text-sm ${isPro ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>
                    {isEnterprise ? p.cta : t('pricing.cta')}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Token Packs */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('tokens.title')}</h2>
          <p className="text-gray-600 mb-12">{t('tokens.subtitle')}</p>
          <div className="grid md:grid-cols-3 gap-6">
            {TOKEN_PACKS.map(pack => {
              const p = t(`tokens.${pack}`, { returnObjects: true }) as Record<string, string>
              return (
                <div key={pack} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-1">{p.name}</h3>
                  <div className="text-3xl font-extrabold text-blue-600 my-3">{p.price}</div>
                  <p className="text-sm text-gray-600 mb-6">{p.tokens}</p>
                  <button onClick={() => navigate('/login')} className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700">
                    {t('tokens.cta')}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-100 bg-gray-50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <span>{t('footer.rights')}</span>
          <span>{t('footer.contact')}: support@aimarketingos.com</span>
        </div>
      </footer>

      {showContact && <ContactModal onClose={() => setShowContact(false)} />}
    </div>
  )
}
