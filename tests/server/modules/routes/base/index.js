// Ejecutar con: node --experimental-network-imports demo.js
// Node 18+ requerido

import { File } from 'http://localhost:1200/fs.js';
import { TextFile } from 'http://localhost:1200/text.js';

const now = Date.now();

// Crear y guardar un archivo de texto
const nuevo = new TextFile(
	{
		name: 'nuevo.txt',
		size: 0,
		type: 'text/plain',
		last_modified: now
	},
	'node'
);

await nuevo.writeText('Archivo creado desde Node + http import');
console.log('✅ nuevo.txt guardado');

// Leer y mostrar hola.txt
const hola = new TextFile(
	{
		name: 'hola.txt',
		size: 0,
		type: 'text/plain',
		last_modified: now
	},
	'node'
);

const contenido = await hola.readText();
console.log('📂 Contenido de hola.txt:\n', contenido);
