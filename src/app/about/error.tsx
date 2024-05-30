"use client";

import React, { useEffect } from "react";

const AboutError = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  useEffect(() => {
    console.log(error);
  }, [error]);
  return (
    <div>
      <h2>Something went wrong</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
};

export default AboutError;
