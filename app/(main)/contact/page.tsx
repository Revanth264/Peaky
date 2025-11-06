'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function ContactPage() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    subject: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // In a real app, you would send this to your backend/email service
    // For now, we'll just show a success message
    setTimeout(() => {
      toast.success('Thank you! We\'ll get back to you soon.')
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        subject: '',
        message: '',
      })
      setLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-2">Contact Us</h1>
          <p className="text-gray-600 mb-8">
            Have a question or need help? We'd love to hear from you. Send us a message and we'll
            respond as soon as possible.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your.email@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Subject</label>
              <Input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="What is this regarding?"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="How can we help you?"
                rows={6}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              />
            </div>

            <Button type="submit" variant="primary" disabled={loading} className="w-full">
              {loading ? 'Sending...' : 'Send Message'}
            </Button>
          </form>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-semibold mb-4">Other Ways to Reach Us</h2>
            <div className="space-y-3 text-gray-600">
              <div className="flex items-center gap-3">
                <span className="font-medium">Email:</span>
                <a href="mailto:support@peakime.com" className="text-primary-600 hover:underline">
                  support@peakime.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-medium">Phone:</span>
                <span>+91 XXX XXX XXXX</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-medium">Address:</span>
                <span>Peakime Store, India</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

