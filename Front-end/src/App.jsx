// Front-end/src/App.jsx
import React from "react"
import { Routes, Route } from "react-router-dom"
import HomePage from "./pages/HomePage"
import SearchResults from "./pages/SearchResults"
import BookDetails from "./pages/BookDetails"
import NotFound from "./pages/NotFound"

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
