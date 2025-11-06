'use client'

import { useState } from 'react'

export function Accordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div className="divide-y divide-gray-200">
      {items.map((it, i) => (
        <div key={i}>
          <button
            className="w-full text-left py-4 font-semibold flex items-center justify-between"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span>{it.q}</span>
            <span className="text-primary-600">{open === i ? '−' : '+'}</span>
          </button>
          <div
            className={`overflow-hidden transition-all duration-300 ${
              open === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <p className="pb-4 text-gray-600">{it.a}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

