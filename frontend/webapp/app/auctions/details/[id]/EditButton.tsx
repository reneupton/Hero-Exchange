'use client'

import Link from 'next/link'
import React from 'react'

type Props={
    id: string
}

export default function EditButton({id} : Props) {
  return (
    <Link
        href={`/auctions/update/${id}`}
        className="soft-button-ghost px-4 py-2 rounded-xl text-sm font-medium"
    >
        Update Auction
    </Link>
  )
}
