import { OpenAIBackend } from '@aimpact/platform-server/openai/model';
import { Express, Request, Response } from 'express';

export class OpenAIRoutes {
	static setup(app: Express) {
		app.post('/completions', this.completions);
		app.get('/dummy', this.dummy);
	}

	static async completions(req: Request, res: Response) {
		const { prompt, text } = req.body;

		const openAIBackend = new OpenAIBackend();
		try {
			const result = await openAIBackend.completions({
				messages: [
					{ role: 'system', content: prompt },
					{ role: 'user', content: text }
				],
				model: 'gpt-4o-mini'
			});

			res.status(200).json(result);
		} catch (error) {
			console.error(error);
			res.status(500).json({ status: false, error: error.message });
		}
	}

	static async dummy(req: Request, res: Response) {
		res.status(200).json({ message: 'This is a dummy endpoint.' });
	}
}
