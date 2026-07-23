"use client";

import React, { useState } from "react";
import Image from "next/image";

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ email: "", password: "" });
    setShowPassword(false);
  };

  return (
    <div className="w-full min-h-screen flex">
      {/* Left side - Hero section */}
      <div className="flex-1 bg-[#e9ffda] flex items-center justify-center p-12 relative overflow-hidden">
        {/* Decorative green glow blobs */}
        <div className="absolute top-[-15%] left-[-10%] w-[55%] h-[55%] bg-[#22c55e]/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-[#22c55e]/15 rounded-full blur-[100px]" />

        <div className="relative z-10 text-black max-w-lg">
          <h1 className="text-5xl font-black leading-tight tracking-tight text-black mb-6">
            {isLogin
              ? "Access your global financial infrastructure."
              : "Start accepting payments across Africa."}
          </h1>
          <div className="mt-6 w-full relative">
            <Image
              src="/images/login-pic.png"
              alt="Trite Illustration"
              width={600}
              height={450}
              className="w-full h-auto object-contain rounded-2xl"
              priority
            />
          </div>
        </div>
      </div>

      {/* Right side - Login/Signup form */}
      <div className="flex-1 bg-white flex items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#22c55e]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#22c55e]/5 rounded-full blur-[120px]" />
        <div className="w-full max-w-md relative z-10">
          {/* Logo */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-[#22c55e] font-black text-xs">T</span>
              </div>
              <span className="font-black text-black text-lg">Trite</span>
            </div>
            <h2 className="text-3xl font-black text-black mb-2 tracking-tight">
              {isLogin ? "Welcome Back" : "Join Us Today"}
            </h2>
            <p className="text-gray-500 text-sm font-medium">
              {isLogin
                ? "Welcome back to Trite — Access your global financial infrastructure."
                : "Welcome to Trite — Start accepting payments in Ghana today."}
            </p>
          </div>

          {/* Form */}
          <div className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1.5"
              >
                Your email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="flex h-11 w-full rounded-xl border border-black/15 bg-gray-50/50 px-4 py-2 text-sm font-medium text-black transition-all focus:border-[#22c55e] focus:bg-white outline-none placeholder:text-gray-400"
                placeholder="you@company.com"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1.5"
              >
                {isLogin ? "Password" : "Create new password"}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="flex h-11 w-full rounded-xl border border-black/15 bg-gray-50/50 px-4 pr-12 py-2 text-sm font-medium text-black transition-all focus:border-[#22c55e] focus:bg-white outline-none placeholder:text-gray-400"
                  placeholder={isLogin ? "••••••••" : "Create a secure password"}
                  required
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-black transition-colors focus:outline-none"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                      />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 accent-[#22c55e]"
                  />
                  <span className="text-xs text-gray-500 font-medium">Remember me</span>
                </label>
                <button type="button" className="text-xs font-bold text-black hover:text-[#22c55e] transition-colors">
                  Forgot password?
                </button>
              </div>
            )}

            <button
              onClick={handleSubmit}
              className="w-full flex h-12 items-center justify-center rounded-xl bg-black text-sm font-bold text-white hover:bg-black/80 transition-all active:scale-[0.98] mt-2"
            >
              {isLogin ? "Sign In" : "Create a new account"}
            </button>

            <div className="text-center text-xs text-gray-500 font-medium">
              {isLogin ? "Don't have an account?" : "Already have account?"}{" "}
              <button
                type="button"
                onClick={toggleMode}
                className="font-bold text-black hover:text-[#22c55e] transition-colors"
              >
                {isLogin ? "Sign Up" : "Login"}
              </button>
            </div>
          </div>



          <p className="text-gray-400 mt-6 text-[10px] text-center leading-relaxed">
            By clicking continue, you agree to our{" "}
            <a href="/legal?tab=general-terms-of-use" className="text-gray-600 font-bold hover:underline">
              Terms
            </a>{" "}
            and{" "}
            <a href="/legal?tab=privacy-policy" className="text-gray-600 font-bold hover:underline">
              Privacy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
