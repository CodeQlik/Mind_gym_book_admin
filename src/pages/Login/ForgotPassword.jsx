import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { forgotPassword, clearError } from "../../store/slices/authSlice";
import { Mail, ArrowLeft, Loader2, Send } from "lucide-react";
import Logo from "../../assets/mgblogo.jpeg";
import { toast } from "react-hot-toast";

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    return () => dispatch(clearError());
  }, [dispatch]);

  const formik = useFormik({
    initialValues: { email: "" },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email").required("Required"),
    }),
    onSubmit: async (values) => {
      const result = await dispatch(forgotPassword(values.email));
      if (forgotPassword.fulfilled.match(result)) {
        toast.success(result.payload || "OTP sent to your email!");
        navigate("/verify-otp", { state: { email: values.email } });
      }
    },
  });

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-[#ffffff] font-['Outfit'] overflow-hidden">
      {/* Left side: Branding & Visuals (Consistent with Login) */}
      <div className="hidden lg:flex w-[50%] bg-[#7c3aed] items-center justify-center p-12 relative overflow-hidden h-full">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-black/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 w-full max-w-[480px] bg-white/10 backdrop-blur-md border border-white/20 rounded-[40px] p-12 text-center shadow-2xl">
          <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-10 shadow-lg">
            <img
              draggable="false"
              src={Logo}
              alt="MGB Logo"
              className="w-16 h-16 object-contain"
            />
          </div>
          <h1 className="text-white text-5xl font-bold mb-6 tracking-tight">
            Mind Gym Book
          </h1>
          <p className="text-white/80 text-lg font-medium leading-relaxed max-w-[320px] mx-auto">
            Reset your password and regain access to your mental fitness portal.
          </p>
        </div>

        <div className="absolute bottom-10 left-0 w-full text-center">
          <p className="text-white/40 text-[10px] font-bold tracking-[0.3em] uppercase">
            Administrative Access Portal
          </p>
        </div>
      </div>

      {/* Right side: Forgot Password Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 bg-white h-full overflow-hidden">
        <div className="w-full max-w-[500px] animate-fade-in">
          {/* Header */}
          <div className="mb-8 text-center lg:text-left">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-[#7c3aed] font-medium text-sm mb-6 transition-colors group"
            >
              <ArrowLeft
                size={16}
                className="transition-transform group-hover:-translate-x-1"
              />
              Back to Login
            </Link>
            <h2 className="text-[42px] font-bold text-[#1e1b4b] mb-1 leading-tight tracking-tight">
              Forgot Password?
            </h2>
            <p className="text-slate-400 text-lg font-medium">
              No worries! Enter your email and we'll send you an OTP to reset
              your password.
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
                      SEND OTP
                      <div className="p-1 px-1.5 bg-white/20 rounded-md">
                        <Send
                          size={14}
                          className="transition-transform group-hover:translate-x-0.5"
                        />
                      </div>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
