import OpenAI from 'openai';
import { TokenSuggestion } from '../types';
import * as dotenv from 'dotenv';
dotenv.config();

export class AiService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateSuggestions(tweetText: string): Promise<TokenSuggestion[]> {
    try {
      const cleanedTweetText = tweetText.replace(/@finzfunAI\s*/gi, '');
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are a crypto token name generator expert. Your task is to:
              1. Analyze the tweet's content and context
              2. Generate creative and relevant token names with matching tickers
              3. Provide a brief, catchy description for each token
              4. Ensure tickers are 3-4 letters and unique
              5. Make suggestions relevant to the tweet's theme or intent
              6. Avoid common tokens names and tickers (BTC, ETH, SOL, etc.)
              7. Keep descriptions under 50 characters`
          },
          {
            role: "user",
            content: `Generate 4 unique token suggestions based on this tweet: "${cleanedTweetText}". 
                     Each suggestion should follow this format exactly:
                     Name (TICKER) - Brief description`
          }
        ],
        temperature: 0.8,
        max_tokens: 500
      });

      const suggestions = this.parseSuggestions(
        response.choices[0]?.message?.content || ''
      );


      return suggestions
        .filter(s => this.validateSuggestion(s))
        .slice(0, 4);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      throw error;
    }
  }

  private parseSuggestions(text: string): TokenSuggestion[] {
    const suggestions: TokenSuggestion[] = [];
    const lines = text.split('\n').filter(line => line.trim());

    for (const line of lines) {
      const match = line.match(/(.+?)\s*\(([A-Z]{3,4})\)\s*-\s*(.+)/);
      if (match) {
        suggestions.push({
          name: match[1].trim(),
          ticker: match[2].trim(),
          description: match[3].trim()
        });
      }
    }

    return suggestions;
  }

  private validateSuggestion(suggestion: TokenSuggestion): boolean {

    if (!suggestion.name || suggestion.name.length < 3 || suggestion.name.length > 32) {
      return false;
    }

    if (!suggestion.ticker || !/^[A-Z]{3,4}$/.test(suggestion.ticker)) {
      return false;
    }


    const reservedTickers = ['BTC', 'ETH', 'SOL', 'USD', 'USDT', 'USDC'];
    if (reservedTickers.includes(suggestion.ticker)) {
      return false;
    }

    if (!suggestion.description || suggestion.description.length > 50) {
      return false;
    }

    return true;
  }

  async analyzeTweetContext(tweetText: string): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are an expert at analyzing tweets for token creation context. 
            Analyze the sentiment and key themes in the tweet. 
            Return either 'positive' or 'neutral' based on the enthusiasm level.`
          },
          {
            role: "user",
            content: tweetText
          }
        ],
        temperature: 0.3,
        max_tokens: 100
      });

      return response.choices[0]?.message?.content || 'neutral';
    } catch (error) {
      console.error('Error analyzing tweet context:', error);
      return 'neutral';
    }
  }
}