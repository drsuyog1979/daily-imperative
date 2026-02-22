"use server"

import { eq, and, sql, gte, lte } from "drizzle-orm"
import { db } from "@/db"
import { habitConfigs, habitLogs } from "@/db/schema"

export type MonthlyHistoryData = {
    date: string
    completedCount: number
    totalHabits: number
    isAllCompleted: boolean
}

export type StreakData = {
    currentStreak: number
    longestStreak: number
}

// Helper to get exactly how many habits this user has configured (e.g., normally 3)
async function getUserTotalHabits(userId: string) {
    const result = await db
        .select({ count: sql<number>`cast(count(*) as integer)` })
        .from(habitConfigs)
        .where(eq(habitConfigs.userId, userId))
    return result[0]?.count || 0
}

export async function getMonthlyHistory(userId: string, year: number, month: number): Promise<MonthlyHistoryData[]> {
    const totalHabits = await getUserTotalHabits(userId)
    if (totalHabits === 0) return []

    // Format boundaries like "2024-05-01" and "2024-05-31"
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0]
    const endDate = new Date(year, month, 0).toISOString().split('T')[0]

    // Query all logs for this user in the date range
    const logs = await db.select()
        .from(habitLogs)
        .where(
            and(
                eq(habitLogs.userId, userId),
                gte(habitLogs.logDate, startDate),
                lte(habitLogs.logDate, endDate)
            )
        )
        .orderBy(habitLogs.logDate)

    // Aggregate logs by date
    const dailyCounts: Record<string, number> = {}
    logs.forEach(log => {
        if (!dailyCounts[log.logDate]) {
            dailyCounts[log.logDate] = 0
        }
        dailyCounts[log.logDate]++
    })

    // Convert to array format for frontend calendar
    const history: MonthlyHistoryData[] = Object.keys(dailyCounts).map(date => ({
        date,
        completedCount: dailyCounts[date],
        totalHabits,
        isAllCompleted: dailyCounts[date] >= totalHabits
    }))

    return history
}

export async function getStreakStats(userId: string): Promise<StreakData> {
    const totalHabits = await getUserTotalHabits(userId)
    if (totalHabits === 0) return { currentStreak: 0, longestStreak: 0 }

    // Fetch ALL logs ordered by date descending to calculate steaks
    const allLogs = await db.select()
        .from(habitLogs)
        .where(eq(habitLogs.userId, userId))
        .orderBy(sql`${habitLogs.logDate} DESC`) // Newest first

    if (allLogs.length === 0) return { currentStreak: 0, longestStreak: 0 }

    // Aggregate daily counts
    const dailyCounts: Record<string, number> = {}
    allLogs.forEach(log => {
        if (!dailyCounts[log.logDate]) {
            dailyCounts[log.logDate] = 0
        }
        dailyCounts[log.logDate]++
    })

    // Get an array of only the fully completed dates, sorted newest to oldest
    const fullyCompletedDates = Object.keys(dailyCounts)
        .filter(date => dailyCounts[date] >= totalHabits)
        .sort((a, b) => b.localeCompare(a))

    if (fullyCompletedDates.length === 0) return { currentStreak: 0, longestStreak: 0 }

    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0
    let expectedNextDate: Date | null = null

    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    // Format YYYY-MM-DD in local time accurately
    const todayStr = today.toLocaleDateString('en-CA')
    const yesterdayStr = yesterday.toLocaleDateString('en-CA')

    // 1. Calculate Current Streak
    // The streak is active if today OR yesterday is completed.
    if (fullyCompletedDates.includes(todayStr) || fullyCompletedDates.includes(yesterdayStr)) {
        const checkDate = fullyCompletedDates.includes(todayStr) ? new Date(today) : new Date(yesterday)

        for (const dateStr of fullyCompletedDates) {
            const checkDateStr = checkDate.toLocaleDateString('en-CA')
            if (dateStr === checkDateStr) {
                currentStreak++
                checkDate.setDate(checkDate.getDate() - 1) // Move expectation back 1 day
            } else if (dateStr > checkDateStr) {
                // Skip if somehow the array has future dates, shouldn't happen but safe
                continue
            } else {
                // Streak broken
                break
            }
        }
    }

    // 2. Calculate Longest Streak
    for (let i = 0; i < fullyCompletedDates.length; i++) {
        const currentDate = new Date(fullyCompletedDates[i])

        if (expectedNextDate === null) {
            tempStreak = 1
        } else {
            const expectedStr = expectedNextDate.toLocaleDateString('en-CA')
            if (fullyCompletedDates[i] === expectedStr) {
                tempStreak++
            } else {
                // Gap found, reset temp streak
                tempStreak = 1
            }
        }

        if (tempStreak > longestStreak) {
            longestStreak = tempStreak
        }

        // Set the expectation for the NEXT iteration (which is chronologically the PREVIOUS day since array is newest->oldest)
        expectedNextDate = new Date(currentDate)
        expectedNextDate.setDate(currentDate.getDate() - 1)
    }

    return {
        currentStreak,
        longestStreak: Math.max(currentStreak, longestStreak) // Longest cannot be less than current
    }
}
