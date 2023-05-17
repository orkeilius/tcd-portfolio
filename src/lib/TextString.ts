
const lang = "en"

export default function useTranslation(key: string){
    const text = require(`../../locales/${lang}.json`);
    return text[key]
}