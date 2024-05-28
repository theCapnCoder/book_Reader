"use client";

const Page = ({ params }: { params: any }) => {
  console.log(params);
  return (
    <div>
      <h2>
        Slug Lorem ipsum dolor sit amet consectetur adipisicing elit. Placeat,
        praesentium.
      </h2>
      <pre>{JSON.stringify(params)}</pre>
    </div>
  );
};

export default Page;
