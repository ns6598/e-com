import React from 'react'
import Button from '../components/ui/Button'

export default function NotFoundPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-28 text-center space-y-6">
      <span className="tag-overline text-[#6D202D] block">PAGE NOT FOUND</span>
      <h1 className="editorial-title text-4xl sm:text-6xl font-serif text-[#171717]">
        404 — Void in Space
      </h1>
      <p className="font-serif text-base text-[#171717]/70 max-w-md mx-auto font-light">
        The silhouette or document you are attempting to view does not exist in the active AUREVA collection.
      </p>
      <div className="pt-4">
        <Button variant="primary" size="lg" to="/">
          Return to Atelier
        </Button>
      </div>
    </div>
  )
}
