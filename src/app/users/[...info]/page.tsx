import Link from "next/link";
import React from "react";
import { Info } from "../page";

const UserPage = ({ params: { info } }: { params: { info: Info } }) => {
  const [name, sex, jobType] = info;
  return (
    <div>
      <h2>UserPage</h2>
      <h2>Name: {name}, {sex}, {jobType}</h2>
      <pre>{JSON.stringify(info)}</pre>
      {/* <h2>User id: {id}</h2> */}
      <Link href="/users">Back</Link>
    </div>
  );
};

export default UserPage;
