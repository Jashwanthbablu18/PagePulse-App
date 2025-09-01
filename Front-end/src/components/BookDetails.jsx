// Front-end/src/components/BookDetails.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBook, getInsights } from "../utils/api.js";
import Description from "./Description.jsx";
import { SkewLoader } from "react-spinners";

function avatarFor(name) {
  if (!name) return null;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=128&background=1f2a44&color=fff&rounded=true`;
}

function StarRating({ avg, count }) {
  if (avg == null) return null;
  const full = Math.floor(avg);
  const half = avg - full >= 0.5;
  return (
    <div className="d-flex align-items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => {
        const cls = i < full ? "bi-star-fill" : i === full && half ? "bi-star-half" : "bi-star";
        return <i key={i} className={`bi ${cls}`} />;
      })}
      <span className="ms-2 small text-muted">
        {Number.isFinite(avg) ? avg.toFixed(1) : avg} {count ? `(${count.toLocaleString()})` : ""}
      </span>
    </div>
  );
}

export default function BookDetails({ workId }) {
  const [bundle, setBundle] = useState(null);
  const [ai, setAi] = useState({ summary: null, insights: [], reviews: [] });
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        setError("");
        setBundle(null);
        setAi({ summary: null, insights: [], reviews: [] });

        const data = await getBook(workId); // GET /api/pagepulse/books/:workId
        if (!mounted) return;
        setBundle(data);

        if (data?.ai && (data.ai.summary || (data.ai.insights && data.ai.insights.length))) {
          setAi({
            summary: data.ai.summary || null,
            insights: Array.isArray(data.ai.insights) ? data.ai.insights : [],
            reviews: Array.isArray(data.ai.reviews) ? data.ai.reviews : [],
          });
        } else if (data?.book?.title) {
          try {
            setAiLoading(true);
            const payload = {
              title: data.book.title,
              author: data.book.authors?.[0] || data.author?.name || "",
              description: data.book.description || "",
            };
            const res = await getInsights(payload);
            if (!mounted) return;
            setAi({
              summary: res.summary || null,
              insights: Array.isArray(res.insights) ? res.insights : [],
              reviews: Array.isArray(res.reviews) ? res.reviews : [],
            });
          } catch (err) {
            console.warn("AI insights fetch failed", err?.message || err);
          } finally {
            if (mounted) setAiLoading(false);
          }
        }
      } catch (err) {
        console.error("BookDetails load error", err?.message || err);
        if (mounted) setError("Failed to load book details.");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [workId]);

  if (loading) {
    return (
      <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: "40vh" }}>
        <div className="position-relative" style={{ width: 64, height: 40 }}>
          <div className="position-absolute top-0 start-50 translate-middle-x" style={{ opacity: 0.95 }}>
            <SkewLoader color="#1f2a44" size={28} />
          </div>
          <div className="position-absolute top-0 start-50 translate-middle-x" style={{ transform: "translateX(10px)", opacity: 0.85 }}>
            <SkewLoader color="#ff6b6b" size={28} />
          </div>
          <div className="position-absolute top-0 start-50 translate-middle-x" style={{ transform: "translateX(20px)", opacity: 0.8 }}>
            <SkewLoader color="#d4af37" size={28} />
          </div>
          <span className="visually-hidden">Loading…</span>
        </div>
      </div>
    );
  }

  if (error) return <div className="container py-5 text-danger">{error}</div>;
  if (!bundle?.book) return <div className="container py-5">Not found.</div>;

  const { book, author, buyLinks, moreFromAuthor, ai_error } = bundle;
  const authorImg = author?.photoUrl || avatarFor(author?.name);

  return (
    <div className="container py-4">
      <div className="row g-4">
        <div className="col-12 col-md-4">
          <div className="card border-0 shadow-sm rounded-4 p-3 text-center">
            {book.thumbnail ? (
              <img src={book.thumbnail} alt={book.title} className="img-fluid rounded-4" />
            ) : (
              <div className="bg-light rounded-4 d-flex align-items-center justify-content-center" style={{ height: 320 }}>
                No cover
              </div>
            )}
            <div className="mt-3">
              <h4 className="mb-1">{book.title}</h4>
              {!!book.authors?.length && <p className="text-muted mb-2">by {book.authors.join(", ")}</p>}
              <StarRating avg={book.averageRating} count={book.ratingsCount} />
            </div>
          </div>
        </div>

        <div className="col-12 col-md-8">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body">
              {(author?.name || authorImg) && (
                <div className="d-flex align-items-center gap-3 mb-3">
                  {authorImg && <img src={authorImg} alt={author?.name || "Author"} className="rounded-circle pp-author-avatar" />}
                  <div>
                    <div className="fw-semibold">Author</div>
                    <div>{author?.name || "—"}</div>
                  </div>
                </div>
              )}

              <div className="row g-3 mb-3">
                {book.publishedDate && (
                  <div className="col-6 col-lg-4">
                    <div className="small text-muted">Published</div>
                    <div>{book.publishedDate}</div>
                  </div>
                )}
                {book.publisher && (
                  <div className="col-6 col-lg-4">
                    <div className="small text-muted">Publisher</div>
                    <div>{book.publisher}</div>
                  </div>
                )}
                {book.language && (
                  <div className="col-6 col-lg-4">
                    <div className="small text-muted">Language</div>
                    <div>{book.language}</div>
                  </div>
                )}
              </div>

              <div className="mb-3">
                <h5 className="pp-section-title">Description</h5>
                <Description description={book.description} />
              </div>

              {ai_error && <div className="alert alert-warning">AI insights unavailable: {ai_error}</div>}
              {aiLoading && <div className="small text-muted mb-2">Generating AI insights…</div>}

              {ai?.summary && (
                <div className="mb-3">
                  <h5 className="pp-section-title">AI Summary</h5>
                  <p className="mb-0">{ai.summary}</p>
                </div>
              )}

              {ai?.insights?.length ? (
                <div className="mb-3">
                  <h5 className="pp-section-title">AI Insights</h5>
                  <ul className="mb-0">{ai.insights.map((x, i) => <li key={i}>{x}</li>)}</ul>
                </div>
              ) : null}

              {ai?.reviews?.length ? (
                <div className="mb-3">
                  <h5 className="pp-section-title">AI Review Highlights</h5>
                  <ul className="mb-0">{ai.reviews.map((r, i) => <li key={i}>{r}</li>)}</ul>
                </div>
              ) : null}

              {buyLinks?.length ? (
                <div className="mb-2">
                  <div className="small text-muted">Buy Links</div>
                  <div className="d-flex flex-wrap gap-2 mt-1">
                    {buyLinks.map((l) => (
                      <a key={l.href} className="btn btn-sm btn-outline-primary" href={l.href} target="_blank" rel="noreferrer">
                        {l.label}
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}

              {book.previewLink && (
                <a href={book.previewLink} className="btn btn-outline-primary mt-2" target="_blank" rel="noreferrer">
                  Preview on Google Books
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {moreFromAuthor?.length ? (
        <div className="mt-4">
          <h5 className="mb-3 pp-section-title">More from {author?.name || "this author"}</h5>
          <div className="row g-3">
            {moreFromAuthor.map((b) => (
              <div className="col-6 col-md-3" key={b.workId}>
                <div className="card h-100 border-0 shadow-sm rounded-4">
                  {b.coverUrl && (
                    <Link to={`/book/${encodeURIComponent(b.workId)}`}>
                      <img src={b.coverUrl} className="card-img-top rounded-top-4" alt={b.title} />
                    </Link>
                  )}
                  <div className="card-body">
                    <div className="small fw-semibold">
                      <Link to={`/book/${encodeURIComponent(b.workId)}`} className="text-decoration-none text-body">
                        {b.title}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
