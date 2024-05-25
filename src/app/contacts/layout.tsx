"use client";

import Footer from "./components/Footer";
import Navigation from "./components/Navigation";

const MyLayout = ({ children }: { children: React.ReactNode }) => {
  console.log("Layout");
  return (
    <div>
      <h2 className="bg-green-300 border-2 p-2 mb-6">Header</h2>
      <Navigation />
      {children}
      <Footer />
    </div>
  );
};

export default MyLayout;
