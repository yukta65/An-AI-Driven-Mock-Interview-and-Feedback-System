"use client";
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useEffect } from "react";

const Header = () => {
  const path = usePathname();

  useEffect(() => {
    console.log(path);
  }, []);

  return (
    <div className="flex items-center justify-between bg-white border border-gray-200 rounded-full px-6 py-3 max-w-6xl mx-auto mt-4">
      {/* Logo on the Left */}
      <Image src="/Logo.png" width={140} height={80} alt="logo" />

      {/* Navigation Centered */}
      <ul className="hidden md:flex gap-8">
        <li
          className={`hover:text-orange-500 hover:font-semibold transition-all cursor-pointer ${
            path === "/dashboard"
              ? "text-orange-500 font-semibold"
              : "text-gray-700"
          }`}
        >
          Dashboard
        </li>
      </ul>

      {/* User Button on the Right */}
      <UserButton />
    </div>
  );
};

export default Header;
