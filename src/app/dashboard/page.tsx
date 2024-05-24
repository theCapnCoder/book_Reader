"use client";

import Link from "next/link";
const session = null;

const page = () => {
  if (!session) {
    throw new Error("no session");
  }

  const getError = () => {
    throw new Error("my custom error");
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <button className="bg-blue-400 rounded p-2">
        <Link href="/dashboard/settings">Dashboard/setting</Link>
      </button>
      <button
        onClick={() => {
          console.log("error");
          // throw new Error('my custom error')
          getError();
        }}
      >
        Error
      </button>
    </div>
  );
};

export default page;
