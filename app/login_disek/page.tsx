"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { initAudio } from '@/lib/Notif_lead';

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    initAudio();
    e.preventDefault();
    try {
     const res = await axios.post("/api/login", { password });
     if (res.data?.success === true) {
        console.log('sukses login');
        router.push("/");
     }
    } catch (err: any) {
      console.log(err?.response?.data?.error)
      const errorMessage = err?.response?.data?.error || err.message || "Login failed";
      setError(errorMessage);
      return;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-4">
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter password"
        className="border p-2 rounded w-full"
      />
      {error && <p className="text-red-500">{error}</p>}
      <button type="submit" className="bg-blue-600 text-white p-2 rounded w-full">
        Login
      </button>
    </form>
  );
}
