// Front-end/src/pages/BookPage.jsx
import React from "react";
import { useParams } from "react-router-dom";
import BookDetails from "../components/BookDetails.jsx";

export default function BookPage() {
  const { workId } = useParams();

  return (
    <div className="book-page p-4">
      <h2 className="text-xl font-bold mb-4">Book Details</h2>
      <BookDetails workId={workId} />
    </div>
  );
}
