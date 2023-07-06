
const modules = import.meta.glob('../locales/*.json', { eager: true })

export default function useTranslation() {
    return modules[`../locales/${import.meta.env.VITE_LOCALE}.json`].default;
}
