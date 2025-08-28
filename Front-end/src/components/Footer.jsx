export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="mt-auto py-4 border-top bg-white">
      <div className="container text-center small text-muted">
        Made with <span className="text-danger">❤</span> by <strong>Jashwanth N</strong> — PagePulse · © {year}
      </div>
    </footer>
  )
}
