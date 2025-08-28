export default function About() {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-9">
          <h2 className="fw-bold mb-3 text-gradient">About PagePulse</h2>
          <p className="lead text-muted">Your next read, one pulse away.</p>
          <p>
            PagePulse blends Google Books metadata and optional OpenAI-generated insights to help you evaluate books quickly.
            It's built as a simple open-search product — no accounts, no persistent database.
          </p>
          <p>Thank you for taking the time to visit my website,
            your presence is greatly appreciated!</p>
          <p className="small text-muted">Built with React + Vite (frontend) and Node + Express (backend).</p>
        </div>
      </div>
    </div>
  )
}
