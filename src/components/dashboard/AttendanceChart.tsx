import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { day: "Mon", hours: 8.5 },
  { day: "Tue", hours: 9.0 },
  { day: "Wed", hours: 7.5 },
  { day: "Thu", hours: 8.0 },
  { day: "Fri", hours: 8.5 },
  { day: "Sat", hours: 0 },
  { day: "Sun", hours: 0 },
];

export function AttendanceChart() {
  return (
    <div className="rounded-xl p-6 shadow-card border bg-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-display font-semibold text-lg text-foreground">
            Weekly Work Hours
          </h3>
          <p className="text-sm text-muted-foreground">
            Your attendance this week
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold font-display text-foreground">41.5h</p>
          <p className="text-sm text-success">+2.5h vs target</p>
        </div>
      </div>

      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(217 91% 60%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(217 91% 60%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              domain={[0, 10]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                boxShadow: "var(--shadow-lg)",
              }}
              labelStyle={{ color: "hsl(var(--foreground))" }}
            />
            <Area
              type="monotone"
              dataKey="hours"
              stroke="hsl(217 91% 60%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorHours)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
