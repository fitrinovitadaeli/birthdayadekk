// Pakai: node tools/encrypt-book.mjs buku.pdf "kata sandi baru" -> menulis book/book.enc
import { readFileSync, writeFileSync } from 'node:fs';
import { webcrypto as c } from 'node:crypto';
const [,, inp, pass] = process.argv;
if (!inp || !pass) { console.error('node encrypt-book.mjs <pdf> <sandi>'); process.exit(1); }
const salt = c.getRandomValues(new Uint8Array(16)), iv = c.getRandomValues(new Uint8Array(12));
const km = await c.subtle.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveKey']);
const key = await c.subtle.deriveKey({ name:'PBKDF2', salt, iterations:600000, hash:'SHA-256' }, km, { name:'AES-GCM', length:256 }, false, ['encrypt']);
const ct = new Uint8Array(await c.subtle.encrypt({ name:'AES-GCM', iv }, key, readFileSync(inp)));
const out = new Uint8Array(32 + ct.length);
out.set([66,75,118,49]); out.set(salt,4); out.set(iv,20); out.set(ct,32);
writeFileSync(new URL('../book/book.enc', import.meta.url), out);
console.log('OK', out.length, 'bytes');
