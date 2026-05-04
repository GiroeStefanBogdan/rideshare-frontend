const config = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				// DrumBun design tokens — always use these names, never raw hex values
				voronet: '#003399', // primary brand — CTAs, active states, links
				charcoal: '#333333', // all body text and secondary UI elements
				'soft-white': '#F8F9FA', // page backgrounds
				heritage: '#F3F4F5' // card backgrounds, dividers, decorative motifs
			},
			fontFamily: {
				// Manrope must be loaded via <link> in app.html or self-hosted in /static
				sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif']
			}
		}
	},
	plugins: []
};

export default config;
