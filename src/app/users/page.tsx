import React from "react";

const users = [
  {
    id: 1,
    name: "Alice",
    age: 28,
    specialization: "Developer",
    city: "New York",
    phone: "+1234567890",
  },
  {
    id: 2,
    name: "Bob",
    age: 35,
    specialization: "Designer",
    city: "Los Angeles",
    phone: "+1234567891",
  },
  {
    id: 3,
    name: "Charlie",
    age: 30,
    specialization: "Developer",
    city: "Chicago",
    phone: "+1234567892",
  },
  {
    id: 4,
    name: "David",
    age: 40,
    specialization: "Manager",
    city: "Houston",
    phone: "+1234567893",
  },
  {
    id: 5,
    name: "Eva",
    age: 25,
    specialization: "QA",
    city: "Phoenix",
    phone: "+1234567894",
  },
  {
    id: 6,
    name: "Frank",
    age: 29,
    specialization: "DevOps",
    city: "Philadelphia",
    phone: "+1234567895",
  },
  {
    id: 7,
    name: "Grace",
    age: 32,
    specialization: "Developer",
    city: "San Antonio",
    phone: "+1234567896",
  },
  {
    id: 8,
    name: "Hank",
    age: 27,
    specialization: "Designer",
    city: "San Diego",
    phone: "+1234567897",
  },
  {
    id: 9,
    name: "Ivy",
    age: 26,
    specialization: "QA",
    city: "Dallas",
    phone: "+1234567898",
  },
  {
    id: 10,
    name: "Jack",
    age: 33,
    specialization: "Developer",
    city: "San Jose",
    phone: "+1234567899",
  },
];

const UserTable = () => {
  return (
    <table border={1} cellPadding="5" cellSpacing="0">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Age</th>
          <th>Specialization</th>
          <th>City</th>
          <th>Phone</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user.id}>
            <td>{user.id}</td>
            <td>{user.name}</td>
            <td>{user.age}</td>
            <td>{user.specialization}</td>
            <td>{user.city}</td>
            <td>{user.phone}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default UserTable;
