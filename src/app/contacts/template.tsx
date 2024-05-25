"use client";

const MyTemplate = ({ children }: { children: React.ReactNode }) => {
  console.log("template");
  return (
    <div className="bg-red-400">
      <h2>Template</h2>
      {children}
    </div>
  );
};

export default MyTemplate;
