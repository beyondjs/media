export /*bundle*/ const encode = (s: string) => new TextEncoder().encode(s);
export /*bundle*/ const decode = (b: Uint8Array) => new TextDecoder().decode(b);
