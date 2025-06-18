// loader.mjs
import { fetch } from 'node-fetch';

export async function resolve(specifier, context, defaultResolve) {
	if (specifier.startsWith('http://') || specifier.startsWith('https://')) {
		return { url: specifier };
	}
	return defaultResolve(specifier, context, defaultResolve);
}

export async function load(url, context, defaultLoad) {
	if (url.startsWith('http://') || url.startsWith('https://')) {
		const res = await fetch(url);
		if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
		const source = await res.text();
		return {
			format: 'module',
			source
		};
	}
	return defaultLoad(url, context, defaultLoad);
}
