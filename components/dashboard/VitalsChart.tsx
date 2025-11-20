"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface VitalsChartProps {
    data: any[];
    type: "bp" | "glucose" | "weight" | "heart_rate";
    title: string;
    color: string;
}

export function VitalsChart({ data, type, title, color }: VitalsChartProps) {
    // Filter data by type and sort by date
    const chartData = data
        .filter((d) => d.type === type)
        .sort((a, b) => a.date - b.date)
        .map((d) => ({
            date: format(new Date(d.date), "MMM d"),
            value: parseFloat(d.value), // Assuming value is numeric string for these types
            unit: d.unit,
        }));

    if (chartData.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>No data available</CardDescription>
                </CardHeader>
                <CardContent className="h-[200px] flex items-center justify-center text-muted-foreground">
                    No recordings found.
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>Recent trends</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                            <XAxis
                                dataKey="date"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `${value}`}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
                                itemStyle={{ color: "hsl(var(--foreground))" }}
                            />
                            <Line
                                type="monotone"
                                dataKey="value"
                                stroke={color}
                                strokeWidth={2}
                                dot={{ r: 4, fill: color }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
