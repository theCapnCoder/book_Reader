import Link from "next/link";
import React from "react";

const Navigation = () => {
  return (
    <div>
      <ul className="flex m-2 gap-4">
        <li>
          <Link href="/home" className="border-4 p-2">
            Home
          </Link>
        </li>
        <li>
          <Link href="/about" className="border-4 p-2">
            About
          </Link>
        </li>
        <li>
          <Link href="/about/address" className="border-4 p-2">
            Address
          </Link>
        </li>
        <li>
          <Link href="/about/email" className="border-4 p-2">
            Email
          </Link>
        </li>
        <li>
          <Link href="/about/phone" className="border-4 p-2">
            Phone
          </Link>
        </li>
        <li>
          <Link href="contacts" className="border-4 p-2">
            Contacts
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Navigation;
