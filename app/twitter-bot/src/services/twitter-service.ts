import { Scraper } from 'agent-twitter-client';
import { AiService } from './ai-service';
import { TokenService } from './token-service';
import { Validation, ValidationError } from '../utils/validation';
import dotenv from 'dotenv';
import * as fs from 'fs/promises';
import * as path from 'path';
import  Creator from '../models/creatorSchema';
import Mentions from '../models/mentionsSchema';
// import { RedisService } from './redis-service';

dotenv.config();

const username = process.env.TWITTER_USERNAME_0;
const password = process.env.TWITTER_PASSWORD_0;

interface Tweet {
  parentTweetId?: string;
  id: string;
  userId: string;
  text: string;
  timestamp?: string;
  replies?: number;
  retweets?: number;
  likes?: number;
  tweetUsername?: string;
  tweetName?: string;
  tweetContent?: string;
  creator?: string;
  tweetImage?: string;
}

interface TokenCreationState {
  stage: 'name' | 'confirm';
  name?: string;
  symbol?: string;
  userId: string;  
  parentTweetId: string; 
  suggestions: { name: string; ticker: string; description: string }[];
  isInitialReplyDone: boolean;
  isCompleted: boolean;
}

interface TwitterSearchResult {
  id: string;
  userId: string;
  text: string;
  timestamp?: number;
  inReplyToStatusId?: string;
  conversationId?: string;
  username?: string;
  name?: string;
  replies?: number;
  retweets?: number;
  likes?: number;
}

export class TwitterService {
  private scraper: Scraper;
  private botUserId?: string;
  private isListening: boolean = false;
  private botScreenName: string = '';
  private tweetStates: Map<string, TokenCreationState> = new Map();
  private processedMentions: Set<string> = new Set();
  private lastProcessedTimestamp: number;
  private aiService: AiService;
  private tokenService: TokenService;
  private readonly MIN_BACKOFF = 10000;  
  private readonly MAX_BACKOFF = 30000;  
  private readonly ERROR_MIN_BACKOFF = 30000;  
  private readonly ERROR_MAX_BACKOFF = 90000;
  private readonly SEARCH_TIMEOUT = 4000; // 4 second timeout
  private readonly TIMESTAMP_FILE = path.join(__dirname, '../../last-processed.txt');
  private currentCredentialIndex: number = 0;
  private credentials: Array<{ username: string, password: string }>;

  constructor() {
    this.scraper = new Scraper();
    this.aiService = new AiService();
    this.tokenService = new TokenService();
    this.lastProcessedTimestamp = Date.now();
    
    this.credentials = [];
    let index = 0;
    while (process.env[`TWITTER_USERNAME_${index}`] && process.env[`TWITTER_PASSWORD_${index}`]) {
      this.credentials.push({
        username: process.env[`TWITTER_USERNAME_${index}`] as string,
        password: process.env[`TWITTER_PASSWORD_${index}`] as string
      });
      index++;
    }
    if (this.credentials.length === 0) {
      throw new Error('No Twitter credentials configured');
    }
  }

  private async reinitialize() {
    console.log('Attempting to reinitialize with different credentials...');
    this.currentCredentialIndex = (this.currentCredentialIndex + 1) % this.credentials.length;
    const credentials = this.credentials[this.currentCredentialIndex];
    
    try {
      this.scraper = new Scraper();
      await this.scraper.login(credentials.username, credentials.password);
      const isLoggedIn = await this.scraper.isLoggedIn();
      console.log('Reinitialized and logged in:', isLoggedIn);
      const cookies = await this.scraper.getCookies();

      await this.scraper.setCookies(cookies);
      const me = await this.scraper.me();
      this.botUserId = me?.userId;
      this.botScreenName = me?.username as string;
      console.log('Bot reinitialized as:', me);
      return true;
    } catch (error) {
      console.error('Reinitialization failed:', error);
      return false;
    }
  }

