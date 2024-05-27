"use client";

import { usePathname } from "next/navigation";
import Footer from "./components/Footer";
import Navigation from "./components/Navigation";

const MyLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  console.log("Layout");
  return (
    <div>
      <h2 className="bg-green-300 border-2 p-2 mb-6">Header</h2>
      <Navigation path={pathname} />
      {children}
      <Footer />
    </div>
  );
};

export default MyLayout;
