/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function seed(knex) {
    await knex('subreddit_analyses').del();
    await knex('text_analyses').del();
    await knex('score_suggestions').del();

    await knex('subreddit_analyses').insert([
        {
            subreddit: 'philosophy',
            post_text: 'What are the ethical implications of AI?',
            post_id: 'test123',
            toxicity_score: 0.1,
            severe_toxicity_score: 0.05,
            identity_attack_score: 0.02,
            insult_score: 0.01,
            threat_score: 0.01,
            profanity_score: 0.01
        }
    ]);

    await knex('text_analyses').insert([
        {
            text: 'Example philosophical discussion text',
            toxicity_score: 0.2,
            severe_toxicity_score: 0.1,
            identity_attack_score: 0.05,
            insult_score: 0.05,
            threat_score: 0.01,
            profanity_score: 0.02
        }
    ]);

    await knex('score_suggestions').insert([
        {
            text: 'Example text for scoring',
            attribute_name: 'TOXICITY',
            suggested_score: 0.3,
            actual_score: 0.4
        }
    ]);
}