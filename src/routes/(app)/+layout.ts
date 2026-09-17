import type { LayoutLoad } from './$types';

// The server resolves cookie-backed identity. Anonymous public pages must not
// trigger the API client's protected-request redirect during navigation.
export const load: LayoutLoad = ({ data }) => data;
