import { createContext, useContext, useState, type ReactNode } from 'react';

export type Lang = 'id' | 'en';

interface LangContextValue {
  lang: Lang;
  toggle: () => void;
  t: (id: string, en: string) => string;
}

const LangContext = createContext<LangContextValue>({
  lang: 'id',
  toggle: () => {},
  t: (id) => id,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('id');
  const toggle = () => setLang((l) => (l === 'id' ? 'en' : 'id'));
  const t = (id: string, en: string) => (lang === 'id' ? id : en);
  return <LangContext.Provider value={{ lang, toggle, t }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}
