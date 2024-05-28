import React from "react";

const ContactsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="border-8 border-red-400">
      <div>ContactsLayout</div>
      {children}
    </div>
  );
};

export default ContactsLayout;
