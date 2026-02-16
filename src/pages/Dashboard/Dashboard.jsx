import React from "react";
import {
  Users,
  BookOpen,
  TrendingUp,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
} from "recharts";
import Table from "../../components/Table/Table";

const data = [
  { name: "Jan", value: 400 },
  { name: "Feb", value: 300 },
  { name: "Mar", value: 600 },
  { name: "Apr", value: 800 },
  { name: "May", value: 500 },
  { name: "Jun", value: 700 },
  { name: "Jul", value: 900 },
];

const bookSales = [
  { name: "Mon", sales: 40 },
  { name: "Tue", sales: 60 },
  { name: "Wed", sales: 45 },
  { name: "Thu", sales: 90 },
  { name: "Fri", sales: 75 },
  { name: "Sat", sales: 120 },
  { name: "Sun", sales: 85 },
];

const StatCard = ({ title, value, icon, trend, percentage, colorType }) => {
  const colorClasses = {
    primary: "text-primary bg-indigo-50 dark:bg-primary/10",
    amber: "text-amber-600 bg-amber-50 dark:bg-amber-500/10",
    emerald: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10",
    pink: "text-pink-600 bg-pink-50 dark:bg-pink-500/10",
  };

  const textColorClasses = {
    primary: "text-primary dark:text-indigo-400",
    amber: "text-amber-600 dark:text-amber-500",
    emerald: "text-emerald-600 dark:text-emerald-500",
    pink: "text-pink-600 dark:text-pink-500",
  };

  const trendColorClasses = {
    primary: "text-primary bg-indigo-50 dark:bg-primary/10",
    amber: "text-amber-600 bg-amber-50 dark:bg-amber-500/10",
    emerald: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10",
    pink: "text-pink-600 bg-pink-50 dark:bg-pink-500/10",
  };

  return (
    <div className="bg-surface p-9 rounded-[2.8rem] border border-border shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 group relative overflow-hidden">
      <div className="flex justify-between items-start mb-14">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${colorClasses[colorType]}`}
        >
          {React.cloneElement(icon, { size: 28, strokeWidth: 2.5 })}
        </div>
        <div
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[12px] font-black tracking-tight ${trendColorClasses[colorType]}`}
        >
          {trend === "up" ? (
            <ArrowUpRight size={14} strokeWidth={3} />
          ) : (
            <ArrowDownRight size={14} strokeWidth={3} />
          )}
          {percentage}%
        </div>
      </div>
      <div className="flex flex-col">
        <h3
          className={`text-[2.75rem] font-black tracking-tighter leading-none mb-2 font-['Outfit'] ${textColorClasses[colorType]}`}
        >
          {value}
        </h3>
        <p className="text-[11px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-70">
          {title}
        </p>
      </div>

      {/* Subtle Bottom Glow */}
      <div
        className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity ${colorType === "primary" ? "bg-primary" : colorType === "amber" ? "bg-amber-500" : colorType === "emerald" ? "bg-emerald-500" : "bg-pink-500"}`}
      />
    </div>
  );
};

const Dashboard = () => {
  return (
    <div className="flex flex-col gap-12 animate-fade-in p-2">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-text-primary tracking-tight font-['Outfit'] leading-[1.1]">
            Welcome Back, <span className="text-primary italic">Admin</span>
          </h1>
          <p className="text-text-secondary mt-2 text-base font-bold opacity-60 max-w-2xl leading-relaxed tracking-tight">
            Your command center is ready. Here's a quick overview of Mind Gym's
            performance metrics for today.
          </p>
        </div>
        <button className="bg-[#6366f1] hover:bg-indigo-600 text-white px-6 py-3.5 rounded-xl font-black shadow-xl shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2 w-fit text-xs uppercase tracking-[0.12em] whitespace-nowrap">
          <TrendingUp size={18} strokeWidth={3} /> Download Report
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
        <StatCard
          title="Total Readers"
          value="12,482"
          icon={<Users />}
          trend="up"
          percentage="12.5"
          colorType="primary"
        />
        <StatCard
          title="Books Published"
          value="148"
          icon={<BookOpen />}
          trend="up"
          percentage="4.2"
          colorType="amber"
        />
        <StatCard
          title="Avg. Daily Visits"
          value="2,840"
          icon={<Eye />}
          trend="up"
          percentage="8.1"
          colorType="emerald"
        />
        <StatCard
          title="Monthly Revenue"
          value="$14,230"
          icon={<TrendingUp />}
          trend="down"
          percentage="3.4"
          colorType="pink"
        />
      </div>

      {/* Statistics Grid */}
      <div
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-slide-up"
        style={{ animationDelay: "0.2s" }}
      >
        <div className="card-premium">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-text-primary tracking-tight">
                Reader Engagement
              </h3>
              <p className="text-xs text-text-secondary font-bold uppercase tracking-widest mt-1">
                Monthly progression
              </p>
            </div>
            <button className="action-btn bg-background/50 text-text-secondary hover:text-primary">
              <MoreVertical size={20} />
            </button>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border)"
                  opacity={0.3}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "var(--text-secondary)",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "var(--text-secondary)",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--surface)",
                    borderColor: "var(--border)",
                    color: "var(--text-primary)",
                    borderRadius: "16px",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                    border: "1px solid var(--border)",
                    padding: "12px",
                    fontWeight: 800,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#6366f1"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-premium">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-text-primary tracking-tight">
                Weekly Sales
              </h3>
              <p className="text-xs text-text-secondary font-bold uppercase tracking-widest mt-1">
                Daily throughput
              </p>
            </div>
            <button className="action-btn bg-background/50 text-text-secondary hover:text-primary">
              <MoreVertical size={20} />
            </button>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bookSales}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="var(--border)"
                  opacity={0.3}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "var(--text-secondary)",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: "var(--text-secondary)",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                />
                <Tooltip
                  cursor={{ fill: "var(--primary)", opacity: 0.05 }}
                  contentStyle={{
                    backgroundColor: "var(--surface)",
                    borderColor: "var(--border)",
                    borderRadius: "16px",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                    border: "1px solid var(--border)",
                    padding: "12px",
                    fontWeight: 800,
                  }}
                />
                <Bar dataKey="sales" radius={[8, 8, 8, 8]} barSize={40}>
                  {bookSales.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        [
                          "#6366f1", // Indigo
                          "#8b5cf6", // Violet
                          "#ec4899", // Pink
                          "#f43f5e", // Rose
                          "#f59e0b", // Amber
                          "#10b981", // Emerald
                          "#06b6d4", // Cyan
                        ][index % 7]
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Performing Books Section */}
      <div
        className="card-premium animate-fade-in p-8"
        style={{ animationDelay: "0.4s" }}
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-black text-text-primary tracking-tight font-['Outfit']">
              Top Performing Books
            </h3>
            <p className="text-xs text-text-secondary font-black uppercase tracking-widest mt-1">
              Real-time performance metrics
            </p>
          </div>
          <button className="px-6 py-2.5 rounded-xl bg-primary/10 text-primary font-black text-sm hover:bg-primary hover:text-white transition-all">
            View All Library
          </button>
        </div>

        <Table
          columns={[
            {
              header: "Book Title",
              width: "30%",
              render: (row) => (
                <span className="font-bold text-text-primary group-hover:text-primary transition-colors text-[15px]">
                  {row.title}
                </span>
              ),
            },
            {
              header: "Category",
              render: (row) => (
                <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold uppercase tracking-wide border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
                  {row.cat}
                </span>
              ),
            },
            {
              header: "Sales",
              render: (row) => (
                <span className="text-text-primary font-black text-sm">
                  {row.sales}
                </span>
              ),
            },
            {
              header: "Status",
              render: (row) => (
                <div
                  className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] w-fit text-center transition-all duration-300 shadow-sm border ${
                    row.status === "Active"
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-emerald-500/5"
                      : "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-amber-500/5"
                  }`}
                >
                  {row.status}
                </div>
              ),
            },
            {
              header: "Author",
              render: (row) => (
                <span className="text-text-secondary font-bold text-[13px] italic">
                  {row.author}
                </span>
              ),
            },
          ]}
          data={[
            {
              title: "Mind over Matter",
              cat: "Psychology",
              sales: "1,240",
              status: "Active",
              author: "Dr. John Doe",
            },
            {
              title: "Inner Peace",
              cat: "Self-Help",
              sales: "980",
              status: "Active",
              author: "Sarah Wilson",
            },
            {
              title: "The Focus Era",
              cat: "Productivity",
              sales: "850",
              status: "Draft",
              author: "Mike Ross",
            },
          ]}
        />
      </div>
    </div>
  );
};

export default Dashboard;