  private async searchTweetsWithTimeout(query: string, limit: number): Promise<TwitterSearchResult[]> {
    return new Promise(async (resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Search tweets timeout'));
      }, this.SEARCH_TIMEOUT);

      try {
        const tweets: TwitterSearchResult[] = [];
        const iterator = this.scraper.searchTweets(query, limit);
        
        for await (const tweet of iterator) {
          tweets.push(tweet as TwitterSearchResult);
        }
        
        clearTimeout(timeout);
        resolve(tweets);
      } catch (error) {
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  async initialize() {
    try {
      // Initialize scraper
      await this.scraper.login(
       username as string,
        password as string
      );
      const isLoggedIn = await this.scraper.isLoggedIn();
      console.log('Is logged in:', isLoggedIn);

      try {
        const savedTimestamp = await fs.readFile(this.TIMESTAMP_FILE, 'utf-8');
        console.log('Read from file:', savedTimestamp);
        
        if (savedTimestamp && savedTimestamp.trim()) {
          const timestamp = parseInt(savedTimestamp.trim());
          if (!isNaN(timestamp) && timestamp > 0) {
            this.lastProcessedTimestamp = timestamp;
            console.log('Loaded valid timestamp:', timestamp);
          } else {
            throw new Error('Invalid timestamp in file');
          }
        } else {
          throw new Error('Empty timestamp file');
        }
      } catch (error) {
        this.lastProcessedTimestamp = Date.now();
        console.log('Setting current timestamp:', this.lastProcessedTimestamp);
        await this.updateLastProcessedTimestamp(this.lastProcessedTimestamp);
      }

      const cookies = await this.scraper.getCookies();

      await this.scraper.setCookies(cookies);

      const me = await this.scraper.me();
      this.botUserId = me?.userId;
      this.botScreenName = me?.username as string;
      console.log('Bot initialized as:', me);
      return true;
    } catch (error) {
      console.error('Twitter initialization failed:', error);
      return false;
    }
  }

  private async updateLastProcessedTimestamp(timestamp: number) {
    try {
      if (!isNaN(timestamp) && timestamp > 0) {
        await fs.writeFile(this.TIMESTAMP_FILE, timestamp.toString());
        this.lastProcessedTimestamp = timestamp;
        console.log('Updated timestamp:', timestamp);
      } else {
        console.error('Attempted to write invalid timestamp:', timestamp);
      }
    } catch (error) {
      console.error('Error saving timestamp:', error);
    }
  }

  async listenToMentions() {
    if (this.isListening) return;
    this.isListening = true;

    const checkMentions = async () => {
      try {
        if (!this.isListening) return;

        console.log('Searching for new mentions...', this.botScreenName);
        
        const query = `(@finzfunAI) -filter:replies -filter:retweets`;
        const mentions = await Mentions.find({});
        
        try {
          const notifications = await this.searchTweetsWithTimeout(query, 50);
          const newMentions = notifications.filter(tweet => !mentions.some(m => m.tweetId === tweet.id));
          await Mentions.insertMany(newMentions.map(tweet => ({ tweetId: tweet.id })));
          const enabledCreators = await Creator.find({ agentEnabled: true });

          const enabledCreatorIds = new Set(enabledCreators.map(c => c.twitterId));

          for await (const tweet of notifications) {
            if (!enabledCreatorIds.has(tweet.userId)) {
              console.log('Skipping tweet from non-enabled creator:', tweet.userId);
              continue;
            }

            const tweetTimestamp = (tweet.timestamp as number) * 1000;

            console.log('Tweet timestamp:', tweetTimestamp);
            console.log('Last processed timestamp:', this.lastProcessedTimestamp);
            if (tweetTimestamp < this.lastProcessedTimestamp) {
              console.log('Skipping older tweet:', tweet.id);
              continue;
            }

            if (!this.processedMentions.has(tweet.id as string)) {
              console.log('Starting new conversation:', tweet);
              await this.handleMention({
                id: tweet.id as string,
                userId: tweet.userId as string,
                text: tweet.text as string
              });
              this.processedMentions.add(tweet.id as string);
              await this.updateLastProcessedTimestamp(
                Math.max(this.lastProcessedTimestamp, tweetTimestamp)
              );
            }
          }

          for (const [tweetId, state] of this.tweetStates.entries()) {
            if (!state.isCompleted) {
              console.log('Checking replies for tweet:', tweetId);
              const repliesQuery = `conversation_id:${tweetId}`;
              const replies = await this.searchTweetsWithTimeout(repliesQuery, 50);
              
              for await (const reply of replies) {
                if (reply.userId === this.botUserId) continue;

                const parentTweetId = reply.inReplyToStatusId;
                
                if (parentTweetId) {
                  const parentTweet = await this.scraper.getTweet(parentTweetId);
                  if (parentTweet?.userId !== this.botUserId) {
                    console.log('Skipping reply as parent tweet is not from bot');
                    continue;
                  }
                }

                const originalTweet = await this.scraper.getTweet(reply.conversationId as string);
                
                if (reply.userId === state.userId) {
                  console.log('Processing reply:', reply);
                  await this.continueTokenCreation({
                    id: reply.id as string,
                    userId: reply.userId as string,
                    text: reply.text as string,
                    tweetUsername: originalTweet?.username as string,
                    tweetName: originalTweet?.name as string,
                    tweetContent: originalTweet?.text as string,
                    tweetImage: originalTweet?.photos[0]?.url as string,
                    timestamp: originalTweet?.timestamp?.toString() as string,
                    replies: originalTweet?.replies as number,
                    retweets: originalTweet?.retweets as number,
                    likes: originalTweet?.likes as number,
                    creator: originalTweet?.userId as string
                  }, state);
                }
              }
            }
          }

          const backoffTime = Math.min(
            this.MIN_BACKOFF * (1 + Math.random()), 
            this.MAX_BACKOFF
          );
          console.log(`Next check in ${backoffTime/1000} seconds`);
          setTimeout(checkMentions, backoffTime);

        } catch (error) {
          console.error('Error in search tweets:', error);
          const success = await this.reinitialize();
          if (!success) {
            console.log('All credentials attempted, waiting before retry...');
            throw error; 
          }

          console.log('Reinitialization successful, continuing mention checks...');
          setTimeout(checkMentions, this.MIN_BACKOFF);
          return;
        }

      } catch (error) {
        console.log('Error checking mentions:', error);
        const errorBackoffTime = Math.min(
          this.ERROR_MIN_BACKOFF * (1 + Math.random()), 
          this.ERROR_MAX_BACKOFF
        );
        console.log(`Error occurred, next check in ${errorBackoffTime/1000} seconds`);
        setTimeout(checkMentions, errorBackoffTime);
      }
    };

    console.log('🎧 Started listening for mentions...');
    await checkMentions();
  }

  private async handleMention(tweet: Tweet) {
    try {
      // const context = await this.aiService.analyzeTweetContext(tweet.text);
      const suggestions = await this.aiService.generateSuggestions(tweet.text);
      // const suggestions = [
      //   {
      //     name: '1. SolanaSavvy',
      //     ticker: 'SLSY',
      //     description: 'Ride the Solana wave in 2025!'
      //   },
      //   {
      //     name: '2. LockIn2025',
      //     ticker: 'LCKN',
      //     description: "Secure your future, don't miss out!"
      //   },
      //   {
      //     name: '3. FutureFlare',
      //     ticker: 'FUTR',
      //     description: 'Ignite your portfolio with Solana!'
      //   }
      // ]
      console.log('Suggestions:', suggestions);
      const contextIntro = "👋 Based on your tweet, here are some token suggestions:";

      await this.replyToTweet(tweet.id, 
        `${contextIntro}\n\n` +
        suggestions.map((s, i) => `${s.name} & $${s.ticker}\n`).join('\n') +
        `reply with the number of the token you want to create`
      );
      
      this.tweetStates.set(tweet.id, {
        stage: 'name',
        userId: tweet.userId,
        parentTweetId: tweet.id,
        suggestions,
        isInitialReplyDone: true,
        isCompleted: false
      });
    } catch (error) {
      console.error('Error generating suggestions:', error);
      await this.replyToTweet(tweet.id, 
        `Sorry, I couldn't generate suggestions right now. Please try again later.`);
    }
  }

  private async getParentTweetId(tweetId: string): Promise<string | null> {
    try {
      const tweet = await this.scraper.getTweet(tweetId);
      return tweet && tweet.inReplyToStatusId ? tweet.inReplyToStatusId : null;
    } catch (error) {
      console.error('Error getting parent tweet:', error);
      return null;
    }
  }

  private async continueTokenCreation(tweet: Tweet, state: TokenCreationState) {
   console.log('Processing tweet:', tweet.id, 'Stage:', state.stage, 'Text:', tweet.text);
   const text = tweet.text.toLowerCase().replace(`@${this.botScreenName.toLowerCase()}`, '').trim();

    try {
      switch (state.stage) {
        case 'name':
          const choice = Validation.parseUserChoice(text, state.suggestions);
          state.name = choice.name;
          state.symbol = choice.ticker;
          state.stage = 'confirm';
          await this.replyToTweet(tweet.id,
            `Great choice! Here's your token configuration:\n\n` +
            `Name: ${choice.name}\n` +
            `Symbol: ${choice.ticker}\n` +
            `Supply: 1,000,000,000\n\n` +
            `Reply with "confirm" to create your token!`);
          break;

        case 'confirm':
          if (text === 'confirm') {
            console.log('Starting token creation for:', state.name, state.symbol);
            console.log('Tweet for creation:', tweet);
            try {
              const result = await this.tokenService.createToken(
                {
                  name: tweet.tweetName as string,
                  tweetId: tweet.parentTweetId as string,
                  tokenName: state.name!.replace(/^\d+\.\s*/, ''),
                  symbol: state.symbol!,
                  username: tweet.tweetUsername as string,
                  content: tweet.tweetContent as string,
                  timestamp: tweet.timestamp as string,
                  replies: tweet.replies as number,
                  retweets: tweet.retweets as number,
                  likes: tweet.likes as number,
                  creator: tweet.userId,
                  tweetImage: tweet.tweetImage as string,
                }
              );

              console.log('Token creation result:', result);

              if (result.success) {
                await this.replyToTweet(tweet.id,
                  `🎉 Congratulations! Your token ${state.name} (${state.symbol}) has been created!\n\n` +
                  `Token address: ${result.tokenMint}\n` +
                  `Trade ${state.symbol} here:\n https://dial.to/?action=solana-action:https://api.finz.fun/blinks/${result.tokenMint}&cluster=devnet\n\n` +
                  `Start trading your token now! 🚀`);
                state.isCompleted = true;
                this.tweetStates.delete(state.parentTweetId);
              } else {
                throw new Error('Token creation failed');
              }
            } catch (error) {
              console.error('Token creation error details:', error);
              throw error;
            }
          } else {
            await this.replyToTweet(tweet.id,
              `Please reply with "confirm" to create your token, or start a new mention for a different token.`);
          }
          break;
      }
    } catch (error) {
      console.error('Error in continueTokenCreation:', error, 'State:', state);
      if (error instanceof ValidationError) {
        await this.replyToTweet(tweet.id, error.message);
      } else {
        console.error('Error in token creation:', error);
        await this.replyToTweet(tweet.id,
          `Sorry, there was an error processing your request. Please try again with "confirm".`);
      }
    }
}

  async replyToTweet(tweetId: string, message: string) {
    try {
      await this.scraper.sendTweet(message, tweetId);
      console.log('Reply sent successfully to tweet:', tweetId);
    } catch (error) {
      console.error('Error replying to tweet:', error);
      throw error;
    }
  }

  stopListening() {
    this.isListening = false;
    console.log('Stopped listening for mentions');
  }
}