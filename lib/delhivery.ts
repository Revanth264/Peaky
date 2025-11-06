import axios from 'axios'

const DELHIVERY_API_KEY = process.env.DELHIVERY_API_KEY || ''
const DELHIVERY_BASE_URL = process.env.DELHIVERY_BASE_URL || 'https://track.delhivery.com/api/v1'

export interface DelhiveryShipment {
  shipment: {
    name: string
    phone: string
    add: string
    city: string
    state: string
    pin: string
    country: string
    order_date: string
    payment_mode: string
    total_amount: number
    order_id: string
  }
}

export interface DelhiveryResponse {
  success: boolean
  packages?: Array<{
    waybill: string
    client_name: string
    status: string
  }>
  error?: string
}

export async function createDelhiveryShipment(order: any): Promise<any> {
  try {
    const shippingAddress = order.shippingAddress

    const shipmentData: DelhiveryShipment = {
      shipment: {
        name: shippingAddress.name,
        phone: shippingAddress.phone,
        add: `${shippingAddress.addressLine1} ${shippingAddress.addressLine2 || ''}`.trim(),
        city: shippingAddress.city,
        state: shippingAddress.state,
        pin: shippingAddress.pincode,
        country: shippingAddress.country || 'India',
        order_date: new Date().toISOString(),
        payment_mode: 'Prepaid',
        total_amount: order.total,
        order_id: order.orderNumber,
      },
    }

    const response = await axios.post(
      `${DELHIVERY_BASE_URL}/create-shipment`,
      shipmentData,
      {
        headers: {
          'Authorization': `Token ${DELHIVERY_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    )

    return response.data
  } catch (error: any) {
    console.error('Delhivery API error:', error.response?.data || error.message)
    throw new Error('Failed to create Delhivery shipment')
  }
}

export async function trackDelhiveryShipment(waybill: string): Promise<any> {
  try {
    const response = await axios.get(`${DELHIVERY_BASE_URL}/track/${waybill}`, {
      headers: {
        'Authorization': `Token ${DELHIVERY_API_KEY}`,
      },
    })

    return response.data
  } catch (error: any) {
    console.error('Delhivery tracking error:', error.response?.data || error.message)
    throw new Error('Failed to track shipment')
  }
}

export async function checkDelhiveryServiceability(pincode: string): Promise<boolean> {
  try {
    const response = await axios.get(
      `${DELHIVERY_BASE_URL}/serviceability/${pincode}`,
      {
        headers: {
          'Authorization': `Token ${DELHIVERY_API_KEY}`,
        },
      }
    )

    return response.data?.serviceable || false
  } catch (error) {
    console.error('Delhivery serviceability check error:', error)
    return false
  }
}
