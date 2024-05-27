"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const MyName = () => {
  const pathname = usePathname();
  console.log(pathname);

  return (
    <div>
      <h2 className={`${pathname} !== '/about' ? 'active' : ''`}>About</h2>
      <li>
        <Link
          className={`${pathname === "/about" ? "bg-green-400" : "bg-red-400"}`}
          href="/"
        >
          Home
        </Link>
      </li>
    </div>
  );
};

export default MyName;
