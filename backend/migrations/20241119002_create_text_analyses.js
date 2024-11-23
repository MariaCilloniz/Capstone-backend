/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export function up(knex) {
    return knex.schema.createTable('text_analyses', table => {
        table.increments('id');
        table.text('text').notNullable();
        table.float('toxicity_score');
        table.float('severe_toxicity_score');
        table.float('identity_attack_score');
        table.float('insult_score');
        table.float('threat_score');
        table.float('profanity_score');
        table.timestamps(true, true);
    });
}
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export function down(knex) {
    return knex.schema.dropTable('text_analyses');
}