import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

export default function VerifyOTP() {
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;

  const handleVerify = async () => {
    try {
      const res = await axios.post("${import.meta.env.VITE_API_URL}/confirm/", {
        email,
        code,
      });
      setMessage("Account verified! You can now log in.");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setMessage(err?.response?.data?.error || "Verification failed.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h2 className="text-2xl font-bold mb-4">Verify Your Email</h2>
      <p className="mb-2 text-sm text-gray-600">We sent a code to {email}</p>
      <input
        type="text"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        placeholder="Enter OTP"
        className="border rounded px-4 py-2 mb-2 w-full max-w-sm"
      />
      <button onClick={handleVerify} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        Verify
      </button>
      {message && <p className="mt-3 text-sm text-gray-700">{message}</p>}
    </div>
  );
}
