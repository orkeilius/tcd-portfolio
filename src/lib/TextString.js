
const lang = "en"

export default function useTranslation(key){
    const text = require(`src/locales/${lang}.json`);
    return text[key]
}