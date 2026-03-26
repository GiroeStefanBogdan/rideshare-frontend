import { translations, type Language } from '$lib/i18n/translations';

function createI18nStore() {
	let currentLang = $state<Language>('ro');

	return {
		get lang() {
			return currentLang;
		},
		setLang(lang: Language) {
			currentLang = lang;
			if (typeof localStorage !== 'undefined') {
				localStorage.setItem('lang', lang);
			}
		},
		t(path: string) {
			const keys = path.split('.');
			let value: Record<string, unknown> = translations[currentLang] as Record<string, unknown>;
			for (const key of keys) {
				if (value && value[key]) {
					value = value[key] as Record<string, unknown>;
				} else {
					return path; // Fallback to path if key not found
				}
			}
			return value;
		},
		init() {
			if (typeof localStorage !== 'undefined') {
				const saved = localStorage.getItem('lang') as Language;
				if (saved && (saved === 'en' || saved === 'ro')) {
					currentLang = saved;
				}
			}
		}
	};
}

export const i18n = createI18nStore();
