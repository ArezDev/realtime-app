"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { initAudio } from '@/lib/Notif_lead';
import Swal from 'sweetalert2';
import { FaKey } from "react-icons/fa6";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [Loading, setLoading] = useState("OPEN");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) =>{
    initAudio();
    e.preventDefault();
    Swal.fire({
      title: 'Logging in...',
      text: 'Please wait a moment',
      allowOutsideClick: false,
      allowEscapeKey: false,
      timer: 5000,
      theme: 'auto',
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
        const res = await axios.post("/api/login", { password });
        if (res.data?.success === true) {
          Swal.close(); // Tutup swal loading setelah response
          Swal.fire({
            icon: 'success',
            title: 'Welcome!',
            text: '',
            showConfirmButton: false,
            timer: 750,
            theme: 'auto',
          }).then(() => {
            router.push("/");
          });
        }
      } catch (err: any) {
        Swal.close(); // Pastikan loading ditutup jika error juga
        Swal.fire({
          icon: 'error',
          title: 'Server Error!',
          text: 'Your IP Address has been blocked!',
          theme: 'auto',
        });
      }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
    <form
      onSubmit={handleLogin}
      className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl w-full max-w-sm space-y-4"
    >
      <h2 className="text-2xl font-semibold text-center text-gray-800 dark:text-white">
        
      </h2>

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="password ?"
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {error && (
        <p className="text-sm text-red-500 text-center">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition duration-200 flex items-center justify-center space-x-2"
      >
        <span>{Loading}</span>
        <FaKey />
      </button>

    </form>
  </div>
  );
}
