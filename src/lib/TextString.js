


export default function useTranslation(){
    const text = require(`src/locales/${process.env.REACT_APP_LOCALE}.json`);
    return text
}