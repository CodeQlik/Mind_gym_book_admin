import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { loginUser, clearError } from "../../store/slices/authSlice";
import { Mail, Lock, Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import Logo from "../../assets/mgblogo.jpeg";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, isAuthenticated } = useSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    if (isAuthenticated) navigate("/admin/dashboard");
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
    <div className="h-screen flex flex-col lg:flex-row bg-[#ffffff] font-['Outfit'] overflow-hidden">
      {/* Left side: Branding & Visuals */}
      <div className="hidden lg:flex w-[50%] bg-[#7c3aed] items-center justify-center p-12 relative overflow-hidden h-full">
        {/* Background Decorative Circles */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-black/10 rounded-full blur-3xl"></div>

        {/* Glassmorphism Card */}
        <div className="relative z-10 w-full max-w-[480px] bg-white/10 backdrop-blur-md border border-white/20 rounded-[40px] p-12 text-center shadow-2xl">
          <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-lg">
            <img
              src={Logo}
              alt="MGB Logo"
              className="w-16 h-16 object-contain"
            />
          </div>
          <h1 className="text-white text-5xl font-bold mb-6 tracking-tight">
            Mind Gym Book
          </h1>
          <p className="text-white/80 text-lg font-medium leading-relaxed max-w-[320px] mx-auto">
            Your ultimate destination for mental fitness, knowledge management,
            and growth.
          </p>
        </div>

        {/* Footer Text on Left Side */}
        <div className="absolute bottom-10 left-0 w-full text-center">
          <p className="text-white/40 text-[10px] font-bold tracking-[0.3em] uppercase">
            Administrative Access Portal
          </p>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 bg-white h-full overflow-hidden">
        <div className="w-full max-w-[500px] animate-fade-in">
          {/* Header */}
          <div className="mb-8 text-center lg:text-left">
            <h2 className="text-[42px] font-bold text-[#1e1b4b] mb-1 leading-tight tracking-tight">
              Welcome Back
            </h2>
            <p className="text-slate-400 text-lg font-medium">
              Please enter your details to sign in
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-100 border-t-[5px] border-t-[#7c3aed] p-10 lg:p-12 relative">
            <form onSubmit={formik.handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-500 rounded-2xl text-sm font-medium animate-shake">
                  {error}
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block px-1">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#7c3aed] transition-colors">
                    <Mail size={18} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    placeholder="name@company.com"
                    className={`w-full h-[54px] bg-slate-50 border border-transparent rounded-[18px] pl-14 pr-6 text-[#1e1b4b] font-medium placeholder:text-slate-300 focus:bg-white focus:border-[#7c3aed]/20 focus:ring-4 focus:ring-[#7c3aed]/5 transition-all outline-none ${
                      formik.touched.email && formik.errors.email
                        ? "bg-red-50 border-red-200"
                        : ""
                    }`}
                    {...formik.getFieldProps("email")}
                  />
                </div>
                {formik.touched.email && formik.errors.email && (
                  <p className="text-red-500 text-[10px] font-bold mt-1 px-1 uppercase tracking-wider">
                    {formik.errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    Password
                  </label>
                  <Link
                    to="/admin/forgot-password"
                    className="text-[11px] font-bold text-[#7c3aed] hover:underline tracking-tight"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#7c3aed] transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    className={`w-full h-[54px] bg-slate-50 border border-transparent rounded-[18px] pl-14 pr-14 text-[#1e1b4b] font-medium placeholder:text-slate-300 focus:bg-white focus:border-[#7c3aed]/20 focus:ring-4 focus:ring-[#7c3aed]/5 transition-all outline-none ${
                      formik.touched.password && formik.errors.password
                        ? "bg-red-50 border-red-200"
                        : ""
                    }`}
                    {...formik.getFieldProps("password")}
                  />
                  <button
                    type="button"
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#7c3aed] transition-all"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {formik.touched.password && formik.errors.password && (
                  <p className="text-red-500 text-[10px] font-bold mt-1 px-1 uppercase tracking-wider">
                    {formik.errors.password}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full h-[60px] bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-[20px] font-bold text-[13px] uppercase tracking-[0.15em] shadow-[0_10px_30px_rgba(99,102,241,0.2)] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>
                      SIGN IN TO DASHBOARD
                      <div className="p-1 px-1.5 bg-white/20 rounded-md">
                        <LogIn
                          size={14}
                          className="transition-transform group-hover:translate-x-0.5"
                        />
                      </div>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center">
              <p className="text-slate-400 text-[13px] font-medium">
                Don't have an account?{" "}
                <button className="text-[#7c3aed] font-bold hover:underline transition-all">
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
