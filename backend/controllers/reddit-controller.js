import { perspectiveAPI } from '../api/perspectiveAPI.js';
import { redditAPI } from '../api/redditApi.js';
import initKnex from "knex";
import configuration from "../knexfile.js";

const knex = initKnex(configuration);

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 25;
const PERSPECTIVE_ATTRIBUTES = {
    TOXICITY: {},
    SEVERE_TOXICITY: {},
    IDENTITY_ATTACK: {},
    INSULT: {},
    THREAT: {},
    PROFANITY: {}
};


const analyzeSubreddit = async (req, res) => {
    try {
        if (!process.env.PERSPECTIVE_API_KEY) {
            return res.status(500).json({
                error: 'Perspective API key is not configured'
            });
        }

        const { subreddit } = req.params;
        
        const requestedLimit = parseInt(req.query.limit);
        let limit = !isNaN(requestedLimit) && requestedLimit > 0
            ? Math.min(requestedLimit, MAX_LIMIT)
            : DEFAULT_LIMIT;

        const response = await redditAPI.get(`/r/${subreddit}/new.json`, {
            params: { limit }
        });

        const posts = response.data.data.children.map(post => ({
            id: post.data.id,
            title: post.data.title,
            content: post.data.selftext,
            author: post.data.author,
            url: post.data.url,
            created_utc: post.data.created_utc,
            score: post.data.score
        }));

        const shuffledPosts = shuffleArray([...posts]).slice(0, limit);


        const analyzedPosts = await Promise.all(
            shuffledPosts.map(async (post, index) => {
                try {
                    await new Promise(resolve => setTimeout(resolve, index * 100));

                    const text = `${post.title} ${post.content}`.trim();

                    if (!text) {
                        return {
                            ...post,
                            analysis: null,
                            error: 'No content to analyze'
                        };
                    }

                    const analysisResponse = await perspectiveAPI.post('/comments:analyze', {
                        comment: { text },
                        languages: ['en'],
                        requestedAttributes: PERSPECTIVE_ATTRIBUTES
                    });

                    const analysisData = {
                        subreddit: subreddit.toLowerCase(),
                        post_id: post.id,
                        post_text: text,
                        toxicity_score: analysisResponse.data.attributeScores.TOXICITY?.summaryScore?.value,
                        severe_toxicity_score: analysisResponse.data.attributeScores.SEVERE_TOXICITY?.summaryScore?.value,
                        identity_attack_score: analysisResponse.data.attributeScores.IDENTITY_ATTACK?.summaryScore?.value,
                        insult_score: analysisResponse.data.attributeScores.INSULT?.summaryScore?.value,
                        threat_score: analysisResponse.data.attributeScores.THREAT?.summaryScore?.value,
                        profanity_score: analysisResponse.data.attributeScores.PROFANITY?.summaryScore?.value
                    };

                    const [result] = await knex('subreddit_analyses')
                        .insert(analysisData);
                    
                    const analysisId = result;

                    return {
                        ...post,
                        analysis: analysisResponse.data,
                        analysisId: analysisId
                    };

                } catch (error) {
                    console.error(`Error analyzing post ${post.id}:`, {
                        status: error.response?.status,
                        data: error.response?.data,
                        message: error.message
                    });
                    return {
                        ...post,
                        analysis: null,
                        error: error.response?.status === 429
                            ? 'Rate limit exceeded for content analysis'
                            : `Failed to analyze content: ${error.response?.data?.error?.message || error.message}`
                    };
                }
            })
        );


        res.status(200).json({
            subreddit,
            post_count: analyzedPosts.length,
            limit_info: requestedLimit > MAX_LIMIT ? {
                requested: requestedLimit,
                actual: MAX_LIMIT,
                message: `Limit was capped at maximum allowed value of ${MAX_LIMIT}`
            } : null,
            analyzed_posts: analyzedPosts.map(post => ({
                id: post.id,
                analysisId: post.analysisId,
                title: post.title,
                content: post.content,
                author: post.author,
                analysis: post.analysis,
                error: post.error,
                more_details: post.error && {
                    title_length: post.title?.length,
                    content_length: post.content?.length
                }
            }))
        });

    } catch (error) {
        console.error('Error in analyzeSubreddit:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });

        if (error.response?.status === 404) {
            return res.status(404).json({
                error: 'Subreddit not found'
            });
        }

        res.status(500).json({
            error: 'Error analyzing subreddit',
            message: error.response?.data?.error || error.message,
            details: process.env.NODE_ENV === 'development' ? {
                status: error.response?.status,
                data: error.response?.data
            } : undefined
        });
    }
};

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export { analyzeSubreddit };