import React, { useState, useEffect } from "react";
import {
  Download,
  TrendingUp,
  Zap,
  AlertCircle,
  Clock,
  PieChart as PieChartIcon,
  Users,
  CreditCard,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Calendar,
  Filter,
  Loader2,
  Trophy,
  Activity,
} from "lucide-react";
import {
  LineChart,
  Line,
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
  Legend,
} from "recharts";
import { analyticsApi } from "../../api/analyticsApi";
import { toast } from "react-hot-toast";

const Analytics = () => {
  const [timeRange, setTimeRange] = useState("Last 30 Days");
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIntelligence = async () => {
      try {
        setLoading(true);
        const res = await analyticsApi.getDashboardStats();
        if (res.success) {
          setStatsData(res.data);
        }
      } catch (error) {
        console.error("Dashboard Intelligence Sync Failed", error);
        toast.error("Failed to sync live data stream");
      } finally {
        setLoading(false);
      }
    };

    fetchIntelligence();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 animate-pulse font-['Outfit']">
        <Loader2 size={48} className="animate-spin text-primary mb-6" />
        <h2 className="text-xl font-black text-text-primary italic tracking-tight">
          Synchronizing{" "}
          <span className="text-primary not-italic">Intelligence...</span>
        </h2>
      </div>
    );
  }

  const revenue = statsData?.revenue || {};
  const engagement = statsData?.engagement || {};

  // Revenue Distribution for Pie Chart
  const revenueDistributionData = [
    { name: "Subscription", value: revenue.subscriptionIncome || 0 },
    { name: "E-Commerce", value: revenue.ecommerceIncome || 0 },
    { name: "Commission", value: revenue.marketplaceCommission || 0 },
  ];

  const REVENUE_COLORS = ["#6366f1", "#ec4899", "#f59e0b"];

  // Popular Books Transformation
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
      icon: <CreditCard size={20} />,
      color: "bg-indigo-500",
      isPositive: true,
    },
    {
      label: "Active Members",
      value: engagement.activeUsers?.toLocaleString() || "0",
      trend: "+8.2%",
      icon: <Users size={20} />,
      color: "bg-emerald-500",
      isPositive: true,
    },
    {
      label: "Book Purchases",
      value: popularBooksData
        .reduce((acc, curr) => acc + curr.sales, 0)
        .toLocaleString(),
      trend: "+15.3%",
      icon: <Zap size={20} />,
      color: "bg-rose-500",
      isPositive: true,
    },
    {
      label: "Retention",
      value: "84.2%",
      trend: "+0.5%",
      icon: <Activity size={20} />,
      color: "bg-amber-500",
      isPositive: true,
    },
  ];

  return (
    <div className="flex flex-col gap-10 animate-fade-in font-['Outfit'] pb-20 text-left">
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-lg shadow-primary/5">
              <TrendingUp size={20} />
            </div>
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">
              Executive Intelligence Hub
            </span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-text-primary tracking-tight leading-none italic">
            Visual <span className="text-primary not-italic">Intelligence</span>
          </h1>
          <p className="text-text-secondary mt-3 text-sm font-bold opacity-60 max-w-lg">
            Real-time analytics for subscription flows, e-commerce, and member
            engagement.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center bg-surface border border-border p-1.5 rounded-2xl shadow-sm">
            {["Last 7 Days", "Last 30 Days", "All Time"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  timeRange === range
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-text-secondary hover:text-text-primary hover:bg-background"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-text-primary text-white font-black text-[10px] uppercase tracking-widest hover:bg-primary transition-all shadow-xl shadow-primary/10">
            <Download size={16} />
            Export Data Sheet
          </button>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainStats.map((s, i) => (
          <div
            key={i}
            className="bg-surface p-8 rounded-[2.5rem] border border-border shadow-sm group hover:border-primary/20 transition-all duration-500 relative overflow-hidden"
          >
            <div
              className={`absolute top-0 right-0 w-24 h-24 ${s.color} opacity-[0.03] rounded-full translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-700`}
            />
            <div className="relative z-10 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div
                  className={`w-12 h-12 rounded-2xl ${s.color} text-white flex items-center justify-center shadow-lg`}
                >
                  {s.icon}
                </div>
                <div
                  className={`flex items-center gap-1 text-[10px] font-black ${s.isPositive ? "text-emerald-500" : "text-rose-500"}`}
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
                <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em] mb-1 opacity-60">
                  {s.label}
                </p>
                <h3 className="text-3xl font-black text-text-primary italic">
                  {s.value}
                </h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Analytics: Subscription vs Ecommerce vs Commission */}
        <div className="lg:col-span-2 bg-surface border border-border p-10 rounded-[3rem] shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h3 className="text-xl font-black text-text-primary italic tracking-tight uppercase flex items-center gap-3">
                <div className="w-2 h-6 bg-primary rounded-full shadow-lg shadow-primary/30" />
                Revenue Breakdown
              </h3>
              <p className="text-[10px] font-bold text-text-secondary tracking-widest uppercase mt-1 opacity-60">
                Subscription Income vs Marketplace vs Retail
              </p>
            </div>
            <div className="flex items-center gap-4 bg-background/50 p-2 rounded-2xl border border-border">
              {revenueDistributionData.map((d, i) => (
                <div key={i} className="flex items-center gap-2 px-3">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: REVENUE_COLORS[i] }}
                  />
                  <span className="text-[9px] font-black text-text-secondary uppercase tracking-tighter">
                    {d.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
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
                      borderRadius: "20px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 hidden md:block text-center pointer-events-none">
                <p className="text-[10px] font-black text-text-secondary uppercase opacity-50">
                  Total
                </p>
                <p className="text-xl font-black text-text-primary italic">
                  Intelligence
                </p>
              </div>
            </div>
            <div className="space-y-6">
              {revenueDistributionData.map((d, i) => (
                <div
                  key={i}
                  className="p-6 rounded-3xl bg-background/40 border border-border hover:border-primary/20 transition-all duration-300"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black text-text-secondary uppercase tracking-widest">
                      {d.name} আয়
                    </span>
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center"
                      style={{
                        background: `${REVENUE_COLORS[i]}20`,
                        color: REVENUE_COLORS[i],
                      }}
                    >
                      <ArrowUpRight size={16} />
                    </div>
                  </div>
                  <h4 className="text-2xl font-black text-text-primary italic">
                    ₹{d.value.toLocaleString()}
                  </h4>
                  <div className="w-full h-1.5 bg-border rounded-full mt-4 overflow-hidden">
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

        {/* User Engagement: Popular Books */}
        <div className="space-y-8">
          <div className="bg-surface border border-border p-8 rounded-[3rem] shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-[11px] font-black text-text-secondary uppercase tracking-[0.2em] opacity-60">
                Popular Books
              </h4>
              <Trophy size={20} className="text-amber-500" />
            </div>

            <div className="space-y-6">
              {popularBooksData.length > 0 ? (
                popularBooksData.map((book, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                      <span className="text-xs font-black">0{i + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-[13px] font-black text-text-primary line-clamp-1 group-hover:text-primary transition-colors italic">
                        {book.fullTitle}
                      </h5>
                      <p className="text-[10px] font-bold text-text-secondary uppercase tracking-widest opacity-60">
                        {book.author}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-text-primary">
                        {book.sales}
                      </p>
                      <p className="text-[9px] font-black text-emerald-500 uppercase tracking-tighter">
                        Sales
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center text-text-secondary opacity-40 italic">
                  No sales data available yet.
                </div>
              )}
            </div>

            <button className="w-full mt-8 py-4 rounded-2xl bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all border border-primary/10">
              View Full Library Engagement
            </button>
          </div>

          <div className="bg-text-primary p-8 rounded-[3rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
            <h4 className="text-white text-xl font-black italic tracking-tight leading-tight mb-4 relative z-10">
              User <br /> Engagement <br /> Opportunities
            </h4>
            <p className="text-white/60 text-[11px] font-bold leading-relaxed mb-6 relative z-10">
              Active users represent{" "}
              {((engagement.activeUsers / 5000) * 100).toFixed(1)}% of your
              registered base. Target "Inactive" users with personalized
              notification pushes.
            </p>
            <button className="btn-primary !bg-white !text-text-primary !border-none !rounded-xl text-[10px] font-black uppercase tracking-widest relative z-10 w-full py-3 shadow-xl hover:-translate-y-1 transition-transform">
              Send Engagement Push
            </button>
          </div>
        </div>
      </div>

      {/* Popular Audiobooks Section (Placeholder for now) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-surface border border-border p-10 rounded-[3rem] shadow-sm">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-black text-text-primary italic tracking-tight uppercase flex items-center gap-3">
                <PieChartIcon size={24} className="text-primary" />
                Top Listeners Activity
              </h3>
              <p className="text-[10px] font-bold text-text-secondary tracking-widest uppercase mt-1 opacity-60">
                Most listened audiobooks stream
              </p>
            </div>
            <Activity size={20} className="text-primary animate-pulse" />
          </div>

          <div className="h-[250px] flex items-center justify-center border-2 border-dashed border-border rounded-[2rem] bg-background/30 px-10 text-center">
            <div className="max-w-xs space-y-4">
              <p className="text-sm font-bold text-text-secondary leading-relaxed opacity-60 italic">
                The Voice Processing Engine is currently cataloging your
                audiobook records. Live streaming stats will appear here
                shortly.
              </p>
              <div className="w-full h-1 bg-border rounded-full overflow-hidden">
                <div className="w-1/3 h-full bg-primary animate-progress-loop" />
              </div>
            </div>
          </div>
        </div>

        {/* Engagement Benchmarks Bar Chart - using Popular Books Sales */}
        <div className="bg-surface border border-border p-10 rounded-[3rem] shadow-sm">
          <h3 className="text-xl font-black text-text-primary italic uppercase tracking-tight mb-10 flex items-center justify-between">
            Engagement Benchmarks (Book Sales)
            <Filter size={18} className="text-primary opacity-30" />
          </h3>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={popularBooksData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 900, fill: "#64748b" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 900, fill: "#64748b" }}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc", radius: "10" }}
                  contentStyle={{
                    borderRadius: "20px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar
                  dataKey="sales"
                  fill="#6366f1"
                  radius={[10, 10, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
