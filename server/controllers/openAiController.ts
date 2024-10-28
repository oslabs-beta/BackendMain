import { Request, Response, NextFunction, RequestHandler } from 'express';
import dotenv from 'dotenv';
dotenv.config();
import { openAiController } from '../type';
import OpenAI from 'openai';

const openAiApiKey: string = process.env.OPENAI_PASS;
const openai = new OpenAI({
  apiKey: `${openAiApiKey}`,
});
const openAiController = {} as openAiController;

openAiController.generateAiResponse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userInput = req.body.input;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: userInput },
      ],
    });

    res.locals.message = completion.choices[0].message.content;
    console.log(res.locals.message);
    return next();
  } catch (error) {
    console.error('Error connecting to OpenAI API', error);
    return next({ log: `Error processing request to OpenAI.` });
  }
};

export default openAiController;
