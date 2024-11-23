import axios from 'axios';
import 'dotenv/config';

export const redditAPI = axios.create({
    baseURL: 'https://www.reddit.com',
    headers: {
        'User-Agent': 'web:subreddit-tool:v1.0.0',
    },
    auth: {
        username: process.env.REDDIT_CLIENT_ID,
        password: process.env.REDDIT_CLIENT_SECRET
    }
});
