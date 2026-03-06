import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { resetPassword, clearError } from "../../store/slices/authSlice";
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Save,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import Logo from "../../assets/mgblogo.jpeg";
import { toast } from "react-hot-toast";

const ResetPassword = () => {
  const { token } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    return () => dispatch(clearError());
  }, [dispatch]);

  const formik = useFormik({
    initialValues: { password: "", confirmPassword: "" },
    validationSchema: Yup.object({
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password"), null], "Passwords must match")
        .required("Required"),
    }),
    onSubmit: async (values) => {
      const result = await dispatch(
        resetPassword({
          token,
          password: values.password,
          confirmPassword: values.confirmPassword,
        }),
      );
      if (resetPassword.fulfilled.match(result)) {
        toast.success(result.payload || "Password reset successful!");
        setIsSuccess(true);
      }
    },
  });

  if (isSuccess) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#ffffff] font-['Outfit'] p-6">
        <div className="w-full max-w-[500px] text-center space-y-8 animate-fade-in">
          <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-green-100">
            <CheckCircle2 size={48} />
          </div>
          <div className="space-y-2">
            <h2 className="text-[32px] font-bold text-[#1e1b4b] tracking-tight">
              Password Reset Complete
            </h2>
            <p className="text-slate-400 text-lg font-medium">
              Your password has been successfully updated. You can now sign in
              with your new credentials.
            </p>
          </div>
          <Link
            to="/login"
            className="inline-flex w-full h-[60px] bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-[20px] font-bold text-[13px] uppercase tracking-[0.15em] shadow-lg transition-all items-center justify-center"
          >
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

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
            Reset Password
          </h1>
          <p className="text-white/80 text-lg font-medium leading-relaxed max-w-[320px] mx-auto">
            Secure your account with a new password to continue accessing your
            dashboard.
          </p>
        </div>
      </div>

      {/* Right side: Reset Password Form */}
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
              New Password
            </h2>
            <p className="text-slate-400 text-lg font-medium">
              Please enter your new password below.
            </p>
          </div>

          <div className="bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-100 border-t-[5px] border-t-[#7c3aed] p-10 lg:p-12 relative">
            <form onSubmit={formik.handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-500 rounded-2xl text-sm font-medium animate-shake">
                  {error}
                </div>
              )}

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block px-1">
                  New Password
                </label>
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

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block px-1">
                  Confirm Password
                </label>
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#7c3aed] transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="••••••••"
                    className={`w-full h-[54px] bg-slate-50 border border-transparent rounded-[18px] pl-14 pr-14 text-[#1e1b4b] font-medium placeholder:text-slate-300 focus:bg-white focus:border-[#7c3aed]/20 focus:ring-4 focus:ring-[#7c3aed]/5 transition-all outline-none ${
                      formik.touched.confirmPassword &&
                      formik.errors.confirmPassword
                        ? "bg-red-50 border-red-200"
                        : ""
                    }`}
                    {...formik.getFieldProps("confirmPassword")}
                  />
                  <button
                    type="button"
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-[#7c3aed] transition-all"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
                {formik.touched.confirmPassword &&
                  formik.errors.confirmPassword && (
                    <p className="text-red-500 text-[10px] font-bold mt-1 px-1 uppercase tracking-wider">
                      {formik.errors.confirmPassword}
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
                      RESET PASSWORD
                      <div className="p-1 px-1.5 bg-white/20 rounded-md">
                        <Save
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

export default ResetPassword;
