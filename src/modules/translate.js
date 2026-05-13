// Language detection and locale utilities

const LOCATION_LANG_MAP = [
  // East/Southeast Asia
  { patterns: ['thailand','thai','bangkok','pattani','yala','narathiwat','songkhla','chiang mai','phuket'], code: 'TH', name: 'Thai' },
  { patterns: ['japan','japanese','tokyo','osaka','kyoto','nagoya'], code: 'JA', name: 'Japanese' },
  { patterns: ['china','chinese','beijing','shanghai','guangzhou','hong kong','taiwan','taipei'], code: 'ZH', name: 'Chinese' },
  { patterns: ['korea','korean','seoul','busan'], code: 'KO', name: 'Korean' },
  { patterns: ['vietnam','vietnamese','hanoi','ho chi minh','saigon'], code: 'VI', name: 'Vietnamese' },
  { patterns: ['indonesia','indonesian','jakarta','bali','surabaya'], code: 'ID', name: 'Indonesian' },
  { patterns: ['malaysia','malaysian','kuala lumpur','penang'], code: 'MS', name: 'Malay' },
  { patterns: ['philippines','filipino','manila','mindanao','davao'], code: 'TL', name: 'Filipino' },
  { patterns: ['myanmar','burma','burmese','naypyidaw','yangon','mandalay'], code: 'MY', name: 'Burmese' },
  { patterns: ['cambodia','cambodian','khmer','phnom penh'], code: 'KH', name: 'Khmer' },
  { patterns: ['india','indian','delhi','mumbai','kolkata','chennai','kashmir'], code: 'HI', name: 'Hindi' },
  { patterns: ['pakistan','pakistani','islamabad','karachi','lahore'], code: 'UR', name: 'Urdu' },
  { patterns: ['bangladesh','bangladeshi','dhaka'], code: 'BN', name: 'Bengali' },

  // Middle East / Central Asia
  { patterns: ['syria','syrian','damascus','aleppo','idlib'], code: 'AR', name: 'Arabic' },
  { patterns: ['iraq','iraqi','baghdad','mosul','erbil'], code: 'AR', name: 'Arabic' },
  { patterns: ['yemen','yemeni','sanaa','aden','houthi'], code: 'AR', name: 'Arabic' },
  { patterns: ['gaza','west bank','palestine','palestinian','ramallah','jenin'], code: 'AR', name: 'Arabic' },
  { patterns: ['israel','israeli','tel aviv','jerusalem'], code: 'HE', name: 'Hebrew' },
  { patterns: ['egypt','egyptian','cairo'], code: 'AR', name: 'Arabic' },
  { patterns: ['libya','libyan','tripoli','benghazi'], code: 'AR', name: 'Arabic' },
  { patterns: ['sudan','sudanese','khartoum','darfur','rsf','saf'], code: 'AR', name: 'Arabic' },
  { patterns: ['somalia','somali','mogadishu','al-shabaab','al shabaab'], code: 'SO', name: 'Somali' },
  { patterns: ['iran','iranian','tehran','isfahan'], code: 'FA', name: 'Persian' },
  { patterns: ['afghanistan','afghan','kabul','kandahar','taliban'], code: 'PS', name: 'Pashto/Dari' },
  { patterns: ['turkey','turkish','ankara','istanbul','erdogan'], code: 'TR', name: 'Turkish' },
  { patterns: ['saudi','riyadh','jeddah','mecca','medina'], code: 'AR', name: 'Arabic' },

  // Africa
  { patterns: ['mali','malian','bamako','sahel','wagner'], code: 'FR', name: 'French' },
  { patterns: ['niger','nigerian nigeria','lagos','abuja'], code: 'HA', name: 'Hausa/French' },
  { patterns: ['burkina faso','ouagadougou'], code: 'FR', name: 'French' },
  { patterns: ['ethiopia','ethiopian','addis ababa','tigray'], code: 'AM', name: 'Amharic' },
  { patterns: ['drc','congo','kinshasa','eastern congo','kivu'], code: 'FR', name: 'French' },
  { patterns: ['kenya','kenyan','nairobi','mombasa'], code: 'SW', name: 'Swahili' },
  { patterns: ['cameroon','cameroonian','yaounde','anglophone'], code: 'FR', name: 'French' },
  { patterns: ['chad','chadian','ndjamena'], code: 'FR', name: 'French' },
  { patterns: ['senegal','senegalese','dakar'], code: 'FR', name: 'French' },
  { patterns: ['morocco','moroccan','rabat','casablanca'], code: 'AR', name: 'Arabic/French' },

  // Europe
  { patterns: ['ukraine','ukrainian','kyiv','kharkiv','kherson','donetsk','zaporizhzhia'], code: 'UK', name: 'Ukrainian' },
  { patterns: ['russia','russian','moscow','st petersburg','kremlin'], code: 'RU', name: 'Russian' },
  { patterns: ['belarus','belarusian','minsk','lukashenko'], code: 'RU', name: 'Russian/Belarusian' },
  { patterns: ['france','french','paris','marseille','lyon'], code: 'FR', name: 'French' },
  { patterns: ['germany','german','berlin','munich','frankfurt'], code: 'DE', name: 'German' },
  { patterns: ['spain','spanish','madrid','barcelona','catalonia'], code: 'ES', name: 'Spanish' },
  { patterns: ['italy','italian','rome','milan','naples'], code: 'IT', name: 'Italian' },
  { patterns: ['serbia','serbian','belgrade','kosovo'], code: 'SR', name: 'Serbian' },

  // Americas
  { patterns: ['mexico','mexican','cartel','sinaloa','jalisco','cjng','cdmx'], code: 'ES', name: 'Spanish' },
  { patterns: ['colombia','colombian','bogota','medellin','farc','eln','cali'], code: 'ES', name: 'Spanish' },
  { patterns: ['venezuela','venezuelan','caracas','maduro'], code: 'ES', name: 'Spanish' },
  { patterns: ['brazil','brazilian','brasilia','sao paulo','rio','favela'], code: 'PT', name: 'Portuguese' },
  { patterns: ['haiti','haitian','port-au-prince','gang','ariel'], code: 'HT', name: 'Haitian Creole/French' },
  { patterns: ['ecuador','ecuadorian','quito','guayaquil'], code: 'ES', name: 'Spanish' },
  { patterns: ['peru','peruvian','lima'], code: 'ES', name: 'Spanish' },
  { patterns: ['argentina','argentinian','buenos aires'], code: 'ES', name: 'Spanish' },

  // Script-based detection (check for Unicode ranges)
];

