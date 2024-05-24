import Link from "next/link";

export default function Home() {
  return (
    <main className="p-4">
      <ul className="flex gap-4">
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
          <Link href="contact" className="border-4 p-2">
            Contact
          </Link>
        </li>
      </ul>
    </main>
  );
}
