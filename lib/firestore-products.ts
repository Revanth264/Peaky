import { getDb } from './firebase-admin'
import type { Query } from 'firebase-admin/firestore'

export interface Product {
  id?: string
  name: string
  description: string
  price: number
  comparePrice?: number
  images: string[]
  category: string
  subcategory?: string
  brand?: string
  sku: string
  stock: number
  sizes?: string[]
  colors?: string[]
  rating: number
  reviewsCount: number
  featured: boolean
  status: 'active' | 'inactive' | 'draft'
  tags: string[]
  createdAt?: Date
  updatedAt?: Date
}

// Server-side functions (using Firebase Admin SDK)
export async function getProductById(id: string): Promise<Product | null> {
  try {
    const db = getDb()
    if (!db) {
      // Firebase Admin not initialized, return null gracefully
      return null
    }
    const productDoc = await db.collection('products').doc(id).get()
    if (!productDoc.exists) {
      return null
    }
    const data = productDoc.data()
    return { 
      id: productDoc.id, 
      ...data,
      createdAt: data?.createdAt?.toDate ? data.createdAt.toDate() : data?.createdAt,
      updatedAt: data?.updatedAt?.toDate ? data.updatedAt.toDate() : data?.updatedAt,
    } as Product
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

export async function getProducts(filters: {
  search?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  featured?: boolean
  limited?: boolean
  sale?: boolean
  newArrivals?: boolean
  status?: string
  limit?: number
  startAfterId?: string
  sortBy?: string
}): Promise<{ products: Product[], hasMore: boolean, lastId?: string }> {
  try {
    const db = getDb()
    if (!db) {
      // Firebase Admin not initialized, return empty array gracefully
      return { products: [], hasMore: false }
    }
    let q: Query = db.collection('products')

    // Apply filters
    if (filters.category) {
      q = q.where('category', '==', filters.category)
    }
    if (filters.status) {
      q = q.where('status', '==', filters.status)
    } else {
      q = q.where('status', '==', 'active')
    }
    if (filters.featured !== undefined) {
      q = q.where('featured', '==', filters.featured)
    }
    if (filters.limited !== undefined) {
      q = q.where('isLimited', '==', filters.limited)
    }
    if (filters.sale !== undefined) {
      q = q.where('isOnSale', '==', filters.sale)
    }
    if (filters.newArrivals) {
      // For new arrivals, we'll sort by createdAt desc and filter in the results if needed
      // Firestore doesn't support date range queries easily, so we'll handle this in the results
    }
    if (filters.minPrice) {
      q = q.where('price', '>=', filters.minPrice)
    }
    if (filters.maxPrice) {
      q = q.where('price', '<=', filters.maxPrice)
    }

    // Sorting
    if (filters.sortBy) {
      const [field, direction] = filters.sortBy.split(':')
      q = q.orderBy(field, direction === 'desc' ? 'desc' : 'asc')
    } else {
      q = q.orderBy('createdAt', 'desc')
    }

    // Pagination
    if (filters.startAfterId) {
      const paginationDb = getDb()
      if (paginationDb) {
        const startAfterDoc = await paginationDb.collection('products').doc(filters.startAfterId).get()
        if (startAfterDoc.exists) {
          q = q.startAfter(startAfterDoc)
        }
      }
    }

    const pageSize = filters.limit || 20
    q = q.limit(pageSize + 1) // Get one extra to check if there are more

    const snapshot = await q.get()
    const products: Product[] = []
    let hasMore = false
    let lastId: string | undefined

    snapshot.docs.slice(0, pageSize).forEach((doc) => {
      const data = doc.data()
      products.push({ 
        id: doc.id, 
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
      } as Product)
      lastId = doc.id
    })

    if (snapshot.docs.length > pageSize) {
      hasMore = true
    }

    // Client-side filtering
    let filteredProducts = products
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    // Filter for new arrivals (products created in last 30 days)
    if (filters.newArrivals) {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      filteredProducts = filteredProducts.filter(p => {
        const createdAt = p.createdAt instanceof Date ? p.createdAt : new Date(p.createdAt)
        return createdAt >= thirtyDaysAgo || (p as any).isNew === true
      })
    }

    return { products: filteredProducts, hasMore, lastId }
  } catch (error) {
    console.error('Error fetching products:', error)
    return { products: [], hasMore: false }
  }
}

export async function createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const db = getDb()
    if (!db) {
      throw new Error('Firebase Admin not initialized. Cannot create product.')
    }
    const { Timestamp } = await import('firebase-admin/firestore')
    const newProduct = {
      ...productData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      rating: productData.rating || 0,
      reviewsCount: productData.reviewsCount || 0,
      featured: productData.featured || false,
      status: productData.status || 'active',
    }
    const docRef = await db.collection('products').add(newProduct)
    return docRef.id
  } catch (error) {
    console.error('Error creating product:', error)
    throw error
  }
}

export async function updateProduct(id: string, productData: Partial<Product>): Promise<void> {
  try {
    const db = getDb()
    if (!db) {
      throw new Error('Firebase Admin not initialized. Cannot update product.')
    }
    const { Timestamp } = await import('firebase-admin/firestore')
    await db.collection('products').doc(id).update({
      ...productData,
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error('Error updating product:', error)
    throw error
  }
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    const db = getDb()
    if (!db) {
      throw new Error('Firebase Admin not initialized. Cannot delete product.')
    }
    await db.collection('products').doc(id).delete()
  } catch (error) {
    console.error('Error deleting product:', error)
    throw error
  }
}

export async function updateProductStock(id: string, quantity: number): Promise<void> {
  try {
    const db = getDb()
    if (!db) {
      throw new Error('Firebase Admin not initialized. Cannot update product stock.')
    }
    const product = await getProductById(id)
    if (!product) {
      throw new Error('Product not found')
    }
    const { Timestamp } = await import('firebase-admin/firestore')
    await db.collection('products').doc(id).update({
      stock: product.stock - quantity,
      updatedAt: Timestamp.now(),
    })
  } catch (error) {
    console.error('Error updating product stock:', error)
    throw error
  }
}

// Client-side functions (for use in React components)
export async function getProductByIdClient(id: string): Promise<Product | null> {
  if (typeof window === 'undefined') {
    return null
  }
  
  try {
    const { db } = await import('./firebase')
    const { doc, getDoc } = await import('firebase/firestore')
    const productDoc = await getDoc(doc(db, 'products', id))
    if (!productDoc.exists()) {
      return null
    }
    const data = productDoc.data()
    return { 
      id: productDoc.id, 
      ...data,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
      updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : data.updatedAt,
    } as Product
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

