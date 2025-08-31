// Front-end/src/App.jsx
import React from "react"
import { Routes, Route } from "react-router-dom"
import HomePage from "./pages/HomePage.jsx"
import SearchResults from "./pages/SearchResults.jsx"
import BookDetails from "./pages/BookDetails.jsx"
import NotFound from "./pages/NotFound.jsx"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/search" element={<SearchResults />} />
      <Route path="/book/:id" element={<BookDetails />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
