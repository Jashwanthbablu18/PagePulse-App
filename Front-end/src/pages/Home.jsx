import SearchBar from '../components/SearchBar'

export default function Home() {
  return (
    <section className="pp-hero d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-9 text-center">
            <h1 className="display-5 fw-bold mb-2 text-gradient">PagePulse</h1>
            <p className="lead text-muted mb-4">Your next read, one pulse away</p>
            <div className="d-flex justify-content-center">
              <SearchBar />
            </div>
            <p className="text-muted mt-4">Discover book metadata, ratings and AI summaries in one place.</p>
          </div>
        </div>
      </div>
    </section>
  )
}
