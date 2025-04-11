import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import logo from "../assets/logo1.png";
import { useAuth } from "../components/authcontext";

const API_BASE_URL = "${import.meta.env.VITE_API_URL}";

const LoginAndSignup = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();

  const redirectTo = location.state?.from || "/";

  const toggleCard = () => {
    setIsLogin(!isLogin);
    setOtpSent(false);
    setError("");
    setSuccess("");
  };

  const handleLogin = async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/Auth/login/`, {
        email,
        password,
      });

      setUser({ user_id: res.data.user_id, email });
      setSuccess("Login successful!");
      setError("");
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const errMsg = err.response?.data?.error || "Login failed";
      console.error("Login error:", errMsg);
      setError(errMsg);

      if (errMsg.toLowerCase().includes("user not found")) {
        setSuccess("User not found. Redirecting to Sign Up...");
        setTimeout(() => {
          setIsLogin(false);
          setError("");
          setSuccess("");
        }, 1500);
      }
    }
  };

  const handleSignup = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/Auth/register/`, {
        email,
        password,
      });
      setSuccess(res.data.message || "OTP sent to your email.");
      setOtpSent(true);
      setError("");
    } catch (err) {
      const errMsg = err.response?.data?.error || "Signup failed";
      console.error("Signup error:", errMsg);
      setError(errMsg);

      if (errMsg.toLowerCase().includes("already registered")) {
        setSuccess("Email already registered. Redirecting to Login...");
        setTimeout(() => {
          setIsLogin(true);
          setError("");
          setSuccess("");
        }, 1500);
      }
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/Auth/verify-otp/`, {
        email,
        otp,
      });

      setUser({ user_id: res.data.user_id, email });
      setSuccess("Account verified. You are now logged in.");
      setOtpSent(false);
      setIsLogin(true);
      setError("");
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const errMsg = err.response?.data?.error || "OTP verification failed";
      console.error("OTP error:", errMsg);
      setError(errMsg);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-300 to-purple-400 overflow-hidden flex items-center justify-center px-4 sm:px-6 md:px-8">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white rounded-full opacity-20"
            style={{
              width: 20 + Math.random() * 30,
              height: 20 + Math.random() * 30,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Logo */}
      <motion.div
        className="absolute top-6 sm:top-10 text-white text-3xl sm:text-4xl font-bold z-10"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <div className="mt-2 p-4 flex flex-col g-2">
          <img src={logo} alt="My App logo" />
        </div>
      </motion.div>

      {/* Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={isLogin ? "login" : "signup"}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.5 }}
          className="z-10 w-full max-w-sm p-4"
        >
          <Card className="rounded-2xl shadow-xl p-4 bg-white">
            <CardContent className="flex flex-col gap-4">
              <h2 className="text-2xl font-semibold text-center text-gray-700">
                {isLogin ? "Login" : otpSent ? "Verify OTP" : "Sign Up"}
              </h2>

              <Input
                id="email"
                name="email"
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              {!otpSent && (
                <Input
                  id="password"
                  name="password"
                  placeholder="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              )}

              {!isLogin && !otpSent && (
                <Input
                  id="confirm-password"
                  name="confirm-password"
                  placeholder="Confirm Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              )}

              {!isLogin && otpSent && (
                <Input
                  id="otp"
                  name="otp"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              )}

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}
              {success && (
                <p className="text-green-600 text-sm text-center">{success}</p>
              )}

              <Button
                className="w-full mt-2"
                onClick={
                  isLogin ? handleLogin : otpSent ? handleVerifyOTP : handleSignup
                }
              >
                {isLogin ? "Login" : otpSent ? "Verify OTP" : "Sign Up"}
              </Button>

              <p className="text-center text-sm text-gray-500">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  onClick={toggleCard}
                  className="text-blue-500 hover:underline"
                >
                  {isLogin ? "Sign Up" : "Login"}
                </button>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default LoginAndSignup;
