import React from "react";
import Button from "./components/button";
import Footer from "./components/Footer";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <h2>Layout</h2>
      <Button />
      {children}
      <Footer />
    </div>
  );
};

export default layout;
