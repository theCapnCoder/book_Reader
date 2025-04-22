import Image from "next/image";
import Book from "./Book";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">

      <Book />

    </main>
  );
}
