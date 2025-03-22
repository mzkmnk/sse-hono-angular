import {zValidator} from '@hono/zod-validator';
import {Hono} from 'hono';
import {env} from 'hono/adapter';
import {cors} from 'hono/cors';
import {streamSSE} from 'hono/streaming';
import OpenAI from 'openai';
import {z} from 'zod';

const schema = z.object({
	message: z.string(),
});

const app = new Hono()
	.use(
		'/*',
		cors({
			origin: ['http://localhost:4200'],
		}),
	)
	.post(
		'/stream/messages',
		zValidator('json', schema, (result, c) => {
			if (!result.success) {
				return c.json(
					{
						message: 'Invalid request',
					},
					400,
				);
			}
		}),
		async (c) => {
			const { OPENAI_API_KEY } = env<{ OPENAI_API_KEY: string }>(c);

			const openai = new OpenAI({
				apiKey: OPENAI_API_KEY,
			});

			const { message } = c.req.valid('json');

			const streamChunk = await openai.chat.completions.create({
				model: 'gpt-4o-mini',
				messages: [
					{
						role: 'user',
						content: message,
					},
				],
				stream: true,
			});

			return streamSSE(c, async (stream) => {
				for await (const chunk of streamChunk) {
					if (chunk.choices.length === 0) {
						return;
					}

					await stream.writeSSE({
						data: chunk.choices[0].delta.content ?? '',
					});
				}
			});
		},
	);

export default app;
