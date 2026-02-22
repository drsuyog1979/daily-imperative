import { pgTable, uuid, text, timestamp, date, unique, jsonb } from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
    id: uuid("id").primaryKey().notNull(), // References auth.users(id)
    email: text("email").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const habitConfigs = pgTable("habit_configs", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => profiles.id).notNull(),
    name: text("name").notNull(), // e.g. "Exercise", "Meditation", "Journal"
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const habitLogs = pgTable("habit_logs", {
    id: uuid("id").defaultRandom().primaryKey(),
    habitId: uuid("habit_id").references(() => habitConfigs.id).notNull(),
    userId: uuid("user_id").references(() => profiles.id).notNull(),
    logDate: date("log_date").notNull(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
    uniqueLog: unique().on(table.habitId, table.logDate),
}));
