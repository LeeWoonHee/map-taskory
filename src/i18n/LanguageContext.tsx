import { createContext, useContext, useState, useMemo, useCallback, type ReactNode } from 'react'
import { translations, type Language, type Translations } from './translations'

interface LanguageContextValue {
  lang: Language
  setLang: (lang: Language) => void
  t: Translations
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'ko',
  setLang: () => {},
  t: translations.ko,
})

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    if (typeof window === 'undefined') return 'ko'
    const stored = localStorage.getItem('bts-lang') as Language | null
    return stored && ['ko', 'en', 'ja', 'zh'].includes(stored) ? stored : 'ko'
  })

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang)
    if (typeof window !== 'undefined') {
      localStorage.setItem('bts-lang', newLang)
    }
  }, [])

  const value = useMemo<LanguageContextValue>(
    () => ({ lang, setLang, t: translations[lang] as Translations }),
    [lang, setLang],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export const useLanguage = () => useContext(LanguageContext)
