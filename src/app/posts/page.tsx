import Link from "next/link";
import React from "react";

const PostsPage = () => {
  return (
    <div>
      <h2>PostsPage</h2>
      <ul className="flex gap-4">
        {Array.from({ length: 10 }).map((_, idx) => (
          <Link key={idx} href={`/posts/${idx}`} className="p-3 border-4">
            {idx}
          </Link>
        ))}
      </ul>
    </div>
  );
};

export default PostsPage;
