"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { MonthlyHistoryData } from "@/app/actions/stats"

interface HistoryCalendarProps {
    history: MonthlyHistoryData[]
    onMonthChange?: (month: Date) => void
}

export function HistoryCalendar({ history, onMonthChange }: HistoryCalendarProps) {
    const router = useRouter()
    const [month, setMonth] = React.useState<Date | undefined>(undefined)

    React.useEffect(() => {
        setMonth(new Date())
    }, [])

    const handleMonthChange = (newMonth: Date) => {
        setMonth(newMonth)
        onMonthChange?.(newMonth)
    }

    const handleDayClick = (day: Date) => {
        const dateStr = day.toLocaleDateString('en-CA')
        router.push(`/?date=${dateStr}`, { scroll: true })
    }

    // Convert string array to Date objects for the calendar
    const fullyCompletedDates = history
        .filter(d => d.isAllCompleted)
        .map(d => {
            // Force pure local date interpretation by splitting
            const [year, m, day] = d.date.split('-').map(Number)
            return new Date(year, m - 1, day)
        })

    const partiallyCompletedDates = history
        .filter(d => !d.isAllCompleted && d.completedCount > 0)
        .map(d => {
            const [year, m, day] = d.date.split('-').map(Number)
            return new Date(year, m - 1, day)
        })

    return (
        <Card className="mt-8">
            <CardHeader>
                <CardTitle>History</CardTitle>
                <CardDescription>Your consistency overview for the month.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-8">
                {month && (
                    <Calendar
                        mode="multiple"
                        month={month}
                        onMonthChange={handleMonthChange}
                        onDayClick={handleDayClick}
                        // Prevent selection mutating internal state, we just view
                        selected={[...fullyCompletedDates, ...partiallyCompletedDates]}
                        modifiers={{
                            fullyCompleted: fullyCompletedDates,
                            partiallyCompleted: partiallyCompletedDates,
                        }}
                        modifiersStyles={{
                            fullyCompleted: {
                                backgroundColor: 'var(--green-500)',
                                color: 'white',
                                fontWeight: 'bold'
                            },
                            partiallyCompleted: {
                                backgroundColor: 'var(--green-900)',
                                color: 'var(--green-400)',
                                opacity: 0.8
                            }
                        }}
                        className="rounded-md border p-4 shadow-sm"
                    />
                )}
            </CardContent>
        </Card>
    )
}
