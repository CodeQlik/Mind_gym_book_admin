import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { loginUser, clearError } from "../../store/slices/authSlice";
import { Mail, Lock, Eye, EyeOff, Loader2, BookMarked } from "lucide-react";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const validationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: (values) => {
      dispatch(loginUser(values));
    },
  });

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-slate-50 dark:bg-[#0f172a] font-['Outfit'] transition-colors duration-500">
      {/* Visual Side - Premium Gradient Background */}
      <div className="hidden lg:flex flex-col items-center justify-center relative overflow-hidden bg-linear-to-br from-indigo-600 via-violet-600 to-indigo-900 p-16 text-white">
        {/* Animated Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-white/10 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[120px] animate-pulse delay-1000"></div>
          <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] bg-indigo-400/20 rounded-full blur-[80px] animate-bounce delay-500 duration-[5000ms]"></div>
        </div>

        <div className="relative z-10 max-w-lg text-center backdrop-blur-sm bg-white/5 p-12 rounded-[3rem] border border-white/10 shadow-2xl">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-inner ring-1 ring-white/30 group">
            <BookMarked
              size={48}
              className="text-white group-hover:scale-110 transition-transform duration-500"
              strokeWidth={1.5}
            />
          </div>
          <h1 className="text-6xl font-black mb-6 tracking-tight drop-shadow-sm">
            Mind Gym Book
          </h1>
          <p className="text-xl text-indigo-100/90 leading-relaxed font-medium tracking-wide">
            Your ultimate destination for mental fitness, knowledge management,
            and growth.
          </p>
        </div>

        <div className="absolute bottom-8 text-indigo-200/60 text-xs font-bold tracking-[0.2em] uppercase">
          Administrative Access Portal
        </div>
      </div>

      {/* Form Side */}
      <div className="flex items-center justify-center p-6 sm:p-12 relative">
        <div className="w-full max-w-[480px] animate-fade-in relative z-10">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
              Welcome Back
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">
              Please enter your details to sign in
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800/50 p-8 sm:p-12 rounded-[2.5rem] shadow-2xl shadow-indigo-500/5 border border-slate-100 dark:border-slate-700/50 relative overflow-hidden">
            {/* Decorative top shimmer */}
            <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-indigo-500 via-purple-500 to-indigo-500"></div>

            <form
              onSubmit={formik.handleSubmit}
              className="space-y-7 relative z-10"
            >
              {error && (
                <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400 rounded-2xl text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-2.5">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-200 ml-1 uppercase tracking-wider text-[0.7rem]">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                    <Mail size={22} strokeWidth={2} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    placeholder="name@company.com"
                    className={`w-full bg-slate-50 dark:bg-slate-900/50 border ${
                      formik.touched.email && formik.errors.email
                        ? "border-rose-500"
                        : "border-slate-200 dark:border-slate-700"
                    } group-focus-within:border-indigo-500 dark:group-focus-within:border-indigo-500 group-focus-within:ring-4 group-focus-within:ring-indigo-500/10 rounded-2xl py-4 pl-14 pr-4 outline-hidden transition-all text-slate-800 dark:text-white placeholder:text-slate-400 font-bold text-sm`}
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                </div>
                {formik.touched.email && formik.errors.email && (
                  <p className="text-rose-500 text-xs font-bold ml-1 italic">
                    {formik.errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider text-[0.7rem]">
                    Password
                  </label>
                  <a
                    href="#"
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                    <Lock size={22} strokeWidth={2} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    className={`w-full bg-slate-50 dark:bg-slate-900/50 border ${
                      formik.touched.password && formik.errors.password
                        ? "border-rose-500"
                        : "border-slate-200 dark:border-slate-700"
                    } group-focus-within:border-indigo-500 dark:group-focus-within:border-indigo-500 group-focus-within:ring-4 group-focus-within:ring-indigo-500/10 rounded-2xl py-4 pl-14 pr-14 outline-hidden transition-all text-slate-800 dark:text-white placeholder:text-slate-400 font-bold text-base tracking-widest`}
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                  />
                  <button
                    type="button"
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors border-none bg-transparent cursor-pointer p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                  </button>
                </div>
                {formik.touched.password && formik.errors.password && (
                  <p className="text-rose-500 text-xs font-bold ml-1 italic">
                    {formik.errors.password}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#6366f1] hover:bg-indigo-700 text-white py-4.5 rounded-2xl font-black text-sm uppercase tracking-[0.15em] shadow-xl shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 border-none cursor-pointer relative overflow-hidden group"
                  disabled={loading}
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-2xl" />
                  <div className="relative flex items-center gap-2">
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        <span>Signing In...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In to Dashboard</span>
                        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                          <BookMarked size={12} strokeWidth={3} />
                        </div>
                      </>
                    )}
                  </div>
                </button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700/50 text-center">
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
                Don't have an account?{" "}
                <button
                  type="button"
                  className="font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors ml-1 cursor-pointer bg-transparent border-none"
                >
                  Contact Admin
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
