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
  Package,
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
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDashboardStats,
  fetchWeeklyTopBooks,
} from "../../store/slices/analyticsSlice";

const Dashboard = () => {
  const dispatch = useDispatch();
  const [timeRange, setTimeRange] = useState("Last 30 Days");
  const {
    revenue: revenueStats,
    engagement: engagementStats,
    weeklyTopBooks,
    loading,
  } = useSelector((state) => state.analytics);

  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && user) {
      dispatch(fetchDashboardStats());
      dispatch(fetchWeeklyTopBooks(5));
    }
  }, [dispatch, isAuthenticated, user, timeRange]);

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    toast.success(`Refreshed data for ${range}`, {
      icon: '🔄',
      style: {
        borderRadius: '12px',
        background: '#333',
        color: '#fff',
        fontWeight: 'bold',
      },
    });
  };

  const handleExport = () => {
    try {
      toast.loading("Preparing CSV export...", { id: "export" });
      
      const headers = ["Metric", "Value"];
      const rows = [
        ["Total Revenue", `₹${(revenue.subscriptionIncome + revenue.ecommerceIncome + revenue.marketplaceCommission || 0)}`],
        ["Subscription Income", `₹${revenue.subscriptionIncome}`],
        ["E-Commerce Income", `₹${revenue.ecommerceIncome}`],
        ["Commission Income", `₹${revenue.marketplaceCommission}`],
        ["Total Users", engagement.totalUsers],
        ["Total Books", engagement.totalBooks],
        ["Date of Export", new Date().toLocaleString()],
        ["Range", timeRange]
      ];

      const csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n"
        + rows.map(r => r.join(",")).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `dashboard_report_${timeRange}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Dashboard report downloaded", { id: "export" });
    } catch (err) {
      toast.error("Failed to export data", { id: "export" });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-40 animate-pulse">
        <Loader2 size={40} className="animate-spin text-primary mb-4" />
        <h2 className="text-lg font-bold text-text-primary tracking-tight">
          Refreshing Dashboard...
        </h2>
        <p className="text-text-secondary text-sm mt-2">Loading latest platform insights</p>
      </div>
    );
  }

  const revenue = revenueStats || {};
  const engagement = engagementStats || {};

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
      icon: <CreditCard size={20} />,
      bgColor: "#62748e",
      isPositive: true,
    },
    {
      label: "Active Users",
      value: engagement.totalUsers?.toLocaleString() || "0",
      trend: "+8.2%",
      icon: <Users size={20} />,
      bgColor: "#62748e",
      isPositive: true,
    },
    {
      label: "Total Sales",
      value: popularBooksData
        .reduce((acc, curr) => acc + curr.sales, 0)
        .toLocaleString(),
      trend: "+15.3%",
      icon: <Zap size={20} />,
      bgColor: "#62748e",
      isPositive: true,
    },
    {
      label: "Library Growth",
      value: engagement.totalBooks?.toLocaleString() || "0",
      trend: "+3.5%",
      icon: <Package size={20} />,
      bgColor: "#62748e",
      isPositive: true,
    },
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface/90 backdrop-blur-md border border-border p-3 rounded-xl shadow-xl">
          <p className="text-xs font-bold text-text-primary uppercase tracking-wider mb-1">
            {payload[0].name}
          </p>
          <p className="text-lg font-black text-primary">
            {typeof payload[0].value === 'number' ? `₹${payload[0].value.toLocaleString()}` : payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/50 pb-6">
        <div>
          <h1 className="text-3xl font-black text-text-primary tracking-tight">
            Dashboard <span className="text-primary">Insights</span>
          </h1>
          <p className="text-text-secondary text-sm font-medium mt-1">
            Real-time performance metrics and growth analytics.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-surface/50 backdrop-blur-sm border border-border p-1.5 rounded-xl shadow-sm">
            {["7d", "30d", "All"].map((range) => (
              <button
                key={range}
                onClick={() => handleTimeRangeChange(range)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-300 ${
                  timeRange === range
                    ? "bg-primary text-white shadow-lg shadow-primary/25 scale-105"
                    : "text-text-secondary hover:text-text-primary hover:bg-background/80"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <button 
            onClick={handleExport}
            className="btn-primary !h-11 !rounded-xl !px-6 !text-xs !bg-primary text-white shadow-lg shadow-primary/25 border border-primary/20 hover:scale-105 active:scale-95 transition-all"
          >
            <Download size={16} />
            Export Data
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainStats.map((s, i) => (
          <div
            key={i}
            className="card-premium group hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5 cursor-default transition-all duration-500"
          >
            <div className="glow-primary opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="flex items-center justify-between relative z-10">
              <div
                className={`w-12 h-12 rounded-2xl text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}
                style={{ backgroundColor: s.bgColor }}
              >
                {s.icon}
              </div>
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black ${
                  s.isPositive 
                    ? "bg-success/10 text-success border border-success/20" 
                    : "bg-error/10 text-error border border-error/20"
                }`}
              >
                {s.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {s.trend}
              </div>
            </div>
            <div className="mt-6 relative z-10">
              <p className="text-xs font-bold text-text-secondary uppercase tracking-[0.1em] mb-1.5 opacity-60">
                {s.label}
              </p>
              <h3 className="text-3xl font-black text-text-primary tracking-tight">
                {s.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Primary Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Breakdown */}
        <div className="lg:col-span-2 card-premium">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
            <div>
              <h3 className="text-xl font-black text-text-primary tracking-tight">
                Revenue Flows
              </h3>
              <p className="text-xs text-text-secondary font-medium mt-0.5">Distribution across key channels</p>
            </div>
            <div className="flex items-center gap-5 bg-background/50 backdrop-blur-sm p-3 rounded-2xl border border-border/50">
              {revenueDistributionData.map((d, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div
                    className="w-3 h-3 rounded-full shadow-sm ring-4 ring-background"
                    style={{ background: REVENUE_COLORS[i] }}
                  />
                  <span className="text-[11px] font-black text-text-secondary uppercase tracking-wider">
                    {d.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-center">
            <div className="md:col-span-2 h-[320px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                    animationBegin={0}
                    animationDuration={1500}
                  >
                    {revenueDistributionData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={REVENUE_COLORS[index]}
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-[0.2em] opacity-40">Total</span>
                <span className="text-xl font-black text-text-primary">₹{(revenue.subscriptionIncome + revenue.ecommerceIncome + revenue.marketplaceCommission || 0).toLocaleString()}</span>
              </div>
            </div>
            <div className="md:col-span-3 flex flex-col gap-4">
              {revenueDistributionData.map((d, i) => {
                const percentage = (d.value / (revenueDistributionData.reduce((a, b) => a + b.value, 0) || 1)) * 100;
                return (
                  <div
                    key={i}
                    className="p-5 rounded-2xl bg-background/40 border border-border shadow-sm hover:shadow-md transition-all duration-300 group"
                  >
                    <div className="flex justify-between items-end mb-3">
                      <div>
                        <span className="text-xs font-black text-text-secondary uppercase tracking-widest opacity-60 group-hover:text-primary transition-colors">
                          {d.name} Income
                        </span>
                        <h4 className="text-lg font-black text-text-primary mt-1">
                          ₹{d.value.toLocaleString()}
                        </h4>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-primary">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2.5 bg-border/40 rounded-full overflow-hidden p-[2px]">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${percentage}%`,
                          background: REVENUE_COLORS[i],
                          boxShadow: `0 0 10px ${REVENUE_COLORS[i]}40`
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Popular Books */}
        <div className="card-premium flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-xl font-black text-text-primary tracking-tight">
                Top Performers
              </h3>
              <p className="text-xs text-text-secondary font-medium mt-0.5">Lifetime sales leader</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Trophy size={20} className="text-amber-500" />
            </div>
          </div>

          <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
            {popularBooksData.length > 0 ? (
              popularBooksData.slice(0, 5).map((book, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-2 rounded-xl border border-transparent hover:border-border hover:bg-background/50 transition-all duration-300 group"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-xs border transition-all duration-300 ${
                    i === 0 ? "bg-amber-500 text-white border-amber-600 shadow-lg shadow-amber-500/20 scale-110" : 
                    i === 1 ? "bg-slate-300 text-slate-700 border-slate-400" :
                    i === 2 ? "bg-orange-200 text-orange-800 border-orange-300" :
                    "bg-background text-text-secondary border-border"
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-bold text-text-primary truncate group-hover:text-primary transition-colors">
                      {book.fullTitle}
                    </h5>
                    <p className="text-[10px] text-text-secondary uppercase font-black tracking-tight opacity-50">
                      {book.author}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-black text-text-primary">
                      {book.sales}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
                <Package size={32} className="text-border mb-3" />
                <p className="text-sm text-text-secondary font-medium">No sales data available</p>
              </div>
            )}
          </div>
          <button className="w-full mt-8 py-3.5 rounded-xl bg-background border border-border text-primary text-xs font-black uppercase tracking-[0.15em] hover:bg-primary hover:text-white transition-all duration-300 shadow-sm">
            View Deep Analytics
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Weekly Top Sellers */}
        <div className="card-premium">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-black text-text-primary tracking-tight">
                  Hot Tractions
                </h3>
                <p className="text-xs text-text-secondary font-medium mt-0.5">Top trending this week</p>
              </div>
            </div>
            <div className="px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-[0.1em]">
               Weekly Pulse
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {weeklyTopBooks.length > 0 ? (
              weeklyTopBooks.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-5 group"
                >
                  <div className="relative shrink-0">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-border bg-background shadow-md group-hover:shadow-xl group-hover:border-primary/30 transition-all duration-500">
                      <img 
                        src={item.book?.thumbnail?.url || item.book?.thumbnail || "https://via.placeholder.com/150"} 
                        alt="" 
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                    <div className="absolute -top-2 -right-2 w-7 h-7 bg-text-primary text-surface rounded-full flex items-center justify-center text-[11px] font-black border-4 border-surface shadow-lg">
                      #{i + 1}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h5 className="text-base font-black text-text-primary truncate group-hover:text-primary transition-colors" title={item.book?.title}>
                      {item.book?.title}
                    </h5>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-text-secondary font-bold uppercase tracking-widest opacity-60">
                        {item.book?.author}
                      </span>
                      <div className="w-1 h-1 rounded-full bg-border" />
                      <span className="flex items-center gap-1 text-[10px] font-black text-success uppercase tracking-widest">
                        <TrendingUp size={10} />
                        Trending
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right shrink-0 bg-background/80 px-4 py-2 rounded-2xl border border-border/50 group-hover:border-primary/20 transition-all">
                    <p className="text-lg font-black text-text-primary">
                      {item.sales_count}
                    </p>
                    <p className="text-[10px] text-text-secondary font-black uppercase tracking-tighter opacity-40">
                      Sales
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-20 text-center">
                <div className="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center mx-auto mb-4 opacity-40">
                  <Package size={24} className="text-text-secondary" />
                </div>
                <p className="text-sm text-text-secondary font-bold uppercase tracking-[0.2em] opacity-40">
                  Quiet Week
                </p>
              </div>
            )}
          </div>
          <button className="btn-primary w-full mt-10 !py-4 shadow-xl shadow-primary/20 bg-text-primary hover:bg-black">
            Generate Performance Report
          </button>
        </div>

        {/* Engagement Benchmarks */}
        <div className="card-premium h-full flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-text-primary tracking-tight flex items-center gap-2">
                <Activity size={20} className="text-primary animate-pulse" />
                Engagement Core
              </h3>
              <p className="text-xs text-text-secondary font-medium mt-0.5">Traffic and interaction distribution</p>
            </div>
            <div className="flex gap-2">
               <button className="p-2.5 rounded-xl border border-border hover:bg-background transition-colors">
                  <Filter size={16} className="text-text-secondary" />
               </button>
            </div>
          </div>
          <div className="h-[320px] w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={popularBooksData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={1} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="4 4"
                  vertical={false}
                  stroke="var(--border)"
                  opacity={0.3}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: "var(--text-secondary)" }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: "var(--text-secondary)" }}
                />
                <Tooltip
                  cursor={{ fill: "var(--background)", opacity: 0.5, radius: [8, 8, 0, 0] }}
                  content={<CustomTooltip />}
                />
                <Bar
                  dataKey="sales"
                  fill="url(#barGradient)"
                  radius={[10, 10, 0, 0]}
                  barSize={40}
                  animationDuration={2000}
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
