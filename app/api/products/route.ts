import { NextRequest, NextResponse } from 'next/server'
import { getProducts, createProduct } from '@/lib/firestore-products'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category') || undefined
    const search = searchParams.get('search') || undefined
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined
    const featured = searchParams.get('featured') === 'true' ? true : undefined
    const limited = searchParams.get('limited') === 'true' ? true : undefined
    const sale = searchParams.get('sale') === 'true' ? true : undefined
    const newArrivals = searchParams.get('new') === 'true' ? true : undefined
    const sortBy = searchParams.get('sort') || 'createdAt:desc'
    const limitCount = parseInt(searchParams.get('limit') || '12')
    const startAfterId = searchParams.get('startAfter') || undefined

    const result = await getProducts({
      search,
      category,
      minPrice,
      maxPrice,
      featured,
      limited,
      sale,
      newArrivals,
      status: 'active',
      limit: limitCount,
      startAfterId,
      sortBy,
    })

    return NextResponse.json({
      products: result.products,
      pagination: {
        hasMore: result.hasMore,
        lastId: result.lastId,
      },
    })
  } catch (error: any) {
    // Silently return empty array if Firebase Admin is not configured
    // This prevents console noise when credentials are missing
    if (error.message?.includes('Firebase Admin') || error.message?.includes('not initialized')) {
      return NextResponse.json({
        products: [],
        pagination: {
          hasMore: false,
          lastId: undefined,
        },
      })
    }
    
    console.error('Get products error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // In production, add admin authentication check here
    const data = await request.json()
    const productId = await createProduct(data)

    return NextResponse.json({ 
      product: { id: productId, ...data },
      message: 'Product created successfully'
    }, { status: 201 })
  } catch (error: any) {
    console.error('Create product error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create product' },
      { status: 500 }
    )
  }
}
