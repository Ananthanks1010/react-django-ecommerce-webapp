// src/pages/UserPage.jsx
import React from "react";
import { useAuth } from "../context/AuthContext";

const UserPage = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md text-center">
          <h2 className="text-xl font-semibold text-red-600">No user is logged in</h2>
          <p className="text-gray-600 mt-2">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">User Profile</h2>
        <div className="space-y-2 text-gray-800">
          <div><span className="font-semibold">Name:</span> {user.name}</div>
          <div><span className="font-semibold">Email:</span> {user.email}</div>
          <div><span className="font-semibold">User ID:</span> {user.sub}</div>
        </div>
      </div>
    </div>
  );
};

export default UserPage;
