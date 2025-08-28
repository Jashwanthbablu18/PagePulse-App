import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container py-5 text-center">
      <h1 className="display-6 fw-bold">404</h1>
      <p className="text-muted mb-4">We couldn’t find that page.</p>
      <Link to="/" className="btn btn-primary">Back to Home</Link>
    </div>
  )
}
