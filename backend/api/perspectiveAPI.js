import axios from 'axios';
import 'dotenv/config';

export const perspectiveAPI = axios.create({
    baseURL: 'https://commentanalyzer.googleapis.com/v1alpha1',
    params: {
        key: process.env.PERSPECTIVE_API_KEY
    }
});
