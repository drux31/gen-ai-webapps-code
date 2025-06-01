import ollama from 'ollama'
import express from "express";
import cors from "cors";
import winston from "winston";
import 'dotenv/config';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const port = process.env.PORT || 3000;

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [new winston.transports.Console({ format: winston.format.simple() })],
});

app.use(express.json());
app.use(cors());
app.options('*', cors());

app.post('/', async (req, res) => {
  try {
    logger.info('Received request:', { body: req.body });

    //const model = ollama..getGenerativeModel({ model: "gemini-1.5-flash" });
    const { text } = req.body;

    const response = await ollama.chat({
      model: 'tinyllama',
      messages: [
        {
          role: "user",
          content: text,
        },
        {
          role: "assistant",
          content: "I'm happy to assist you in any way I can. How can I be of service today?",
        },
      ],
    });
    
    const responseMessage = response.message;
    logger.info('Response:', { response: responseMessage });
    const message = {
      id: uuidv4(), // Include ID
      created: new Date(),
      role: 'assistant',
      content: responseMessage,
    };
    res.json({ message });
  } catch (e) {
    logger.error('Internal server error:', { error: e.message });
    res.status(500).send('Internal server error');
  }
});

// Global error-handling middleware
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', { error: err.message, stack: err.stack });
  res.status(500).send('Internal server error');
});

app.listen(port, () => {
  logger.info(`Server is running on http://localhost:${port}`);
});