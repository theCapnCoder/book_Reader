import React from "react";

const AddressLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="border-8 border-orange-400">
      <h2>AddressLayout</h2>
      {children}
    </div>
  );
};

export default AddressLayout;
