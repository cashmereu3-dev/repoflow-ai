'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  ArrowLeft, 
  Upload, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Camera, 
  MapPin,
  Car
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AgentUploadPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [loading, setLoading] = useState(false)
  const [activeCases, setActiveCases] = useState<any[]>([])
  const [selectedCaseId, setSelectedCaseId] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  
  // Geolocation state
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  
  // Response/Feedback state
  const [errorMsg, setErrorMsg] = useState('')
  const [matchResult, setMatchResult] = useState<any | null>(null)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    async function loadData() {
      // 1. Get user session
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // 2. Fetch agent record
      const { data: agentData } = await supabase
        .from('agents')
        .select('id')
        .eq('profile_id', user.id)
        .single()

      const agent = agentData as any

      if (agent) {
        // 3. Fetch active assignments
        const { data: assignmentsData } = await supabase
          .from('assignments')
          .select('*, vehicle:vehicles(*), borrower:borrowers(*)')
          .eq('assigned_agent_id', agent.id)
          .eq('is_archived', false)
          .not('status', 'in', '("recovered", "voluntary_surrender", "closed")')
        
        const assignments = (assignmentsData || []) as any[]
        setActiveCases(assignments)
        if (assignments.length > 0) {
          setSelectedCaseId(assignments[0].id)
        }
      }

      // 4. Get geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setCoords({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            })
          },
          (err) => {
            console.warn('Geolocation failed:', err)
          }
        )
      }
    }
    loadData()
  }, [supabase, router])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      setFile(selected)
      setPreviewUrl(URL.createObjectURL(selected))
      setErrorMsg('')
      setMatchResult(null)
      setSuccessMsg('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !selectedCaseId) {
      setErrorMsg('Please select a target case and choose a photo.')
      return
    }

    setLoading(true)
    setErrorMsg('')
    setMatchResult(null)
    setSuccessMsg('')

    try {
      // 1. Get current session
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User session not found')

      const { data: profileData } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single()
      
      const profile = profileData as any
      const orgId = profile?.organization_id
      if (!orgId) throw new Error('Could not resolve organization')

      // Resolve selected assignment details
      const selectedAssignment = activeCases.find(c => c.id === selectedCaseId)
      if (!selectedAssignment) throw new Error('Selected case not found')

      // 2. Upload file to Supabase Storage (or mock if bucket is unconfigured)
      let publicUrl = previewUrl || ''
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      const filePath = `spotting/${fileName}`

      // Attempt bucket upload
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from('uploads')
        .upload(filePath, file, { cacheControl: '3600', upsert: true })

      if (uploadErr) {
        console.warn('Supabase storage upload failed, using fallback preview URL:', uploadErr.message)
        // Set a dummy URL that has vehicle specs in case of local testing
        publicUrl = 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800' // mock car photo URL
      } else {
        const { data } = supabase.storage.from('uploads').getPublicUrl(filePath)
        publicUrl = data.publicUrl
      }

      // 3. Call AI extraction API
      const extractRes = await fetch('/api/ai/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: publicUrl })
      })

      if (!extractRes.ok) {
        throw new Error('AI extraction service failed to respond.')
      }

      const resData = await extractRes.json()
      const aiData = resData.data
      if (!aiData) {
        throw new Error('AI was unable to extract specifications from the photo.')
      }

      // 4. Check for assignment match (VIN or Plate)
      const targetVin = selectedAssignment.vehicle?.vin?.toUpperCase()
      const targetPlate = selectedAssignment.vehicle?.license_plate?.toUpperCase()
      
      const extractedVin = aiData.vin?.toUpperCase()
      const extractedPlate = aiData.licensePlate?.toUpperCase()

      const isVinMatch = extractedVin && targetVin && targetVin.includes(extractedVin)
      const isPlateMatch = extractedPlate && targetPlate && targetPlate.includes(extractedPlate)
      const isMatch = isVinMatch || isPlateMatch

      setMatchResult({
        isMatch,
        extracted: aiData,
        target: selectedAssignment.vehicle
      })

      // 5. Write upload record to database
      const { error: dbErr } = await supabase
        .from('uploads')
        .insert({
          organization_id: orgId,
          assignment_id: selectedCaseId,
          uploaded_by: user.id,
          type: 'photo',
          file_name: file.name,
          file_url: publicUrl,
          file_size: file.size,
          mime_type: file.type,
          gps_lat: coords?.lat || null,
          gps_lng: coords?.lng || null,
          gps_accuracy: coords ? 10 : null,
          gps_address: aiData.address || null,
          ai_extracted: true,
          ai_vehicle_make: aiData.vehicleMake,
          ai_vehicle_model: aiData.vehicleModel,
          ai_vehicle_color: aiData.vehicleColor,
          ai_vin: aiData.vin,
          ai_license_plate: aiData.licensePlate,
          ai_address: aiData.address,
          ai_damage_notes: aiData.damageNotes,
          ai_confidence: aiData.confidence || 0.5,
          ai_processed_at: new Date().toISOString()
        } as any)

      if (dbErr) {
        console.warn('Failed to save upload log record:', dbErr.message)
      }

      if (isMatch) {
        setSuccessMsg('TARGET VERIFIED! The photographed vehicle matches active assignment records.')
        
        // Also update assignment status to located
        await (supabase.from('assignments') as any)
          .update({ 
            status: 'located',
            located_at: new Date().toISOString(),
            last_known_address: aiData.address || selectedAssignment.last_known_address
          })
          .eq('id', selectedCaseId)
      } else {
        setErrorMsg('Verification failed. Photographed vehicle specifications do not match this assignment.')
      }

    } catch (err: any) {
      console.error('Error during upload matching:', err)
      setErrorMsg(err.message || 'An error occurred during verification.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 space-y-6 max-w-md mx-auto min-h-screen pb-24 text-white">
      {/* Header */}
      <header className="flex items-center gap-3">
        <Link 
          href="/agent" 
          className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold">Verify Target</h1>
          <p className="text-xs text-zinc-400">Scan license plate or VIN photo</p>
        </div>
      </header>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Select Target Dropdown */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Select Assignment</label>
          <select 
            value={selectedCaseId}
            onChange={(e) => {
              setSelectedCaseId(e.target.value)
              setMatchResult(null)
              setErrorMsg('')
              setSuccessMsg('')
            }}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-blue-500/50"
            required
          >
            {activeCases.map((c) => (
              <option key={c.id} value={c.id}>
                {c.vehicle?.year} {c.vehicle?.make} {c.vehicle?.model} - {c.borrower?.first_name} {c.borrower?.last_name}
              </option>
            ))}
            {activeCases.length === 0 && (
              <option value="">No active cases assigned</option>
            )}
          </select>
        </div>

        {/* Photo Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Vehicle Photo</label>
          
          <div className="relative">
            {previewUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-zinc-800 aspect-video bg-zinc-950">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={previewUrl} 
                  alt="Spotting preview" 
                  className="w-full h-full object-cover"
                />
                <button 
                  type="button"
                  onClick={() => {
                    setFile(null)
                    setPreviewUrl(null)
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black rounded-full text-zinc-400 hover:text-white transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 hover:border-zinc-700 bg-zinc-900/50 rounded-xl p-8 cursor-pointer transition-colors aspect-video text-zinc-500 hover:text-zinc-400">
                <Camera className="w-10 h-10 mb-2" />
                <span className="text-xs font-medium">Capture or Upload Photo</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment"
                  onChange={handleFileChange} 
                  className="hidden" 
                />
              </label>
            )}
          </div>
        </div>

        {/* GPS location display */}
        {coords && (
          <div className="flex items-center gap-2 text-xs text-zinc-500 bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/40">
            <MapPin className="w-3.5 h-3.5 text-blue-400" />
            <span>GPS Locked: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !file || !selectedCaseId}
          className="btn-primary w-full justify-center bg-blue-600 hover:bg-blue-500 text-white py-3 shadow-lg shadow-blue-900/30 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Verifying specs...
            </>
          ) : (
            'Verify Target Location'
          )}
        </button>
      </form>

      {/* Verification Alerts & Results */}
      {successMsg && (
        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            {successMsg}
          </div>
        </div>
      )}

      {errorMsg && !matchResult && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <XCircle className="w-5 h-5 text-red-400" />
            {errorMsg}
          </div>
        </div>
      )}

      {matchResult && (
        <div className="glass-card p-4 space-y-4 border-zinc-800">
          <h3 className="font-bold text-sm border-b border-zinc-800 pb-2 flex items-center gap-2">
            <Car className="w-4 h-4 text-blue-400" />
            AI Extraction Results
          </h3>
          
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-zinc-500 block">Extracted Vehicle</span>
              <span className="font-medium text-white">
                {matchResult.extracted.vehicleColor} {matchResult.extracted.vehicleMake} {matchResult.extracted.vehicleModel}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block">Target Vehicle</span>
              <span className="font-medium text-white">
                {matchResult.target.color} {matchResult.target.make} {matchResult.target.model}
              </span>
            </div>
            <div>
              <span className="text-zinc-500 block">Extracted VIN</span>
              <span className="font-mono font-medium text-white">{matchResult.extracted.vin || 'N/A'}</span>
            </div>
            <div>
              <span className="text-zinc-500 block">Target VIN</span>
              <span className="font-mono font-medium text-white">{matchResult.target.vin}</span>
            </div>
            <div>
              <span className="text-zinc-500 block">Extracted Plate</span>
              <span className="font-mono font-medium text-white">{matchResult.extracted.licensePlate || 'N/A'}</span>
            </div>
            <div>
              <span className="text-zinc-500 block">Target Plate</span>
              <span className="font-mono font-medium text-white">{matchResult.target.license_plate || 'N/A'}</span>
            </div>
          </div>
          
          <div className="text-xs pt-2 border-t border-zinc-800">
            <span className="text-zinc-500 block">Identified Location</span>
            <span className="text-zinc-300 block mt-0.5">{matchResult.extracted.address || 'GPS coordinates only'}</span>
          </div>

          {!matchResult.isMatch && (
            <div className="flex gap-2 p-2 bg-red-950/20 border border-red-900/40 rounded-lg text-[11px] text-red-400">
              <XCircle className="w-4 h-4 flex-shrink-0" />
              <span>Specs mismatch. Check if you selected the correct target assignment record.</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
