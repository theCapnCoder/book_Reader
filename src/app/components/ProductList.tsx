// app/dashboard/ProductList.tsx
import React from "react";

interface Category {
  id: number;
  name: string;
  image: string;
}

interface Product {
  id: number;
  title: string;
  price: number;
  description: string;
  category: Category;
  images: string[];
}

async function fetchProducts(): Promise<Product[]> {
  const response = await fetch("https://api.escuelajs.co/api/v1/products");
  const data: Product[] = await response.json();

  // Добавляем задержку в 1 секунду
  await new Promise((resolve) => setTimeout(resolve, 5000));

  return data;
}

export default async function ProductList() {
  const products = await fetchProducts();

  return (
    <div>
      {products.map((product) => (
        <div key={product.id}>
          <h2>{product.title}</h2>
          <p>{product.description}</p>
          <p>Price: ${product.price}</p>
          <div>
            {product.images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={product.title}
                style={{ width: "100px", height: "100px" }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
