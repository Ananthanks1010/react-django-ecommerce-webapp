import React from "react";

const S3Image = ({ url }) => {
  return (
    <div>
      <h3>Product Image</h3>
      <img
        src={url}
        alt="S3 Image"
        style={{ width: "300px", height: "auto", borderRadius: "10px" }}
      />
    </div>
  );
};

export default function App() {
  const s3ImageUrl = "https://tobiramasset.s3.us-east-1.amazonaws.com/products/10/image1.png";
  return <S3Image url={s3ImageUrl} />;
}
