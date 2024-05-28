import Link from "next/link";
import React from "react";
import { faker } from "@faker-js/faker";

export type Info = [name: string, sex: string, jobType: string];

const UsersPage = () => {
  return (
    <div>
      <h2>UsersPage</h2>
      <ul className="flex gap-4 m-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <li key={i}>
            <Link href={`/users/${i + 1}`} className="border-4 p-4">
              {i + 1}
            </Link>
          </li>
        ))}
      </ul>
      <ul className="flex flex-col gap-2">
        {Array.from({ length: 10 }).map((_, idx) => {
          const name = faker.person.firstName();
          const sex = faker.person.sex();
          const jobType = faker.person.jobType();
          return (
            <li key={idx} className="p-2 border-4">
              <Link href={`/users/${name}/${sex}/${jobType}`}>
                User: {name}, Gender: {sex}, jobType: {jobType}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default UsersPage;
