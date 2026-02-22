"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import { createClient } from "@/lib/supabase/server"
import { db } from "@/db"
import { profiles, habitConfigs } from "@/db/schema"

export async function login(formData: FormData) {
    const supabase = await createClient()

    // type-casting here for convenience
    // in practice, use a schema library like zod to validate the form
    const data = {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        return { error: error.message }
    }

    revalidatePath("/", "layout")
    redirect("/")
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const data = {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
    }

    const { data: authData, error } = await supabase.auth.signUp(data)

    if (error) {
        return { error: error.message }
    }

    if (authData.user) {
        try {
            // Create the profile
            await db.insert(profiles).values({
                id: authData.user.id,
                email: authData.user.email!,
            }).onConflictDoNothing();

            // Seed basic habits (Exercise, Meditation, Journal)
            await db.insert(habitConfigs).values([
                { userId: authData.user.id, name: "Exercise" },
                { userId: authData.user.id, name: "Meditation" },
                { userId: authData.user.id, name: "Journal" },
            ]).onConflictDoNothing();
        } catch (err) {
            console.error("Failed to seed initial user data:", err)
        }
    }

    if (authData.user && !authData.session) {
        return { message: "Sign up successful! Please check your email for a confirmation link. (If you didn't receive one, you might already have an account)." }
    }

    revalidatePath("/", "layout")
    redirect("/")
}
