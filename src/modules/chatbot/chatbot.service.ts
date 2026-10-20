import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { IChatbotRequest } from './chatbot.interface';

// Keep the website's existing `/chatbot` flow intact while allowing each
// environment to choose its own FastAPI chatbot service.
// Local development uses 127.0.0.1:8000; VPS/production uses CHATBOT_API_URL or defaults to live bot.
const getChatbotApiUrl = (): string => {
  return (
    process.env.CHATBOT_API_URL ||
    'http://127.0.0.1:8000/api/chat/'
  );
};

const sendMessageToChatbot = async (
  payload: {
    message: string;
  },
  userId: string,
) => {
  try {
    const apiUrl = getChatbotApiUrl();
    const formData = new URLSearchParams();

    formData.append('user_id', userId);

    formData.append('query', payload.message);

    const response = await fetch(apiUrl, {
      method: 'POST',

      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Accept: 'application/json',
      },

      body: formData.toString(),
    });

    const contentType = response.headers.get('content-type');

    const data = contentType?.includes('application/json')
      ? await response.json()
      : await response.text();

    return {
      statusCode: response.status,
      data,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      'Chatbot service is currently unavailable. Please try again later.',
      StatusCodes.BAD_GATEWAY,
    );
  }
};

const chatbotService = {
  sendMessageToChatbot,
};

export default chatbotService;
