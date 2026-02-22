import { redirect } from "next/navigation"
import { LogOut } from "lucide-react"
import { revalidatePath } from "next/cache"

import { createClient } from "@/lib/supabase/server"
import { getTodaysHabits } from "@/app/actions/habits"
import { getStreakStats, getMonthlyHistory } from "@/app/actions/stats"

import { HabitCard } from "@/components/HabitCard"
import { StreakCounter } from "@/components/StreakCounter"
import { HistoryCalendar } from "@/components/HistoryCalendar"
import { ResetButton } from "@/components/ResetButton"
import { Button } from "@/components/ui/button"

export default async function Home({
  searchParams,
}: {
  searchParams: { month?: string, year?: string, date?: string }
}) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Determine current month viewing for calendar (defaults to right now)
  const todayVal = new Date()
  const viewMonth = searchParams.month ? parseInt(searchParams.month) : todayVal.getMonth() + 1
  const viewYear = searchParams.year ? parseInt(searchParams.year) : todayVal.getFullYear()

  // Find target Date for history viewing
  const targetDateStr = searchParams.date || todayVal.toISOString().split('T')[0]
  const isViewingHistory = targetDateStr !== todayVal.toISOString().split('T')[0]

  // Fetch today's habits
  const habits = await getTodaysHabits(user.id, user.email || "", targetDateStr)

  // Fetch streak and history data
  const [streakStats, monthlyHistory] = await Promise.all([
    getStreakStats(user.id),
    getMonthlyHistory(user.id, viewYear, viewMonth)
  ])

  const completedCount = habits.filter(h => h.isCompleted).length
  const totalCount = habits.length
  const allCompleted = totalCount > 0 && completedCount === totalCount

  // Format date nicely: "Monday, October 23"
  // When parsing YYYY-MM-DD back to a date, we append T12:00:00 to avoid timezone shift issues
  const dateToFormat = new Date(`${targetDateStr}T12:00:00`)
  const targetFormatted = dateToFormat.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  })

  // To support changing months without React Server Component state loss,
  // we could pass an action to HistoryCalendar that updates searchParams.
  // For simplicity right now, it displays the current month.
  // We can add the `onMonthChange` router.push logic later if needed.

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex items-center justify-between pt-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isViewingHistory ? "Historical Log" : "Today"}
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">{targetFormatted}</p>
          </div>

          <div className="flex items-center gap-2">
            <ResetButton userId={user.id} />
            <form action={async () => {
              "use server"
              const supabase = await createClient()
              await supabase.auth.signOut()
              revalidatePath("/", "layout")
              redirect("/login")
            }}>
              <Button variant="ghost" size="icon" type="submit" title="Sign out">
                <LogOut className="h-5 w-5 text-zinc-500" />
                <span className="sr-only">Sign out</span>
              </Button>
            </form>
          </div>
        </header>

        {/* Streak Counter */}
        <StreakCounter
          currentStreak={streakStats.currentStreak}
          longestStreak={streakStats.longestStreak}
        />

        {/* Progress Overview */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border dark:border-zinc-800">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="text-lg font-medium">Daily Progress</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {completedCount} of {totalCount} habits completed
              </p>
            </div>
            {allCompleted && (
              <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-500/10 dark:text-green-400 ring-1 ring-inset ring-green-600/20">
                All done!
              </span>
            )}
          </div>

          {/* Progress bar */}
          <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2.5 mt-4 overflow-hidden">
            <div
              className="bg-zinc-900 dark:bg-zinc-100 h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${totalCount === 0 ? 0 : (completedCount / totalCount) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Habits List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold px-1">Your Imperatives</h2>
          {habits.length === 0 ? (
            <div className="text-center p-8 border-2 border-dashed rounded-xl dark:border-zinc-800">
              <p className="text-zinc-500 dark:text-zinc-400">No habits configured.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {habits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  id={habit.id}
                  name={habit.name}
                  isCompleted={habit.isCompleted}
                  userId={user.id}
                  metadata={habit.metadata}
                  targetDate={targetDateStr}
                />
              ))}
            </div>
          )}
        </div>

        {/* Calendar View */}
        <HistoryCalendar
          history={monthlyHistory}
        />

      </div>
    </main>
  )
}
