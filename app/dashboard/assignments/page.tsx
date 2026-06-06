import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const metadata = {
  title: 'Assignments',
}

export default async function AssignmentsPage() {
  const supabase = await createClient()
  const { data: assignments, error } = await supabase
    .from('assignments')
    .select('*, borrower:borrowers(first_name, last_name), vehicle:vehicles(year, make, model)')
    .order('created_at', { ascending: false })

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Assignments</h2>
        <div className="flex items-center space-x-2">
          <Link
            href="/dashboard/assignments/new"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            New Assignment
          </Link>
        </div>
      </div>
      
      <div className="rounded-md border">
        <div className="w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b bg-muted/20">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Borrower</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Vehicle</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {assignments?.map((item) => {
                const assignment = item as any
                const borrowerName = assignment.borrower 
                  ? `${assignment.borrower.first_name} ${assignment.borrower.last_name}` 
                  : 'N/A'
                const vehicleDesc = assignment.vehicle
                  ? `${assignment.vehicle.year} ${assignment.vehicle.make} ${assignment.vehicle.model}`
                  : 'N/A'
                return (
                <tr key={assignment.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <td className="p-4 align-middle font-medium">{assignment.id.substring(0, 8)}...</td>
                  <td className="p-4 align-middle">{borrowerName}</td>
                  <td className="p-4 align-middle">{vehicleDesc}</td>
                  <td className="p-4 align-middle">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                      assignment.status === 'completed' 
                        ? 'border-transparent bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : assignment.status === 'in_progress'
                        ? 'border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}>
                      {assignment.status ? assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1).replace('_', ' ') : 'Pending'}
                    </span>
                  </td>
                  <td className="p-4 align-middle">
                    <Link href={`/dashboard/assignments/${assignment.id}`} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                      View Details
                    </Link>
                  </td>
                </tr>
              )})}
              {(!assignments || assignments.length === 0) && (
                <tr>
                  <td colSpan={5} className="p-8 align-middle text-center text-muted-foreground">
                    {error ? 'Error loading assignments.' : 'No assignments found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
