import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Language = 'ar' | 'en'

interface LanguageState {
  language: Language
  setLanguage: (lang: Language) => void
  toggleLanguage: () => void
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'ar',
      setLanguage: (language: Language) => {
        if (typeof document !== 'undefined') {
          document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
          document.documentElement.lang = language
        }
        set({ language })
      },
      toggleLanguage: () => {
        set((state) => {
          const nextLang: Language = state.language === 'ar' ? 'en' : 'ar'
          if (typeof document !== 'undefined') {
            document.documentElement.dir = nextLang === 'ar' ? 'rtl' : 'ltr'
            document.documentElement.lang = nextLang
          }
          return { language: nextLang }
        })
      },
    }),
    {
      name: 'ninja-burger-language',
    }
  )
)
