import { Sheet, SheetContent, SheetTitle, SheetTrigger } from './ui/sheet';
import { useTheme } from "./theme-provider"
import { MoonIcon, SunIcon, InstagramLogoIcon, ListIcon, GithubLogoIcon, GlobeIcon } from "@phosphor-icons/react"
import { locales, localeNames, type Locale } from "../i18n/locales";

type MenuProps = {
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  labels: { theme: string; language: string; sourceCode: string; title: string };
};

const Menu = ({ locale, onLocaleChange, labels }: MenuProps) => {
  const { setTheme, theme } = useTheme()
  return (
    <div>
      <Sheet>
        <SheetTrigger asChild>
          <button className="bg-white/15 dark:bg-white/10 backdrop-blur-md shadow-lg border border-white/20 m-6 rounded-2xl w-16 h-16 text-white transition-all hover:bg-white/25" aria-label="メニューを開く"><ListIcon className='mx-auto' size={24} /></button>
        </SheetTrigger>
        <SheetContent className="bg-black/30 dark:bg-zinc-950/30 border-l border-l-gray-600" side='right'>
          <SheetTitle className="shadow-xl mt-3 text-white text-xl text-center">{labels.title}</SheetTitle>
          <button className='flex bg-gray-900 dark:bg-zinc-950/80 shadow-xl mx-10 p-2 border border-zinc-700 rounded-lg min-h-[44px] text-white text-center hover:underline will-change-auto' onClick={() => {
            if (theme === "light") {
              setTheme("dark")
            } else { setTheme("light") }
          }}>{theme === "light" ? <MoonIcon size={24} /> : <SunIcon size={24} />}<span className='mx-auto'>{labels.theme}</span>
          </button>

          {/* Language switcher */}
          <div className='flex items-center bg-gray-900 dark:bg-zinc-950/80 shadow-xl mx-10 p-2 border border-zinc-700 rounded-lg min-h-[44px] text-white'>
            <GlobeIcon size={24} />
            <span className='ml-2 mr-auto'>{labels.language}</span>
            <div className='flex gap-1'>
              {locales.map((l) => (
                <button
                  key={l}
                  onClick={() => onLocaleChange(l)}
                  className={`px-2 py-1 rounded text-xs transition-colors ${locale === l ? 'bg-white/20 font-bold' : 'hover:bg-white/10'}`}
                >
                  {localeNames[l]}
                </button>
              ))}
            </div>
          </div>

          <a className="flex bg-gray-900 dark:bg-zinc-950/80 shadow-xl mx-10 p-2 border border-zinc-700 rounded-lg min-h-[44px] text-white text-center hover:underline will-change-auto"
            href='https://www.instagram.com/v.y.l.1000?igsh=bHRyZXRsN3YzcTNi'><InstagramLogoIcon size={24} /><p className='mx-auto text-center'>Instagram</p></a>
          <a href="https://github.com/cx330o" className='flex bg-gray-900 dark:bg-zinc-950/80 shadow-xl mx-10 p-2 border border-zinc-700 rounded-lg min-h-[44px] text-white text-center hover:underline will-change-auto' target='_blank'>
            <GithubLogoIcon size={24} />
            <p className='mx-auto text-center'>{labels.sourceCode}</p></a>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default Menu
