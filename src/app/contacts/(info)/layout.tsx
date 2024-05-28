import React from "react";

const InfoLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="border-8 border-green-400">
      <h2>InfoLayout</h2>
      {children}
    </div>
  );
};

export default InfoLayout;
