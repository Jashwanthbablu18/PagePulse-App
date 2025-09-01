// Front-end/src/pages/BookPage.jsx
import { useParams } from "react-router-dom";
import BookDetails from "../components/BookDetails.jsx";

export default function BookPage() {
  const { workId } = useParams(); // :workId must match App.jsx
  return (
    <section className="py-4">
      <BookDetails workId={workId} />
    </section>
  );
}
