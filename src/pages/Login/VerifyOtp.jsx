import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { verifyOtp, clearError } from "../../store/slices/authSlice";
import { ShieldCheck, ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import Logo from "../../assets/mgblogo.jpeg";
import { toast } from "react-hot-toast";
import { forgotPassword } from "../../store/slices/authSlice";

const VerifyOtp = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useSelector((state) => state.auth);

  // Email passed from ForgotPassword page via navigation state
  const email = location.state?.email || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendTimer, setResendTimer] = useState(120);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef([]);

  // Redirect if no email context
  useEffect(() => {
    if (!email) navigate("/forgot-password");
  }, [email, navigate]);

  useEffect(() => {
    return () => dispatch(clearError());
  }, [dispatch]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setTimeout(() => setResendTimer((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Only digits
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only last digit
    setOtp(newOtp);
    // Auto-focus next
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length < 6) {
      toast.error("Please enter the complete 6-digit OTP");
      return;
    }
    const result = await dispatch(verifyOtp({ email, otp: otpString }));
    if (verifyOtp.fulfilled.match(result)) {
      const resetToken = result.payload?.resetToken;
      if (!resetToken) {
        toast.error("Failed to get reset token. Please try again.");
        return;
      }
      toast.success("OTP verified! Set your new password.");
      navigate("/reset-password-otp", { state: { email, resetToken } });
    }
  };

  const handleResend = async () => {
    setResending(true);
    const result = await dispatch(forgotPassword(email));
    setResending(false);
    if (forgotPassword.fulfilled.match(result)) {
      toast.success("OTP resent to your email!");
      setResendTimer(120);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } else {
      toast.error("Failed to resend OTP. Try again.");
    }
  };

  return (
    <div className="h-screen flex flex-col lg:flex-row bg-[#ffffff] font-['Outfit'] overflow-hidden">
      {/* Left side: Branding */}
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
            Enter the OTP sent to your email to verify your identity and reset
            your password.
          </p>
        </div>

        <div className="absolute bottom-10 left-0 w-full text-center">
          <p className="text-white/40 text-[10px] font-bold tracking-[0.3em] uppercase">
            Administrative Access Portal
          </p>
        </div>
      </div>

      {/* Right side: OTP Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 bg-white h-full overflow-hidden">
        <div className="w-full max-w-[500px] animate-fade-in">
          {/* Header */}
          <div className="mb-8 text-center lg:text-left">
            <Link
              to="/forgot-password"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-[#7c3aed] font-medium text-sm mb-6 transition-colors group"
            >
              <ArrowLeft
                size={16}
                className="transition-transform group-hover:-translate-x-1"
              />
              Back
            </Link>
            <h2 className="text-[42px] font-bold text-[#1e1b4b] mb-1 leading-tight tracking-tight">
              Verify OTP
            </h2>
            <p className="text-slate-400 text-base font-medium">
              We sent a 6-digit OTP to{" "}
              <span className="text-[#7c3aed] font-semibold">{email}</span>
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-100 border-t-[5px] border-t-[#7c3aed] p-10 lg:p-12 relative">
            <form onSubmit={handleSubmit} className="space-y-8">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-500 rounded-2xl text-sm font-medium animate-shake">
                  {error}
                </div>
              )}

              {/* OTP Icon */}
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-[#7c3aed]/10 text-[#7c3aed] rounded-2xl flex items-center justify-center">
                  <ShieldCheck size={32} />
                </div>
              </div>

              {/* OTP Inputs */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block px-1">
                  Enter OTP
                </label>
                <div
                  className="flex gap-3 justify-center"
                  onPaste={handlePaste}
                >
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className={`w-12 h-14 text-center text-2xl font-bold text-[#1e1b4b] bg-slate-50 border-2 rounded-[14px] outline-none transition-all
                        ${digit ? "border-[#7c3aed] bg-[#7c3aed]/5 shadow-[0_0_0_4px_rgba(124,58,237,0.08)]" : "border-transparent"}
                        focus:border-[#7c3aed] focus:bg-white focus:shadow-[0_0_0_4px_rgba(124,58,237,0.08)]`}
                    />
                  ))}
                </div>
              </div>

              {/* Resend */}
              <div className="text-center">
                {resendTimer > 0 ? (
                  <p className="text-slate-400 text-sm font-medium">
                    Resend OTP in{" "}
                    <span className="text-[#7c3aed] font-bold">
                      {resendTimer}s
                    </span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    className="inline-flex items-center gap-2 text-[#7c3aed] hover:text-[#6d28d9] font-semibold text-sm transition-colors disabled:opacity-60"
                  >
                    <RefreshCw
                      size={14}
                      className={resending ? "animate-spin" : ""}
                    />
                    Resend OTP
                  </button>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full h-[60px] bg-[#6366f1] hover:bg-[#4f46e5] text-white rounded-[20px] font-bold text-[13px] uppercase tracking-[0.15em] shadow-[0_10px_30px_rgba(99,102,241,0.2)] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
                  disabled={loading || otp.join("").length < 6}
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>
                      VERIFY OTP
                      <div className="p-1 px-1.5 bg-white/20 rounded-md">
                        <ShieldCheck
                          size={14}
                          className="transition-transform group-hover:scale-110"
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

export default VerifyOtp;
