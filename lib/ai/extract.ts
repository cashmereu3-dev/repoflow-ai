import OpenAI from 'openai'
import { AIExtractionResult } from '@/types/index'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy_key_for_build',
})

export async function extractVehicleDataFromImage(
  imageUrl: string
): Promise<AIExtractionResult> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a vehicle repossession documentation AI. 
          Extract all visible vehicle information from images.
          Always respond with valid JSON only.
          Be precise and concise. If information is not visible, use null.`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: imageUrl, detail: 'high' },
            },
            {
              type: 'text',
              text: `Extract all visible vehicle information from this image and return ONLY valid JSON with this exact structure:
{
  "vehicleMake": "string or null",
  "vehicleModel": "string or null", 
  "vehicleColor": "string or null",
  "vin": "string or null (17 chars if visible)",
  "licensePlate": "string or null",
  "address": "string or null (if location indicators visible)",
  "damageNotes": "string or null (describe any visible damage)",
  "confidence": 0.0 to 1.0
}`,
            },
          ],
        },
      ],
      max_tokens: 500,
      temperature: 0.1,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      return { confidence: 0 }
    }

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return { confidence: 0 }
    }

    const parsed = JSON.parse(jsonMatch[0]) as AIExtractionResult
    return {
      ...parsed,
      rawResponse: content,
    }
  } catch (error) {
    console.error('AI extraction error:', error)
    return { confidence: 0 }
  }
}

export async function extractVehicleDataFromVoice(
  audioUrl: string
): Promise<{ transcript: string; extractedData: Partial<AIExtractionResult> }> {
  try {
    // Download audio file
    const audioResponse = await fetch(audioUrl)
    const audioBuffer = await audioResponse.arrayBuffer()
    const audioFile = new File([audioBuffer], 'voice_note.webm', { type: 'audio/webm' })

    // Transcribe with Whisper
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'en',
    })

    const transcript = transcription.text

    // Extract structured data from transcript
    const extractionResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Extract vehicle and location information from repo agent voice notes. Return valid JSON only.',
        },
        {
          role: 'user',
          content: `Extract vehicle information from this voice note transcript and return ONLY valid JSON:

Transcript: "${transcript}"

Return JSON with these fields (use null if not mentioned):
{
  "vehicleMake": null,
  "vehicleModel": null,
  "vehicleColor": null,
  "vin": null,
  "licensePlate": null,
  "address": null,
  "damageNotes": null
}`,
        },
      ],
      max_tokens: 300,
      temperature: 0.1,
    })

    const content = extractionResponse.choices[0]?.message?.content || '{}'
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    const extractedData = jsonMatch ? JSON.parse(jsonMatch[0]) : {}

    return { transcript, extractedData }
  } catch (error) {
    console.error('Voice extraction error:', error)
    return { transcript: '', extractedData: {} }
  }
}
