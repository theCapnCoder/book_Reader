import React from "react";

const CategoryIdPage = ({ params }: { params: any }) => {
  return (
    <div>
      <div>CategoryIdPage</div>
      {JSON.stringify(params, null, 2)}
    </div>
  );
};

export default CategoryIdPage;
