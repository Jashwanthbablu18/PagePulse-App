import { Link, NavLink } from 'react-router-dom'
import logo from '../assets/logo.png'   // adjust path if your logo is stored elsewhere

export default function Header() {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top">
      <div className="container">
        <Link to="/" className="navbar-brand d-flex align-items-center fw-bold text-gradient">
          <img 
            src={logo} 
            alt="PagePulse Logo" 
            width="120" 
            height="90" 
            className="me-2"
          />
          {/* PagePulse */}
        </Link>
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#nav" 
          aria-controls="nav" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="nav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item"><NavLink to="/" className="nav-link">Home</NavLink></li>
            <li className="nav-item"><NavLink to="/about" className="nav-link">About</NavLink></li>
          </ul>
        </div>
      </div>
    </nav>
  )
}
