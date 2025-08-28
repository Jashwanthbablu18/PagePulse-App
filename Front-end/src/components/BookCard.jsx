// src/components/BookCard.jsx
import { Link } from 'react-router-dom'

export default function BookCard({ book }) {
  const id = book?.id || book?.workId
  const title = book?.title
  const authors = book?.authors || (book?.author ? [book.author] : [])
  const thumbnail = book?.thumbnail || book?.coverUrl

  return (
    <div className="card h-100 shadow-sm border-0 rounded-4">
      {thumbnail && <img src={thumbnail} className="card-img-top rounded-top-4" alt={title} />}
      <div className="card-body">
        <h5 className="card-title mb-1">{title}</h5>
        {!!authors?.length && <p className="card-subtitle text-muted">{authors.join(', ')}</p>}
      </div>
      <div className="card-footer bg-white border-0">
        {id && <Link to={`/book/${encodeURIComponent(id)}`} className="btn btn-outline-primary w-100">View</Link>}
      </div>
    </div>
  )
}
