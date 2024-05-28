import Link from "next/link";
import React from "react";

const PostPage = ({ params: { id } }: { params: { id: string } }) => {
  return (
    <div>
      <h2>PostPage</h2>
      <h3>Post Id: {id}</h3>
      <Link href={"/posts"}>Back</Link>
    </div>
  );
};

export default PostPage;
