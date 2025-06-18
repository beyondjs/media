import type { Application, Response as IResponse, Request } from 'express';
import { TextFile, JsonFile } from '@beyond-js/media/text';

export /*bundle*/ function routes(app: Application) {
	const textSample = async () => {
		const now = Date.now();
		const nuevo = new TextFile(
			{
				name: `${process.cwd()}/modules/routes/base/nuevo.txt`,
				size: 0,
				type: 'text/plain',
				last_modified: now
			},
			'node'
		);
		await nuevo.writeText('Archivo creado desde Node + http import');
		console.log('✅ nuevo.txt guardado');
		const hola = new TextFile(
			{
				name: `${process.cwd()}/modules/routes/base/hola.txt`
			},
			'node'
		);
		const contenido = await hola.readText();
		return contenido;
	};

	const jsonSample = async () => {
		const file = new JsonFile(
			{
				name: `${process.cwd()}/modules/routes/base/nuevo.json`,
				type: 'application/json'
			},
			'node'
		);

		file.save({
			name: 'routes',
			platforms: 'node',
			ts: {
				files: ['*']
			}
		});
		file.on('write.completed', () => {
			console.log('✅ Archivo JSON creado y guardado como nuevo.json');
		});
		const file2 = new JsonFile({
			name: `${process.cwd()}/modules/routes/base/module-sample.json`,
			type: 'application/json'
		});
		file2.patch({
			routes: 'hola-mundo22'
		});

		return await file.data;
	};
	app.get('/', async (req: Request, res: IResponse) => {
		try {
			// Crear y guardar un archivo de texto
			const contenido = await textSample();
			const data = await jsonSample();
			console.log(40, data);
			res.send(data);
		} catch (error) {
			console.error(error);
			res.status(500).send('Error leyendo hola.txt 2');
		}
	});
}
