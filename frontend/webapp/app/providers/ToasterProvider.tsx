'use client'

import React, { useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'

export default function ToasterProvider() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <Toaster
      position='bottom-right'
      toastOptions={{
        style: {
          background: 'transparent',
          boxShadow: 'none',
          padding: 0,
        },
      }}
    />
  )
}
