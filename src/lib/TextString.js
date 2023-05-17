
const lang = "en"

export default function useTranslation(key){
    const text = require(`locales/${lang}.json`);
    return text[key]
}