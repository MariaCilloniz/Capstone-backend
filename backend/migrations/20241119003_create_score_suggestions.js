/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export function up(knex) {
    return knex.schema.createTable('score_suggestions', table => {
        table.increments('id');
        table.integer('subreddit_analysis_id').unsigned()
            .references('subreddit_analyses.id')
            .onUpdate('CASCADE')
            .onDelete('CASCADE');
        table.text('text').notNullable();
        table.string('attribute_name').notNullable();
        table.float('suggested_score').notNullable();
        table.float('actual_score');
        table.timestamps(true, true);
    });
}
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export function down(knex) {
    return knex.schema.dropTable('score_suggestions');
}