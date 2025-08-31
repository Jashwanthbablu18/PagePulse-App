// src/App.jsx
import React from "react"
import { Routes, Route } from "react-router-dom"
import HomePage from "./pages/HomePage.jsx"
import BookPage from "./pages/BookPage.jsx"
import About from "./pages/About.jsx"
import NotFound from "./pages/NotFound.jsx"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/book/:workId" element={<BookPage />} />
      <Route path="/about" element={<About />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
