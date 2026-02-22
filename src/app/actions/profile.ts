"use server"

import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"
import { db } from "@/db"
import { profiles } from "@/db/schema"

export async function updateProfile(userId: string, data: { name?: string; avatarUrl?: string }) {
    try {
        await db.update(profiles)
            .set({
                name: data.name || null,
                avatarUrl: data.avatarUrl || null,
            })
            .where(eq(profiles.id, userId))

        revalidatePath("/", "layout")
        return { success: true }
    } catch (error) {
        console.error("Failed to update profile:", error)
        return { success: false, error: "Database error" }
    }
}
