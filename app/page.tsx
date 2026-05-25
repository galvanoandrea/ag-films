import { redirect } from 'next/navigation'

// Home page — redirects to gallery for now.
// Replace with a real home page (hero, categories, etc.) later.
export default function HomePage() {
  redirect('/galleria')
}
