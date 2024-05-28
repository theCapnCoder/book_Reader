import React from "react";

const ItemIdPage = ({ params }: { params: any }) => {
  return (
    <div>
      <div>ItemIdPage</div>
      {JSON.stringify(params, null, 2)}
    </div>
  );
};

export default ItemIdPage;
