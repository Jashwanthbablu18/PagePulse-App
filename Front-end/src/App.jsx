import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import BookPage from './pages/BookPage'
import NotFound from './pages/NotFound'
import Header from './components/Header'
import Footer from './components/Footer'

export default function App() {
  return (
    <div className="app d-flex flex-column min-vh-100 bg-body">
      <Header />
      <main className="flex-fill">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/book/:workId" element={<BookPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
