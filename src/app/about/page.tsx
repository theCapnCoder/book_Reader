import React, { Suspense } from "react";
import ProductList from "../components/ProductList";
import AboutLoading from "./loading";
import Loading from "./loading";

export default function AboutPage() {
  return (
    <section>
      {/* <Suspense fallback={<AboutLoading />}> */}
      <ProductList />
      {/* </Suspense> */}
    </section>
  );
}
