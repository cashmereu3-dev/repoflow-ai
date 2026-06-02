import { NextResponse } from 'next/server'
import { extractVehicleDataFromImage } from '@/lib/ai/extract'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { image } = body

    if (!image) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 })
    }

    // Call the AI extraction utility
    const result = await extractVehicleDataFromImage(image)

    return NextResponse.json({ data: result })
  } catch (error) {
    console.error('Error extracting vehicle data:', error)
    return NextResponse.json(
      { error: 'Failed to extract data from image' },
      { status: 500 }
    )
  }
}
