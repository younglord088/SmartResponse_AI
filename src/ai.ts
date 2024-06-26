import { OpenAI } from 'openai';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Initialize OpenAI API with the configuration
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Function to analyze email content
export const analyzeEmailContent = async (content: string): Promise<string> => {
    try {
        const response = await openai.completions.create({
            model: 'text-davinci-003',
            prompt: `Categorize the following email content: ${content}`,
            max_tokens: 50,
        });

        // Return the first choice text, trimmed of any leading/trailing whitespace
        return response.choices[0].text.trim();
    } catch (error) {
        console.error('Error analyzing email content:', error);
        throw new Error('Failed to analyze email content');
    }
};

// Function to generate a reply based on the label
export const generateReply = (label: string): string => {
    switch (label) {
        case 'Interested':
            return 'Thank you for your interest. Would you like to schedule a demo call?';
        case 'Not Interested':
            return 'Thank you for your response. Have a great day!';
        case 'More information':
            return 'Could you please provide more details?';
        default:
            return 'Thank you for your email.';
    }
};

// Example usage
(async () => {
    try {
        const emailContent = 'I would like to know more about your product.';
        const label = await analyzeEmailContent(emailContent);
        const reply = generateReply(label);
        console.log('Generated reply:', reply);
    } catch (error) {
        console.error('Error:', error);
    }
})();
