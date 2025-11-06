// Dummy product data generator for demo purposes
export const generateDummyProducts = () => {
  const categories = ['apparel', 'accessories', 'collectibles', 'home']
  const subcategories = {
    apparel: ['tees', 'hoodies', 'jackets', 'oversized', 'seasonal'],
    accessories: ['keychains', 'phone-cases', 'badges', 'caps', 'tote-bags'],
    collectibles: ['figures', 'model-kits', 'posters', 'metal-art', 'plushies'],
    home: ['mugs', 'lamps', 'mousepads', 'stickers']
  }

  const productNames = [
    // Apparel
    'Void Century Joy Tee', 'Anime Hero Hoodie', 'Limited Edition Jacket', 'Oversized Comfort Tee', 'Seasonal Collection Shirt',
    // Accessories
    'Premium Keychain', 'Protective Phone Case', 'Exclusive Badge Set', 'Designer Cap', 'Canvas Tote Bag',
    // Collectibles
    'Joy Figure Statue', 'Model Kit Collection', 'Premium Poster Set', 'Metal Art Piece', 'Plushie Collection',
    // Home
    'Anime Mug Set', 'LED Desk Lamp', 'Gaming Mousepad', 'Sticker Pack'
  ]

  // Category-specific image URLs
  const categoryImages: Record<string, string[]> = {
    apparel: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500&h=500&fit=crop'
    ],
    accessories: [
      'https://images.unsplash.com/photo-1611250503158-85c8acac7e5c?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1600298881974-6be191ceeda1?w=500&h=500&fit=crop'
    ],
    collectibles: [
      'https://images.unsplash.com/photo-1594736797933-d0c1d0d3e0e5?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=500&h=500&fit=crop'
    ],
    home: [
      'https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=500&h=500&fit=crop',
      'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500&h=500&fit=crop'
    ]
  }

  const products = []
  let productIndex = 0

  categories.forEach((category, catIdx) => {
    subcategories[category as keyof typeof subcategories].forEach((subcategory, subIdx) => {
      const name = productNames[productIndex % productNames.length]
      const basePrice = 299 + Math.floor(Math.random() * 2000)
      const comparePrice = basePrice + Math.floor(Math.random() * 500)
      const hasDiscount = Math.random() > 0.5
      const isLimited = Math.random() > 0.7
      const isNew = Math.random() > 0.6
      const isBestSeller = Math.random() > 0.7
      const isOnSale = hasDiscount && Math.random() > 0.5

      products.push({
        _id: `prod-${category}-${subcategory}-${productIndex}`,
        id: `prod-${category}-${subcategory}-${productIndex}`,
        name: name,
        price: hasDiscount ? Math.floor(basePrice * 0.8) : basePrice,
        comparePrice: hasDiscount ? comparePrice : undefined,
        images: categoryImages[category] || [
          'https://images.unsplash.com/photo-1611250503158-85c8acac7e5c?w=500&h=500&fit=crop',
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop'
        ],
        category: category,
        subcategory: subcategory,
        stock: Math.floor(Math.random() * 50) + 5,
        rating: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
        featured: isBestSeller || isNew,
        isLimited: isLimited,
        isNew: isNew,
        isBestSeller: isBestSeller,
        isOnSale: isOnSale,
        tags: [category, subcategory, 'anime', 'premium'],
        createdAt: new Date().toISOString(),
      })
      productIndex++
    })
  })

  return products
}

// Helper functions to filter products
export const getNewArrivalsProducts = (products: any[]) => {
  return products.filter(p => p.isNew).slice(0, 8)
}

export const getLimitedEditionsProducts = (products: any[]) => {
  return products.filter(p => p.isLimited).slice(0, 8)
}

export const getBestSellersProducts = (products: any[]) => {
  return products.filter(p => p.isBestSeller).slice(0, 8)
}

export const getSaleProducts = (products: any[]) => {
  return products.filter(p => p.isOnSale).slice(0, 8)
}

