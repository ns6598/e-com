import React from 'react'
import Button from '../components/ui/Button'
import PageTransition from '../components/motion/PageTransition'

export default function NotFoundPage() {
  return (
    <PageTransition className="max-w-3xl mx-auto px-4 py-28 text-center space-y-6 text-white">
      <span className="tag-overline text-[#D4AF37] block font-mono">PAGE NOT FOUND</span>
      <h1 className="editorial-title text-4xl sm:text-6xl font-serif text-white">
        404 — Void in Space
      </h1>
      <p className="font-serif text-base text-gray-400 max-w-md mx-auto font-light">
        The silhouette or document you are attempting to view does not exist in the active AUREVA collection.
      </p>
      <div className="pt-4">
        <Button variant="primary" size="lg" to="/" magnetic={true}>
          Return to Atelier
        </Button>
      </div>
    </PageTransition>
  )
}
