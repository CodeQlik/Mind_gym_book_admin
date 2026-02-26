import React, { useEffect } from "react";
import {
  Users,
  BookOpen,
  TrendingUp,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  MoreVertical,
  Layers,
  ShoppingBag,
  Clock,
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
import { useDispatch, useSelector } from "react-redux";
import { fetchDashboardStats } from "../../store/slices/analyticsSlice";
import { fetchAllUsers } from "../../store/slices/userSlice";
import { fetchSubscriptions } from "../../store/slices/subscriptionSlice";
import { fetchOrders } from "../../store/slices/orderSlice";
import { fetchBooks } from "../../store/slices/bookSlice";

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
      <div
        className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity ${colorType === "primary" ? "bg-primary" : colorType === "amber" ? "bg-amber-500" : colorType === "emerald" ? "bg-emerald-500" : "bg-pink-500"}`}
      />
    </div>
  );
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const {
    revenue,
    engagement,
    loading: analyticsLoading,
  } = useSelector((state) => state.analytics);
  const { totalItems: totalUsers, users } = useSelector((state) => state.users);
  const { subscriptions } = useSelector((state) => state.subscriptions);
  const { totalItems: totalBooks } = useSelector((state) => state.books);
  const { orders } = useSelector((state) => state.orders);

  useEffect(() => {
    dispatch(fetchDashboardStats());
    dispatch(fetchAllUsers({ limit: 5 }));
    dispatch(fetchSubscriptions());
    dispatch(fetchOrders());
    dispatch(fetchBooks({ limit: 1 }));
  }, [dispatch]);

  const activeSubscriptions =
    subscriptions?.filter((s) => s.status === "active")?.length || 0;
  const premiumUsers =
    users?.filter((u) => u.subscription_status === "active")?.length || 0;
  const freeUsers = totalUsers - premiumUsers;

  const totalRevenue =
    (revenue?.subscriptionIncome || 0) + (revenue?.ecommerceIncome || 0);

  // Mock revenue data for charts based on real totals
  const revenueData = [
    { name: "Mon", value: (revenue?.subscriptionIncome || 0) * 0.1 },
    { name: "Tue", value: (revenue?.ecommerceIncome || 0) * 0.15 },
    { name: "Wed", value: (totalRevenue || 0) * 0.12 },
    { name: "Thu", value: (revenue?.subscriptionIncome || 0) * 0.2 },
    { name: "Fri", value: (totalRevenue || 0) * 0.18 },
    { name: "Sat", value: (totalRevenue || 0) * 0.25 },
    { name: "Sun", value: totalRevenue },
  ];

  const recentActivity = [
    ...(users
      ?.slice(0, 3)
      .map((u) => ({ type: "user", name: u.name, time: "Recently joined" })) ||
      []),
    ...(orders?.slice(0, 3).map((o) => ({
      type: "order",
      name: `Order #${o.id}`,
      time: "New order",
    })) || []),
  ]
    .sort(() => Math.random() - 0.5)
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-12 animate-fade-in p-2">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div>
          <h1 className="text-3xl lg:text-4xl font-black text-text-primary tracking-tight font-['Outfit'] leading-[1.1]">
            Management <span className="text-primary italic">Dashboard</span>
          </h1>
          <p className="text-text-secondary mt-2 text-base font-bold opacity-60 max-w-2xl leading-relaxed tracking-tight">
            Comprehensive overview of Mind Gym's performance, user database, and
            revenue streams.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
        <StatCard
          title="Active Readers"
          value={engagement?.activeUsers || 0}
          icon={<Users />}
          trend="up"
          percentage="10"
          colorType="primary"
        />
        <StatCard
          title="Active Subscriptions"
          value={activeSubscriptions}
          icon={<Layers />}
          trend="up"
          percentage="5"
          colorType="amber"
        />
        <StatCard
          title="Total Books"
          value={totalBooks}
          icon={<BookOpen />}
          trend="up"
          percentage="8"
          colorType="emerald"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          icon={<TrendingUp />}
          trend="up"
          percentage="15"
          colorType="pink"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card-premium">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-text-primary tracking-tight">
                Revenue Overview
              </h3>
              <p className="text-xs text-text-secondary font-bold uppercase tracking-widest mt-1">
                Daily progression (Mocked distribution)
              </p>
            </div>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
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
                    borderRadius: "16px",
                    padding: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#6366f1"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-premium">
          <div className="flex items-center gap-2 mb-8">
            <Clock size={20} className="text-primary" />
            <h3 className="text-xl font-black text-text-primary tracking-tight">
              Recent Activity
            </h3>
          </div>
          <div className="flex flex-col gap-6">
            {recentActivity.length > 0 ? (
              recentActivity.map((act, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-background/50 border border-border/50 hover:border-primary/20 transition-all group"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${act.type === "user" ? "bg-indigo-50 text-indigo-500" : "bg-emerald-50 text-emerald-500"}`}
                  >
                    {act.type === "user" ? (
                      <Users size={18} />
                    ) : (
                      <ShoppingBag size={18} />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-text-primary text-sm group-hover:text-primary transition-colors">
                      {act.name}
                    </span>
                    <span className="text-[11px] text-text-secondary font-bold opacity-60">
                      {act.time}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-text-secondary py-10 font-bold opacity-50">
                No recent activity
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="card-premium animate-fade-in p-8">
        <div className="mb-8">
          <h3 className="text-2xl font-black text-text-primary tracking-tight font-['Outfit']">
            Top Selling Books
          </h3>
          <p className="text-xs text-text-secondary font-black uppercase tracking-widest mt-1">
            Based on purchase volume
          </p>
        </div>

        <Table
          columns={[
            {
              header: "Book Title",
              width: "40%",
              render: (row) => (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-16 rounded-lg bg-indigo-50 overflow-hidden flex-shrink-0 border border-border">
                    {row.book?.thumbnail ? (
                      <img
                        src={
                          typeof row.book.thumbnail === "string"
                            ? row.book.thumbnail
                            : row.book.thumbnail?.url || ""
                        }
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="text-primary/20" />
                      </div>
                    )}
                  </div>
                  <span className="font-bold text-text-primary group-hover:text-primary transition-colors text-[15px]">
                    {row.book?.title || "Unknown Book"}
                  </span>
                </div>
              ),
            },
            {
              header: "Author",
              render: (row) => (
                <span className="text-text-secondary font-bold text-[13px]">
                  {row.book?.author || "N/A"}
                </span>
              ),
            },
            {
              header: "Total Sales",
              align: "center",
              render: (row) => (
                <span className="text-text-primary font-black text-sm">
                  {row.sales_count}
                </span>
              ),
            },
          ]}
          data={engagement?.popularBooks || []}
          emptyMessage="No sales data recorded yet."
        />
      </div>
    </div>
  );
};

export default Dashboard;
