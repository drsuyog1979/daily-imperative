import { db } from "./src/db/index.js"
import { habitConfigs, habitLogs } from "./src/db/schema.js"
import { eq, and } from "drizzle-orm"

async function test() {
    console.log("Testing flipped UUID delete")
    const userId = "00000000-0000-0000-0000-000000000000"
    const habitId = "11111111-1111-1111-1111-111111111111"
    try {
        await db.delete(habitLogs).where(
            and(
                eq(habitLogs.habitId, habitId),
                eq(habitLogs.userId, userId)
            )
        )
        console.log("No error on habitLogs delete")
        await db.delete(habitConfigs).where(
            and(
                eq(habitConfigs.id, habitId),
                eq(habitConfigs.userId, userId)
            )
        )
        console.log("No error on habitConfigs delete")
    } catch (e) {
        console.error("Caught error:", e)
    }
    process.exit(0)
}
test()
