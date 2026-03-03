import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { loginUser, clearError } from "../../store/slices/authSlice";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import Logo from "../../assets/mgblogo.jpeg";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard");
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => dispatch(clearError());
  }, [dispatch]);

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email").required("Required"),
      password: Yup.string().min(6, "Min 6 chars").required("Required"),
    }),
    onSubmit: (values) => dispatch(loginUser(values)),
  });

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background font-['Outfit']">
      {/* Brand Side */}
      <div className="hidden lg:flex flex-col items-center justify-center bg-primary p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-primary-hover opacity-50 blur-[100px] -translate-y-1/2" />
        <div className="relative z-10 text-center max-w-sm">
          <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl p-3 transform transition-transform hover:scale-105">
            <img
              src={Logo}
              alt="MGB Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h1 className="text-5xl font-extrabold mb-6 tracking-tight">
            Mind Gym Book
          </h1>
          <p className="text-indigo-100 text-lg leading-relaxed opacity-90 font-medium">
            Professional Admin Panel for mental fitness and knowledge
            management.
          </p>
        </div>
      </div>

      {/* Login Side */}
      <div className="flex items-center justify-center p-8 bg-slate-50/50">
        <div className="w-full max-w-[440px] animate-fade-in">
          <div className="mb-10 text-center sm:text-left">
            <h2 className="text-3xl font-bold text-text-primary tracking-tight mb-2">
              Welcome Back
            </h2>
            <p className="text-text-secondary text-base">
              Please sign in to your administrator account
            </p>
          </div>

          <div className="bg-surface p-10 rounded-2xl border border-border shadow-xl shadow-indigo-500/10">
            <form onSubmit={formik.handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-error-surface border border-error/20 text-error rounded-xl text-sm font-semibold flex items-center gap-3 animate-shake">
                  <div className="w-2 h-2 rounded-full bg-error" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-text-secondary uppercase tracking-widest block px-1">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail
                    size={18}
                    className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                      formik.touched.email && formik.errors.email
                        ? "text-error"
                        : "text-text-secondary opacity-40 group-focus-within:text-primary group-focus-within:opacity-100"
                    }`}
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    className={`input-field !pl-12 !h-12 !text-base transition-all duration-200 ${
                      formik.touched.email && formik.errors.email
                        ? "border-error focus:ring-4 focus:ring-error/10"
                        : "hover:border-primary/50 focus:ring-4 focus:ring-primary/10"
                    }`}
                    {...formik.getFieldProps("email")}
                  />
                </div>
                {formik.touched.email && formik.errors.email && (
                  <p className="text-error text-xs mt-1 px-1 font-medium">
                    {formik.errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <label className="text-xs font-bold text-text-secondary uppercase tracking-widest">
                    Password
                  </label>
                  <a
                    href="#"
                    className="text-xs font-bold text-primary hover:text-primary-hover transition-colors"
                  >
                    Forgot?
                  </a>
                </div>
                <div className="relative group">
                  <Lock
                    size={18}
                    className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
                      formik.touched.password && formik.errors.password
                        ? "text-error"
                        : "text-text-secondary opacity-40 group-focus-within:text-primary group-focus-within:opacity-100"
                    }`}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    className={`input-field !pl-12 !pr-12 !h-12 !text-base transition-all duration-200 ${
                      formik.touched.password && formik.errors.password
                        ? "border-error focus:ring-4 focus:ring-error/10"
                        : "hover:border-primary/50 focus:ring-4 focus:ring-primary/10"
                    }`}
                    {...formik.getFieldProps("password")}
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary opacity-40 hover:text-primary hover:opacity-100 transition-all"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {formik.touched.password && formik.errors.password && (
                  <p className="text-error text-xs mt-1 px-1 font-medium">
                    {formik.errors.password}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="btn-primary w-full h-12 uppercase text-sm font-extrabold tracking-widest shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  "Sign In to Dashboard"
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-border text-center">
              <p className="text-text-secondary text-[11px] font-bold uppercase tracking-[0.15em] opacity-60">
                Contact IT department for access
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
