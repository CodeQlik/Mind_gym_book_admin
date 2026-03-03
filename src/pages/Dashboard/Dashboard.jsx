import React, { useState, useEffect } from "react";
import {
  Download,
  TrendingUp,
  Zap,
  Clock,
  PieChart as PieChartIcon,
  Users,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Loader2,
  Trophy,
  Activity,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { analyticsApi } from "../../api/analyticsApi";
import { toast } from "react-hot-toast";

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState("Last 30 Days");
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await analyticsApi.getDashboardStats();
        if (res.success) {
          setStatsData(res.data);
        }
      } catch (error) {
        console.error("Dashboard data fetch failed", error);
        toast.error("Failed to load dashboard statistics");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 animate-pulse">
        <Loader2 size={40} className="animate-spin text-primary mb-4" />
        <h2 className="text-lg font-bold text-text-primary">
          Loading Dashboard...
        </h2>
      </div>
    );
  }

  const revenue = statsData?.revenue || {};
  const engagement = statsData?.engagement || {};

  const revenueDistributionData = [
    { name: "Subscription", value: revenue.subscriptionIncome || 0 },
    { name: "E-Commerce", value: revenue.ecommerceIncome || 0 },
    { name: "Commission", value: revenue.marketplaceCommission || 0 },
  ];

  const REVENUE_COLORS = ["#6366f1", "#ec4899", "#f59e0b"];

  const popularBooksData = (engagement.popularBooks || []).map((item) => ({
    name: item.book?.title?.substring(0, 15) + "...",
    sales: parseInt(item.sales_count),
    fullTitle: item.book?.title,
    author: item.book?.author,
  }));

  const mainStats = [
    {
      label: "Gross Revenue",
      value: `₹${(revenue.subscriptionIncome + revenue.ecommerceIncome + revenue.marketplaceCommission || 0).toLocaleString()}`,
      trend: "+12.5%",
      icon: <CreditCard size={18} />,
      color: "bg-slate-500",
      isPositive: true,
    },
    {
      label: "Active Members",
      value: engagement.activeUsers?.toLocaleString() || "0",
      trend: "+8.2%",
      icon: <Users size={18} />,
      color: "bg-slate-500",
      isPositive: true,
    },
    {
      label: "Book Purchases",
      value: popularBooksData
        .reduce((acc, curr) => acc + curr.sales, 0)
        .toLocaleString(),
      trend: "+15.3%",
      icon: <Zap size={18} />,
      color: "bg-slate-500",
      isPositive: true,
    },
    {
      label: "Retention",
      value: "84.2%",
      trend: "+0.5%",
      icon: <Activity size={18} />,
      color: "bg-slate-500",
      isPositive: true,
    },
  ];

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-10">
      {/* Simple Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Track your platform's performance and user engagement.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-surface border border-border p-1 rounded-lg">
            {["7d", "30d", "All"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  timeRange === range
                    ? "bg-primary text-white shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-text-primary text-surface font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-all">
            <Download size={14} />
            Export
          </button>
        </div>
      </div>

      {/* Simple Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mainStats.map((s, i) => (
          <div
            key={i}
            className="bg-surface p-5 rounded-lg border border-border shadow-sm flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <div
                className={`w-10 h-10 rounded-lg ${s.color} text-white flex items-center justify-center shadow-sm`}
              >
                {s.icon}
              </div>
              <div
                className={`flex items-center gap-1 text-[11px] font-bold ${s.isPositive ? "text-success" : "text-error"}`}
              >
                {s.isPositive ? (
                  <ArrowUpRight size={14} />
                ) : (
                  <ArrowDownRight size={14} />
                )}
                {s.trend}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-text-secondary uppercase tracking-wider opacity-70">
                {s.label}
              </p>
              <h3 className="text-2xl font-bold text-text-primary mt-1">
                {s.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Breakdown */}
        <div className="lg:col-span-2 bg-surface border border-border p-6 rounded-lg shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-lg font-bold text-text-primary">
              Revenue Breakdown
            </h3>
            <div className="flex items-center gap-4 bg-background/50 p-2 rounded-lg">
              {revenueDistributionData.map((d, i) => (
                <div key={i} className="flex items-center gap-2 px-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: REVENUE_COLORS[i] }}
                  />
                  <span className="text-[10px] font-bold text-text-secondary uppercase tracking-tight">
                    {d.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-1 h-[220px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {revenueDistributionData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={REVENUE_COLORS[index]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="md:col-span-2 flex flex-col gap-4">
              {revenueDistributionData.map((d, i) => (
                <div
                  key={i}
                  className="p-4 rounded-lg bg-background/50 border border-border"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-text-secondary uppercase">
                      {d.name} Income
                    </span>
                    <span className="text-sm font-bold text-text-primary">
                      ₹{d.value.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${(d.value / (revenueDistributionData.reduce((a, b) => a + b.value, 0) || 1)) * 100}%`,
                        background: REVENUE_COLORS[i],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Popular Books */}
        <div className="bg-surface border border-border p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-text-primary">
              Popular Books
            </h3>
            <Trophy size={18} className="text-amber-500" />
          </div>

          <div className="flex flex-col gap-4">
            {popularBooksData.length > 0 ? (
              popularBooksData.map((book, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 py-2 border-b border-border/50 last:border-none"
                >
                  <div className="w-8 h-8 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-xs">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-bold text-text-primary truncate">
                      {book.fullTitle}
                    </h5>
                    <p className="text-[10px] text-text-secondary uppercase font-bold opacity-60">
                      {book.author}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-text-primary">
                      {book.sales}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-text-secondary text-sm">
                No sales data yet.
              </div>
            )}
          </div>
          <button className="w-full mt-6 py-2 rounded-lg bg-background text-primary text-xs font-bold hover:bg-primary/5 transition-all border border-primary/10">
            View Analytics
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Audiobook activity placeholder */}
        <div className="bg-surface border border-border p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
              <PieChartIcon size={18} className="text-primary" />
              Listener Activity
            </h3>
            <Activity
              size={18}
              className="text-primary opacity-40 animate-pulse"
            />
          </div>
          <div className="h-[200px] flex items-center justify-center border-2 border-dashed border-border rounded-lg bg-background/30 text-center px-4">
            <p className="text-sm text-text-secondary font-medium opacity-60">
              Audiobook activity processing... Statistics will be available
              soon.
            </p>
          </div>
        </div>

        {/* Engagement bar chart */}
        <div className="bg-surface border border-border p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-text-primary">
              Engagement Benchmarks
            </h3>
            <Filter size={16} className="text-text-secondary opacity-40" />
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={popularBooksData}>
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
                  tick={{ fontSize: 10, fill: "var(--text-secondary)" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "var(--text-secondary)" }}
                />
                <Tooltip
                  cursor={{ fill: "var(--background)", opacity: 0.4 }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar
                  dataKey="sales"
                  fill="var(--primary)"
                  radius={[4, 4, 0, 0]}
                  barSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
