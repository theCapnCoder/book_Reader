"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

const Navigation = ({ path }: { path: string }) => {
  console.log({ path }, path === "/contacts/email");
  const router = useRouter();

  const prev = () => {
    router.back();
  };
  const prevHard = () => {
    router.push("/contacts/address");
  };

  return (
    <div className="fixed">
      <button onClick={prev} className="p-2 bg-blue-200">
        Prev
      </button>
      <button onClick={prevHard} className="p-2 bg-blue-200">
        Prev hard
      </button>
      <ul className="flex m-2 gap-4">
        <li>
          <Link
            href="/contacts/address"
            // scroll={false}
            className="border-4 p-2"
          >
            Address
          </Link>
        </li>
        <li>
          <Link
            className={`${
              path === "/contacts/email" ? "bg-green-400" : "bg-red-400"
            }`}
            href="/"
          >
            Email
          </Link>
        </li>
        <li>
          <Link
            href="/contacts/email"
            className={
              "border-4 p-2 " +
              `${path === "/contacts/email" ? "bg-green-400" : "bg-red-400"}`
            }
          >
            Email
          </Link>
        </li>
        <li>
          <Link href="/contacts/phone#natus" className="border-4 p-2">
            Phone
          </Link>
        </li>
        <li>
          <Link href="/home" className="border-4 p-2">
            Home
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Navigation;
