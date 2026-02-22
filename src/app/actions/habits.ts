"use server"

import { revalidatePath } from "next/cache"
import { eq, and } from "drizzle-orm"

import { db } from "@/db"
import { habitConfigs, habitLogs, profiles } from "@/db/schema"

export type HabitData = {
    id: string
    name: string
    isCompleted: boolean
    logId?: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata?: any
}

export async function getTodaysHabits(userId: string, email: string, dateStr?: string): Promise<HabitData[]> {
    let configs = await db.select().from(habitConfigs).where(eq(habitConfigs.userId, userId))

    // Auto-provision user if they were created outside of our signup flow (e.g. Supabase dashboard)
    if (configs.length === 0) {
        try {
            await db.insert(profiles).values({
                id: userId,
                email: email,
            }).onConflictDoNothing();

            await db.insert(habitConfigs).values([
                { userId: userId, name: "Exercise" },
                { userId: userId, name: "Meditation" },
                { userId: userId, name: "Journal" },
            ]).onConflictDoNothing();

            // Refetch the freshly created configs
            configs = await db.select().from(habitConfigs).where(eq(habitConfigs.userId, userId))
        } catch (error) {
            console.error("Failed to auto-provision user habits:", error)
        }
    }

    // Format target date as YYYY-MM-DD
    const targetDate = dateStr || new Date().toISOString().split('T')[0]

    const promises = configs.map(async (config) => {
        const logs = await db.select()
            .from(habitLogs)
            .where(
                and(
                    eq(habitLogs.habitId, config.id),
                    eq(habitLogs.logDate, targetDate)
                )
            )

        const log = logs[0]

        return {
            id: config.id,
            name: config.name,
            isCompleted: !!log,
            logId: log?.id,
            metadata: log?.metadata,
        }
    })

    return Promise.all(promises)
}

export async function toggleHabit(
    habitId: string,
    userId: string,
    isCompleted: boolean,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata?: any,
    dateStr?: string
) {
    const targetDate = dateStr || new Date().toISOString().split('T')[0]

    try {
        if (isCompleted) {
            // Find log and insert or update with metadata
            await db.insert(habitLogs).values({
                habitId,
                userId,
                logDate: targetDate,
                metadata: metadata || null,
            }).onConflictDoUpdate({
                target: [habitLogs.habitId, habitLogs.logDate],
                set: { metadata: metadata || null }
            })
        } else {
            // Remove log to mark as incomplete
            await db.delete(habitLogs).where(
                and(
                    eq(habitLogs.habitId, habitId),
                    eq(habitLogs.logDate, targetDate)
                )
            )
        }

        revalidatePath("/")
        return { success: true }
    } catch (error) {
        console.error("Failed to toggle habit:", error)
        return { success: false, error: "Database error" }
    }
}

export async function resetHistory(userId: string) {
    try {
        await db.delete(habitLogs).where(eq(habitLogs.userId, userId))
        revalidatePath("/")
        return { success: true }
    } catch (error) {
        console.error("Failed to reset history:", error)
        return { success: false, error: "Database error" }
    }
}
