import { useRouter } from 'next/router'
import { useState } from 'react'
import Image from 'next/image'

const locales = [
  { code: 'en', label: 'English', flag: '/icons/usa.svg' },
  { code: 'pt', label: 'Português', flag: '/icons/brazil.svg' },
]

export default function LanguageSwitcher() {
  const router = useRouter()
  const { locale, asPath } = router
  const [open, setOpen] = useState(false)

  const currentLocale = locales.find((l) => l.code === locale) || locales[0]

  const changeLanguage = (lng: 'en' | 'pt') => {
    setOpen(false)
    router.push(asPath, asPath, { locale: lng })
  }

  return (
    <div
    style={{
      position: 'fixed',
      top: '20px',
      right: '80px',
      zIndex: 9999,
    }}
  >
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <Image src={currentLocale.flag} alt={currentLocale.label} width={24} height={24} />
        <span style={{ marginLeft: 6 }}>▼</span>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '120%',
            right: 0,
            background: '#222',
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            padding: 8,
            zIndex: 100,
            minWidth: 140,
          }}
        >
          {locales.map((lng) => (
            <div
              key={lng.code}
              onClick={() => changeLanguage(lng.code as 'en' | 'pt')}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '6px 10px',
                color: '#fff',
                cursor: 'pointer',
                borderRadius: 6,
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#333')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <Image src={lng.flag} alt={lng.label} width={20} height={20} />
              <span style={{ marginLeft: 10 }}>{lng.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
