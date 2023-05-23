
const lang = "en"

export default function useTranslation(){
    const text = require(`src/locales/${lang}.json`);
    return text
}