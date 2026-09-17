import { translations, type Language } from '$lib/i18n/translations';

function createI18nStore() {
	let currentLang = $state<Language>('ro');

	return {
		get lang() {
			return currentLang;
		},
		setLang(lang: Language) {
			currentLang = lang;
			if (typeof document !== 'undefined') document.documentElement.lang = lang;
			if (typeof localStorage !== 'undefined') {
				localStorage.setItem('lang', lang);
			}
		},
		t(path: string): string {
			const keys = path.split('.');
			let value: unknown = translations[currentLang] as Record<string, unknown>;
			for (const key of keys) {
				if (value && typeof value === 'object' && key in (value as Record<string, unknown>)) {
					value = (value as Record<string, unknown>)[key];
				} else {
					return path; // Fallback to path if key not found
				}
			}
			return typeof value === 'string' ? value : path;
		},
		init() {
			if (typeof localStorage !== 'undefined') {
				const saved = localStorage.getItem('lang') as Language;
				if (saved && (saved === 'en' || saved === 'ro')) {
					currentLang = saved;
				}
				document.documentElement.lang = currentLang;
			}
		}
	};
}

export const i18n = createI18nStore();
