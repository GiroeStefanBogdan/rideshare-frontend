import type { Language } from '$lib/i18n/translations';

/**
 * Opens the native picker UI for a date/datetime/time input on click.
 * Pair with an `opacity-0` input layered over a custom-formatted display span.
 */
export function showDatePicker(event: MouseEvent): void {
	const input = event.currentTarget as HTMLInputElement;
	input.showPicker?.();
}

export function formatLocalizedDate(
	date: Date,
	lang: Language,
	options: Intl.DateTimeFormatOptions
): string {
	return date.toLocaleString(lang === 'ro' ? 'ro-RO' : 'en-US', options);
}
