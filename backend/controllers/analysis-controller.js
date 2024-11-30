import { perspectiveAPI } from '../api/perspectiveAPI.js';
import initKnex from "knex";
import configuration from "../knexfile.js";

const knex = initKnex(configuration);

const PERSPECTIVE_ATTRIBUTES = {
    TOXICITY: {},          
    SEVERE_TOXICITY: {},   
    IDENTITY_ATTACK: {},   
    INSULT: {},           
    THREAT: {},           
    PROFANITY: {}         
};
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1100;

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const analyzeWithRateLimit = async (text) => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
        await wait(MIN_REQUEST_INTERVAL - timeSinceLastRequest);
    }
    
    lastRequestTime = Date.now();
    
    return perspectiveAPI.post('/comments:analyze', {
        comment: { text },
        languages: ['en'],
        requestedAttributes: PERSPECTIVE_ATTRIBUTES
    });
};

const analyzeText = async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({
                error: 'Text is required'
            });
        }

        const response = await analyzeWithRateLimit(text);

        const analysisData = {
            text,
            toxicity_score: response.data.attributeScores.TOXICITY?.summaryScore?.value,
            severe_toxicity_score: response.data.attributeScores.SEVERE_TOXICITY?.summaryScore?.value,
            identity_attack_score: response.data.attributeScores.IDENTITY_ATTACK?.summaryScore?.value,
            insult_score: response.data.attributeScores.INSULT?.summaryScore?.value,
            threat_score: response.data.attributeScores.THREAT?.summaryScore?.value,
            profanity_score: response.data.attributeScores.PROFANITY?.summaryScore?.value
        };

        await knex('text_analyses').insert(analysisData);

        res.status(200).json({
            text,
            scores: {
                toxicity: analysisData.toxicity_score,
                severe_toxicity: analysisData.severe_toxicity_score,
                identity_attack: analysisData.identity_attack_score,
                insult: analysisData.insult_score,
                threat: analysisData.threat_score,
                profanity: analysisData.profanity_score
            },
        });


    } catch (error) {
        console.error('Perspective API Error:', error.response?.data || error.message);

        if (error.response?.status === 429) {
            return res.status(429).json({
                error: 'Rate limit exceeded. Please try again later.',
                retry_after: '1 second'
            });
        }
        res.status(500).json({
            error: 'Error analyzing text',
            details: error.response?.data?.error || error.message
        });
    }
};

export { analyzeText };