const SCRIPT_PATTERNS = [
  { regex: /[฀-๿]/, code: 'TH', name: 'Thai' },
  { regex: /[؀-ۿ]/, code: 'AR', name: 'Arabic' },
  { regex: /[一-鿿]/, code: 'ZH', name: 'Chinese' },
  { regex: /[぀-ゟ゠-ヿ]/, code: 'JA', name: 'Japanese' },
  { regex: /[가-힯]/, code: 'KO', name: 'Korean' },
  { regex: /[Ѐ-ӿ]/, code: 'RU', name: 'Russian/Cyrillic' },
  { regex: /[ऀ-ॿ]/, code: 'HI', name: 'Hindi' },
  { regex: /[ݐ-ݿࢠ-ࣿ]/, code: 'AR', name: 'Arabic Extended' },
];

export function detectLanguage(query) {
  const q = query.toLowerCase();

  // Check Unicode scripts first
  for (const { regex, code, name } of SCRIPT_PATTERNS) {
    if (regex.test(query)) return { code, name };
  }

  // Check location/keyword map
  for (const entry of LOCATION_LANG_MAP) {
    if (entry.patterns.some(p => q.includes(p))) {
      return { code: entry.code, name: entry.name };
    }
  }

  return { code: 'EN', name: 'English' };
}

export function getLanguageLabel(code) {
  return `[${code}]`;
}
