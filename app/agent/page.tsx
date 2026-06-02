import Link from 'next/link'
import { MapPin, Target, TrendingUp, Upload, AlertCircle } from 'lucide-react'

export default function AgentDashboardPage() {
  // Mock data for the dashboard presentation
  const stats = {
    activeAssignments: 14,
    nearbyTargets: 3,
    recoveryRate: '82%',
  }

  const nearbyAssignments = [
    { id: 'a1', distance: '1.2 mi', vehicle: '2020 Toyota Camry', vin: '...4F8A', address: '123 Main St, Sector A' },
    { id: 'a2', distance: '2.8 mi', vehicle: '2021 Ford F-150', vin: '...9B2X', address: '456 Elm St, Sector B' },
    { id: 'a3', distance: '4.5 mi', vehicle: '2019 Honda Accord', vin: '...7C1Y', address: '789 Oak St, Sector C' },
  ]

  return (
    <div className="p-4 space-y-6 max-w-md mx-auto">
      {/* Header */}
      <header className="py-2 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Agent Hub</h1>
          <p className="text-sm text-zinc-400">Stay safe out there.</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 p-2 rounded-full relative">
          <AlertCircle className="h-5 w-5 text-zinc-300" />
          <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-zinc-900"></span>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 flex flex-col justify-between shadow-sm">
          <div className="flex items-center space-x-2 text-zinc-400 mb-3">
            <Target className="h-4 w-4 text-blue-400" />
            <span className="text-xs font-semibold uppercase tracking-wider">Active</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.activeAssignments}</p>
        </div>
        <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 flex flex-col justify-between shadow-sm">
          <div className="flex items-center space-x-2 text-zinc-400 mb-3">
            <TrendingUp className="h-4 w-4 text-green-400" />
            <span className="text-xs font-semibold uppercase tracking-wider">Success</span>
          </div>
          <p className="text-3xl font-bold text-white">{stats.recoveryRate}</p>
        </div>
      </div>

      {/* Quick Upload Action */}
      <div className="bg-gradient-to-br from-blue-900/60 to-zinc-900 rounded-xl p-6 border border-blue-800/40 flex flex-col items-center justify-center text-center space-y-4 relative overflow-hidden">
        <div className="absolute -right-6 -top-6 h-24 w-24 bg-blue-600/20 rounded-full blur-2xl"></div>
        <div className="absolute -left-6 -bottom-6 h-24 w-24 bg-indigo-600/20 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 space-y-3">
          <h2 className="text-lg font-bold text-white">Target Spotted?</h2>
          <p className="text-sm text-zinc-300 px-4">
            Scan a license plate or vehicle photo for instant AI verification.
          </p>
          <Link 
            href="/agent/upload"
            className="inline-flex items-center justify-center rounded-full bg-blue-600 hover:bg-blue-500 text-white h-12 px-8 font-medium transition-colors w-full shadow-lg shadow-blue-900/50"
          >
            <Upload className="mr-2 h-5 w-5" />
            Upload Photo
          </Link>
        </div>
      </div>

      {/* Nearby Assignments */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Nearby Targets</h2>
          <span className="text-xs font-medium bg-zinc-800 text-zinc-300 px-2 py-1 rounded-full">
            {stats.nearbyTargets} Found
          </span>
        </div>
        
        <div className="space-y-3">
          {nearbyAssignments.map((assignment) => (
            <div key={assignment.id} className="bg-zinc-900 rounded-xl p-4 border border-zinc-800 flex items-start space-x-4 shadow-sm">
              <div className="bg-red-500/10 rounded-lg p-2 mt-0.5">
                <MapPin className="h-5 w-5 text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-white truncate">{assignment.vehicle}</h3>
                  <span className="text-xs font-bold text-blue-400 whitespace-nowrap ml-2">{assignment.distance}</span>
                </div>
                <div className="flex items-center mt-0.5 space-x-2">
                  <span className="text-xs text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded font-mono">VIN {assignment.vin}</span>
                </div>
                <p className="text-sm text-zinc-400 mt-2 truncate">{assignment.address}</p>
                <div className="mt-3 flex gap-2">
                  <button className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white text-xs py-2 rounded-md transition-colors font-semibold">
                    Details
                  </button>
                  <button className="flex-1 bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 text-xs py-2 rounded-md transition-colors font-semibold border border-blue-900/30">
                    Navigate
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
