import { perspectiveAPI } from '../api/perspectiveAPI.js';
import initKnex from "knex";
import configuration from "../knexfile.js";

const knex = initKnex(configuration);

const VALID_ATTRIBUTES = [
    'TOXICITY',
    'SEVERE_TOXICITY',
    'IDENTITY_ATTACK',
    'INSULT',
    'THREAT',
    'PROFANITY'
];

const suggestScore = async (req, res) => {
    try {
        const { text, suggestedScore, attributeName, subredditAnalysisId } = req.body;

        if (!text) {
            return res.status(400).json({
                error: 'Text is required'
            });
        }

        if (typeof suggestedScore !== 'number' || suggestedScore < 0 || suggestedScore > 1) {
            return res.status(400).json({
                error: 'Suggested Score must be a number between 0 and 1'
            });
        }

        if (!attributeName || !VALID_ATTRIBUTES.includes(attributeName.toUpperCase())) {
            return res.status(400).json({
                error: 'Invalid attributeName',
                validAttributes: VALID_ATTRIBUTES
            });
        }

        if (!subredditAnalysisId) {
            return res.status(400).json({
                error: 'Subreddit analysis ID is required'
            });
        }

        const analysisResponse = await perspectiveAPI.post('/comments:analyze', {
            comment: { text },
            languages: ['en'],
            requestedAttributes: {
                [attributeName.toUpperCase()]: {}
            }
        });

        const suggestionResponse = await perspectiveAPI.post('/comments:suggestscore', {
            comment: { text },
            attributeScores: {
                [attributeName.toUpperCase()]: {
                    summaryScore: { value: suggestedScore }
                }
            },
            languages: ['en'],
            clientToken: `reddit-auditor-${Date.now()}`
        });
        const currentScore = analysisResponse.data.attributeScores[attributeName.toUpperCase()]?.summaryScore?.value || null;

        await knex('score_suggestions').insert({
            subreddit_analysis_id: subredditAnalysisId,
            text,
            attribute_name: attributeName.toUpperCase(),
            suggested_score: suggestedScore,
            actual_score: currentScore
        });

        res.status(200).json({
            text,
            attributeName: attributeName.toUpperCase(),
            suggestedScore,
            currentScore,
            suggestion: suggestionResponse.data,
            languages: suggestionResponse.data.detectedLanguages
        });

    } catch (error) {
        console.error('Perspective API Error:', error.response?.data || error.message);

        if (error.response?.status === 429) {
            return res.status(429).json({
                error: 'Rate limit exceeded. Please try again later.'
            });
        }

        res.status(500).json({
            error: 'Error suggesting score',
            details: error.response?.data?.error || error.message
        });
    }
};

export { suggestScore };