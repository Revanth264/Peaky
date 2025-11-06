import { Accordion } from '@/components/ui/Accordion'

export default function FAQPage() {
  const faqItems = [
    {
      q: 'What is Peakime Store?',
      a: 'Peakime Store is a premium e-commerce platform specializing in anime merchandise, including figures, apparel, collectibles, and accessories. We curate high-quality products for true anime enthusiasts.',
    },
    {
      q: 'Do you ship worldwide?',
      a: 'Yes, we ship globally with reliable carriers. Shipping costs and delivery times vary by location. Free shipping is available on orders above ₹500 within India.',
    },
    {
      q: 'What is your return policy?',
      a: 'We offer a 7-day hassle-free return policy for unused items with original packaging. Items must be in their original condition. Please contact our support team to initiate a return.',
    },
    {
      q: 'How do I track my order?',
      a: 'Once your order is shipped, you will receive a tracking number via email. You can track your order status in your account dashboard or using the Delhivery tracking system.',
    },
    {
      q: 'What payment methods do you accept?',
      a: 'We accept all major credit/debit cards, UPI, net banking, and digital wallets through our secure Razorpay payment gateway. All transactions are encrypted and secure.',
    },
    {
      q: 'Are the products authentic?',
      a: 'Yes, all our products are 100% authentic and sourced directly from authorized distributors and manufacturers. We guarantee the authenticity of every item.',
    },
    {
      q: 'How long does delivery take?',
      a: 'Standard delivery within India takes 3-7 business days. International shipping may take 7-21 business days depending on the destination. Express shipping options are available.',
    },
    {
      q: 'Can I cancel my order?',
      a: 'You can cancel your order within 24 hours of placing it if it hasn\'t been shipped yet. Once shipped, you can return it using our return policy.',
    },
    {
      q: 'Do you offer customer support?',
      a: 'Yes, our customer support team is available via email and phone. You can reach us through the contact page or directly at support@peakime.com.',
    },
    {
      q: 'How do I create an account?',
      a: 'Click on the "Register" or "Sign Up" button in the header, fill in your details, and verify your email. You can also sign up using your Google account for faster registration.',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-2">Frequently Asked Questions</h1>
          <p className="text-gray-600 mb-8">
            Find answers to common questions about shopping, shipping, returns, and more.
          </p>
          <Accordion items={faqItems} />
        </div>

        <div className="mt-8 bg-primary-50 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Still have questions?</h2>
          <p className="text-gray-600 mb-4">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <a
            href="/contact"
            className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  )
}

