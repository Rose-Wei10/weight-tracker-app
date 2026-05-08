import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

import { auth, db } from '../firebase';

export type Lang = 'en' | 'zh';

type LanguageContextType = {
  lang: Lang;
  setLang: (lang: Lang) => void;
};

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
});

export function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [lang, setLang] = useState<Lang>('en');

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) return;

      const ref = doc(db, 'users', user.uid);

      const unsubFirestore = onSnapshot(ref, (snap) => {
        if (!snap.exists()) return;

        const data = snap.data();

        if (data.language) {
          setLang(data.language);
        }
      });

      return unsubFirestore;
    });

    return unsubAuth;
  }, []);

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);