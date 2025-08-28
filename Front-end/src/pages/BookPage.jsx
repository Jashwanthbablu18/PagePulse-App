import { useParams } from 'react-router-dom'
import BookDetails from '../components/BookDetails'

export default function BookPage() {
  const { workId } = useParams() // this is actually a Google Books volume ID
  return (
    <section className="py-4">
      <BookDetails workId={workId} />
    </section>
  )
}
