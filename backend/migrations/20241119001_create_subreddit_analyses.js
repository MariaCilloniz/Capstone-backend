/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export function up(knex) {
    return knex.schema.createTable('subreddit_analyses', table => {
        table.increments('id').primary();
        table.string('subreddit').notNullable();
        table.text('post_text').notNullable();
        table.string('post_id').notNullable();
        table.float('toxicity_score');
        table.float('severe_toxicity_score');
        table.float('identity_attack_score');
        table.float('insult_score');
        table.float('threat_score');
        table.float('profanity_score');
        table.timestamps(true, true);
        table.index('subreddit');
    });
}
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export function down(knex) {
    return knex.schema.dropTable('subreddit_analyses');
}
