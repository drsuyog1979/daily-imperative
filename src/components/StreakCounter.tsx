"use client"

import { Flame, Trophy } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StreakCounterProps {
    currentStreak: number
    longestStreak: number
}

export function StreakCounter({ currentStreak, longestStreak }: StreakCounterProps) {
    return (
        <div className="grid grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200/50 dark:border-orange-900/50">
                <CardContent className="p-4 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Current Streak</p>
                        <h3 className="text-2xl flex items-baseline gap-1 font-bold text-orange-700 dark:text-orange-300">
                            {currentStreak} <span className="text-sm font-normal text-orange-600/70 dark:text-orange-400/70">days</span>
                        </h3>
                    </div>
                    <div className={cn(
                        "p-3 rounded-full",
                        currentStreak > 0 ? "bg-orange-100 dark:bg-orange-900/50" : "bg-zinc-100 dark:bg-zinc-800"
                    )}>
                        <Flame className={cn(
                            "h-6 w-6",
                            currentStreak > 0 ? "text-orange-500 fill-orange-500" : "text-zinc-400"
                        )} />
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20 border-yellow-200/50 dark:border-yellow-900/50">
                <CardContent className="p-4 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Longest Streak</p>
                        <h3 className="text-2xl flex items-baseline gap-1 font-bold text-amber-700 dark:text-amber-300">
                            {longestStreak} <span className="text-sm font-normal text-amber-600/70 dark:text-amber-400/70">days</span>
                        </h3>
                    </div>
                    <div className="p-3 rounded-full bg-yellow-100 dark:bg-yellow-900/50">
                        <Trophy className="h-6 w-6 text-yellow-500" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
