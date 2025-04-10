import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import logo from '../assets/logo1.png';

const LoginAndSignup = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const toggleCard = () => {
    setIsLogin(!isLogin);
    setError("");
  };

  const handleSubmit = async () => {
    setError("");
    try {
      if (!isLogin) {
        if (password !== confirmPassword) {
          setError("Passwords do not match.");
          return;
        }

        await axios.post("http://127.0.0.1:8000/user/register/", {
          email,
          password,
        });

        navigate("/verifyotp", { state: { email } });

      } else {
        const res = await axios.post("http://127.0.0.1:8000/user/login/", {
          email,
          password,
        });

        localStorage.setItem("accessToken", res.data.AuthenticationResult.AccessToken);
        navigate("/dashboard");
      }

    } catch (err) {
      const errorMessage = err?.response?.data?.error || "Something went wrong.";
      setError(errorMessage);

      // Auto-switch logic based on backend message
      if (isLogin && errorMessage.toLowerCase().includes("user does not exist")) {
        setError("User not found. Switching to Sign Up...");
        setTimeout(() => setIsLogin(false), 1500);
      } else if (!isLogin && errorMessage.toLowerCase().includes("user already exists")) {
        setError("User already exists. Switching to Login...");
        setTimeout(() => setIsLogin(true), 1500);
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-300 to-purple-400 overflow-hidden flex items-center justify-center px-4">
      {/* Background bubbles */}
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
            animate={{ y: [0, -100], opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 10 + Math.random() * 10, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      {/* Logo */}
      <motion.div className="absolute top-6 text-white text-3xl font-bold z-10" initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}>
        <div className="mt-2 p-4 flex flex-col g-2">
          <img src={logo} alt="My App logo" />
        </div>
      </motion.div>

      {/* Auth card */}
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
              <h2 className="text-2xl font-semibold text-center text-gray-700">{isLogin ? "Login" : "Sign Up"}</h2>
              <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              {!isLogin && <Input placeholder="Confirm Password" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />}
              {!isLogin && <Input placeholder="Phone Number" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />}
              <Button className="w-full mt-2" onClick={handleSubmit}>{isLogin ? "Login" : "Sign Up"}</Button>
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
              <p className="text-center text-sm text-gray-500">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <button onClick={toggleCard} className="text-blue-500 hover:underline">
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
