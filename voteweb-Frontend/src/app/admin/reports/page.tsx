"use client"

import { useState } from "react"
import { AdminLayout } from "@/components/admin-dashboard/AdminLayout"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import {
  BarChart3,
  Users,
  UserCheck,
  FileText,
  AlertCircle,
  Clock,
  Download,
  Calendar,
  Filter,
  ArrowLeft,
  Printer,
} from "lucide-react"

const reportTypes = [
  {
    id: "election-summary",
    icon: BarChart3,
    title: "Election Summary",
    description: "Overview of election statistics, participation rates, and results status.",
  },
  {
    id: "participation",
    icon: Users,
    title: "Participation Report",
    description: "Detailed breakdown of voter participation by department and category.",
  },
  {
    id: "candidate",
    icon: UserCheck,
    title: "Candidate Report",
    description: "Candidate profiles, application status, and final election results.",
  },
  {
    id: "position",
    icon: FileText,
    title: "Position Report",
    description: "Position-wise candidate counts, vote totals, and winners.",
  },
  {
    id: "support-issues",
    icon: AlertCircle,
    title: "Support Issues Report",
    description: "Summary of support tickets, resolution rates, and issue categories.",
  },
  {
    id: "activity",
    icon: Clock,
    title: "Activity Report",
    description: "Administrative activity log including approvals and announcements.",
  },
]

const departmentData = [
  { department: "Computer Science", eligible: 120, participated: 98, rate: 81.7 },
  { department: "Electrical Engineering", eligible: 85, participated: 62, rate: 72.9 },
  { department: "Mechanical Engineering", eligible: 95, participated: 71, rate: 74.7 },
  { department: "Civil Engineering", eligible: 70, participated: 48, rate: 68.6 },
  { department: "Business Administration", eligible: 110, participated: 89, rate: 80.9 },
  { department: "Arts & Humanities", eligible: 60, participated: 42, rate: 70.0 },
]

const candidateData = [
  { id: "C001", name: "Alex Johnson", position: "President", applicationStatus: "Approved", profileStatus: "Complete", finalResult: "Winner" },
  { id: "C002", name: "Maria Garcia", position: "President", applicationStatus: "Approved", profileStatus: "Complete", finalResult: "Runner-up" },
  { id: "C003", name: "James Wilson", position: "Vice President", applicationStatus: "Approved", profileStatus: "Complete", finalResult: "Winner" },
  { id: "C004", name: "Sarah Lee", position: "Vice President", applicationStatus: "Approved", profileStatus: "Complete", finalResult: "Third Place" },
  { id: "C005", name: "David Chen", position: "Secretary", applicationStatus: "Approved", profileStatus: "Complete", finalResult: "Winner" },
  { id: "C006", name: "Emily Brown", position: "Secretary", applicationStatus: "Approved", profileStatus: "Incomplete", finalResult: "N/A" },
  { id: "C007", name: "Michael Davis", position: "Treasurer", applicationStatus: "Pending", profileStatus: "Complete", finalResult: "N/A" },
  { id: "C008", name: "Jessica Martinez", position: "Treasurer", applicationStatus: "Approved", profileStatus: "Complete", finalResult: "Winner" },
]

const positionData = [
  { position: "President", candidates: 2, totalVotes: 412, winner: "Alex Johnson", winnerVotes: 234, participation: 85.8 },
  { position: "Vice President", candidates: 2, totalVotes: 398, winner: "James Wilson", winnerVotes: 215, participation: 82.9 },
  { position: "Secretary", candidates: 2, totalVotes: 405, winner: "David Chen", winnerVotes: 248, participation: 84.4 },
  { position: "Treasurer", candidates: 2, totalVotes: 389, winner: "Jessica Martinez", winnerVotes: 198, participation: 81.0 },
  { position: "Public Relations Officer", candidates: 1, totalVotes: 410, winner: "Nina Patel", winnerVotes: 410, participation: 85.4 },
]

const supportCategories = [
  { category: "Login Issues", total: 12, open: 2, inReview: 3, resolved: 7 },
  { category: "Voting Problems", total: 8, open: 1, inReview: 2, resolved: 5 },
  { category: "Profile Updates", total: 10, open: 1, inReview: 2, resolved: 7 },
  { category: "Technical Errors", total: 7, open: 1, inReview: 1, resolved: 5 },
  { category: "General Inquiries", total: 5, open: 0, inReview: 0, resolved: 5 },
]

const activityData = [
  { date: "2026-08-14", candidateApprovals: 3, announcements: 1, electionChanges: 0, issueResolutions: 5, resultPublications: 0 },
  { date: "2026-08-13", candidateApprovals: 2, announcements: 0, electionChanges: 1, issueResolutions: 4, resultPublications: 0 },
  { date: "2026-08-12", candidateApprovals: 1, announcements: 2, electionChanges: 0, issueResolutions: 6, resultPublications: 1 },
  { date: "2026-08-11", candidateApprovals: 4, announcements: 1, electionChanges: 2, issueResolutions: 3, resultPublications: 0 },
  { date: "2026-08-10", candidateApprovals: 2, announcements: 0, electionChanges: 0, issueResolutions: 4, resultPublications: 0 },
  { date: "2026-08-09", candidateApprovals: 1, announcements: 1, electionChanges: 1, issueResolutions: 2, resultPublications: 1 },
]

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case "Winner": return "success"
    case "Runner-up": return "info"
    case "Third Place": return "warning"
    case "Approved": return "success"
    case "Pending": return "warning"
    case "Complete": return "success"
    case "Incomplete": return "error"
    default: return "neutral"
  }
}

export default function AdminReportsPage() {
  const [activeReport, setActiveReport] = useState<string | null>(null)
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const handleExportCSV = (reportId: string) => {
    let csvContent = ""
    let filename = ""

    switch (reportId) {
      case "election-summary":
        csvContent = "Metric,Value\nElection Name,2026 Student Council Election\nPeriod,Aug 1-14, 2026\nEligible Students,540\nCandidates,8\nPositions,5\nBallots Submitted,412\nParticipation Rate,76.3%\nResults Status,Published\nPublication Status,Final"
        filename = "election-summary.csv"
        break
      case "participation":
        csvContent = "Department,Eligible,Participated,Rate\n" + departmentData.map(d => `${d.department},${d.eligible},${d.participated},${d.rate}%`).join("\n")
        filename = "participation-report.csv"
        break
      case "candidate":
        csvContent = "ID,Name,Position,Application Status,Profile Status,Final Result\n" + candidateData.map(c => `${c.id},${c.name},${c.position},${c.applicationStatus},${c.profileStatus},${c.finalResult}`).join("\n")
        filename = "candidate-report.csv"
        break
      case "position":
        csvContent = "Position,Candidates,Total Votes,Winner,Winner Votes,Participation\n" + positionData.map(p => `${p.position},${p.candidates},${p.totalVotes},${p.winner},${p.winnerVotes},${p.participation}%`).join("\n")
        filename = "position-report.csv"
        break
      case "support-issues":
        csvContent = "Category,Total,Open,In Review,Resolved\n" + supportCategories.map(s => `${s.category},${s.total},${s.open},${s.inReview},${s.resolved}`).join("\n")
        filename = "support-issues-report.csv"
        break
      case "activity":
        csvContent = "Date,Candidate Approvals,Announcements,Election Changes,Issue Resolutions,Result Publications\n" + activityData.map(a => `${a.date},${a.candidateApprovals},${a.announcements},${a.electionChanges},${a.issueResolutions},${a.resultPublications}`).join("\n")
        filename = "activity-report.csv"
        break
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleExportPDF = () => { window.print() }
  const handlePrintReport = () => { window.print() }
  const applyFilter = () => {}
  const resetFilter = () => { setDateFrom(""); setDateTo("") }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Election Reports</h1>
            <p className="text-gray-500 mt-1">Review election-level statistics and generate administrative reports.</p>
          </div>
        </div>

        {/* Report Type Cards Grid */}
        {!activeReport && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportTypes.map((report) => {
              const Icon = report.icon
              return (
                <Card key={report.id} hoverable className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-primary-100 rounded-xl">
                      <Icon className="h-6 w-6 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{report.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{report.description}</p>
                      <Button className="mt-4" onClick={() => setActiveReport(report.id)}>
                        View Report
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {/* Date Filter */}
        {!activeReport && (
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Filter className="h-5 w-5 text-gray-500" />
              <h3 className="font-semibold text-gray-900">Date Filter</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm" />
              </div>
              <div className="flex items-end space-x-2">
                <Button onClick={applyFilter} size="md">
                  <Calendar className="h-4 w-4 mr-1" />Apply Filter
                </Button>
                <Button variant="outline" onClick={resetFilter} size="md">Reset</Button>
              </div>
              <div className="flex flex-wrap items-end gap-2">
                {["Today", "Last 7 Days", "Last 30 Days", "Election Period"].map((preset) => (
                  <button key={preset}
                    className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Report Content Area */}
        {activeReport && (
          <div className="space-y-6">
            <Button variant="outline" onClick={() => setActiveReport(null)} size="md">
              <ArrowLeft className="h-4 w-4 mr-2" />Back to Reports
            </Button>

            {/* Election Summary Report */}
            {activeReport === "election-summary" && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Election Summary Report</h2>
                    <p className="text-gray-500">Overview of the 2026 Student Council Election</p>
                  </div>
                  <Badge variant="success">Final</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Election Name</p>
                    <p className="text-lg font-semibold text-gray-900">2026 Student Council Election</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Election Period</p>
                    <p className="text-lg font-semibold text-gray-900">Aug 1 - Aug 14, 2026</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Eligible Students</p>
                    <p className="text-lg font-semibold text-gray-900">540</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Total Candidates</p>
                    <p className="text-lg font-semibold text-gray-900">8</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Positions</p>
                    <p className="text-lg font-semibold text-gray-900">5</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Ballots Submitted</p>
                    <p className="text-lg font-semibold text-gray-900">412</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Participation Rate</p>
                    <p className="text-lg font-semibold text-primary-600">76.3%</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Results Status</p>
                    <Badge variant="success">Published</Badge>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-500">Publication Status</p>
                    <Badge variant="info">Final</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                  <Button variant="outline" size="sm" onClick={() => handleExportCSV("election-summary")}>
                    <Download className="h-4 w-4 mr-1" />Export CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportPDF}>
                    <FileText className="h-4 w-4 mr-1" />Export PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={handlePrintReport}>
                    <Printer className="h-4 w-4 mr-1" />Print Report
                  </Button>
                </div>
              </Card>
            )}

            {/* Participation Report */}
            {activeReport === "participation" && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Participation Report</h2>
                    <p className="text-gray-500">Voter participation breakdown by department</p>
                  </div>
                  <Badge variant="info">Active</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-500">Eligible Voters</p>
                    <p className="text-2xl font-bold text-gray-900">540</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-500">Ballots Submitted</p>
                    <p className="text-2xl font-bold text-primary-600">412</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-500">Non-participants</p>
                    <p className="text-2xl font-bold text-gray-600">128</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-500">Participation Rate</p>
                    <p className="text-2xl font-bold text-success-600">76.3%</p>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-3">Participation by Department</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Department</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-600">Eligible</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-600">Participated</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-600">Rate</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600 min-w-[160px]">Visualization</th>
                      </tr>
                    </thead>
                    <tbody>
                      {departmentData.map((dept) => (
                        <tr key={dept.department} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">{dept.department}</td>
                          <td className="py-3 px-4 text-center text-gray-600">{dept.eligible}</td>
                          <td className="py-3 px-4 text-center text-gray-600">{dept.participated}</td>
                          <td className="py-3 px-4 text-center">
                            <Badge variant={dept.rate >= 80 ? "success" : dept.rate >= 70 ? "warning" : "error"} size="sm">
                              {dept.rate}%
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div className="bg-primary-600 h-2.5 rounded-full transition-all duration-500"
                                style={{ width: `${dept.rate}%` }} />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                  <Button variant="outline" size="sm" onClick={() => handleExportCSV("participation")}>
                    <Download className="h-4 w-4 mr-1" />Export CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportPDF}>
                    <FileText className="h-4 w-4 mr-1" />Export PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={handlePrintReport}>
                    <Printer className="h-4 w-4 mr-1" />Print Report
                  </Button>
                </div>
              </Card>
            )}

            {/* Candidate Report */}
            {activeReport === "candidate" && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Candidate Report</h2>
                    <p className="text-gray-500">Complete candidate listing with application and result status</p>
                  </div>
                  <Badge variant="info">{candidateData.length} Candidates</Badge>
                </div>
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">ID</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Position</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-600">Application</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-600">Profile</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-600">Final Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {candidateData.map((candidate) => (
                        <tr key={candidate.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-mono text-gray-600">{candidate.id}</td>
                          <td className="py-3 px-4 font-medium text-gray-900">{candidate.name}</td>
                          <td className="py-3 px-4 text-gray-600">{candidate.position}</td>
                          <td className="py-3 px-4 text-center">
                            <Badge variant={getStatusBadgeVariant(candidate.applicationStatus)} size="sm">
                              {candidate.applicationStatus}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge variant={getStatusBadgeVariant(candidate.profileStatus)} size="sm">
                              {candidate.profileStatus}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge variant={getStatusBadgeVariant(candidate.finalResult)} size="sm">
                              {candidate.finalResult}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="md:hidden space-y-3">
                  {candidateData.map((candidate) => (
                    <div key={candidate.id} className="bg-gray-50 rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-gray-500">{candidate.id}</span>
                        <Badge variant={getStatusBadgeVariant(candidate.finalResult)} size="sm">
                          {candidate.finalResult}
                        </Badge>
                      </div>
                      <p className="font-semibold text-gray-900">{candidate.name}</p>
                      <p className="text-sm text-gray-500">{candidate.position}</p>
                      <div className="flex gap-2">
                        <Badge variant={getStatusBadgeVariant(candidate.applicationStatus)} size="sm">
                          App: {candidate.applicationStatus}
                        </Badge>
                        <Badge variant={getStatusBadgeVariant(candidate.profileStatus)} size="sm">
                          Profile: {candidate.profileStatus}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                  <Button variant="outline" size="sm" onClick={() => handleExportCSV("candidate")}>
                    <Download className="h-4 w-4 mr-1" />Export CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportPDF}>
                    <FileText className="h-4 w-4 mr-1" />Export PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={handlePrintReport}>
                    <Printer className="h-4 w-4 mr-1" />Print Report
                  </Button>
                </div>
              </Card>
            )}

            {/* Position Report */}
            {activeReport === "position" && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Position Report</h2>
                    <p className="text-gray-500">Position-wise vote totals and winner details</p>
                  </div>
                  <Badge variant="info">{positionData.length} Positions</Badge>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Position</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-600">Candidates</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-600">Total Votes</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Winner</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-600">Winner Votes</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-600">Participation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {positionData.map((pos) => (
                        <tr key={pos.position} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">{pos.position}</td>
                          <td className="py-3 px-4 text-center text-gray-600">{pos.candidates}</td>
                          <td className="py-3 px-4 text-center text-gray-600">{pos.totalVotes}</td>
                          <td className="py-3 px-4">
                            <Badge variant="success" size="sm">{pos.winner}</Badge>
                          </td>
                          <td className="py-3 px-4 text-center font-semibold text-gray-900">{pos.winnerVotes}</td>
                          <td className="py-3 px-4 text-center">
                            <Badge variant={pos.participation >= 80 ? "success" : "warning"} size="sm">
                              {pos.participation}%
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                  <Button variant="outline" size="sm" onClick={() => handleExportCSV("position")}>
                    <Download className="h-4 w-4 mr-1" />Export CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportPDF}>
                    <FileText className="h-4 w-4 mr-1" />Export PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={handlePrintReport}>
                    <Printer className="h-4 w-4 mr-1" />Print Report
                  </Button>
                </div>
              </Card>
            )}

            {/* Support Issues Report */}
            {activeReport === "support-issues" && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Support Issues Report</h2>
                    <p className="text-gray-500">Summary of support tickets and resolution metrics</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-500">Total Issues</p>
                    <p className="text-2xl font-bold text-gray-900">42</p>
                  </div>
                  <div className="bg-error-50 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-500">Open</p>
                    <p className="text-2xl font-bold text-error-600">5</p>
                  </div>
                  <div className="bg-warning-50 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-500">In Review</p>
                    <p className="text-2xl font-bold text-warning-600">8</p>
                  </div>
                  <div className="bg-success-50 rounded-xl p-4 text-center">
                    <p className="text-sm text-gray-500">Resolved</p>
                    <p className="text-2xl font-bold text-success-600">29</p>
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900 mb-4">Issues by Category</h3>
                <div className="space-y-4">
                  {supportCategories.map((cat) => (
                    <div key={cat.category} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{cat.category}</h4>
                        <span className="text-sm text-gray-500">{cat.total} total</span>
                      </div>
                      <div className="flex gap-4 text-xs text-gray-600 mb-2">
                        <span>Open: <span className="font-semibold text-error-600">{cat.open}</span></span>
                        <span>In Review: <span className="font-semibold text-warning-600">{cat.inReview}</span></span>
                        <span>Resolved: <span className="font-semibold text-success-600">{cat.resolved}</span></span>
                      </div>
                      <div className="w-full h-3 bg-gray-200 rounded-full flex overflow-hidden">
                        <div className="bg-success-500 h-full transition-all duration-500"
                          style={{ width: `${(cat.resolved / cat.total) * 100}%` }} />
                        <div className="bg-warning-500 h-full transition-all duration-500"
                          style={{ width: `${(cat.inReview / cat.total) * 100}%` }} />
                        <div className="bg-error-500 h-full transition-all duration-500"
                          style={{ width: `${(cat.open / cat.total) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                  <Button variant="outline" size="sm" onClick={() => handleExportCSV("support-issues")}>
                    <Download className="h-4 w-4 mr-1" />Export CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportPDF}>
                    <FileText className="h-4 w-4 mr-1" />Export PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={handlePrintReport}>
                    <Printer className="h-4 w-4 mr-1" />Print Report
                  </Button>
                </div>
              </Card>
            )}

            {/* Activity Report */}
            {activeReport === "activity" && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Activity Report</h2>
                    <p className="text-gray-500">Administrative activity log for the election period</p>
                  </div>
                  <Badge variant="info">{activityData.length} Days</Badge>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-600">Approvals</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-600">Announcements</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-600">Election Changes</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-600">Resolutions</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-600">Publications</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activityData.map((entry) => (
                        <tr key={entry.date} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-400" />{entry.date}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center text-gray-600">{entry.candidateApprovals}</td>
                          <td className="py-3 px-4 text-center text-gray-600">{entry.announcements}</td>
                          <td className="py-3 px-4 text-center text-gray-600">{entry.electionChanges}</td>
                          <td className="py-3 px-4 text-center text-gray-600">{entry.issueResolutions}</td>
                          <td className="py-3 px-4 text-center text-gray-600">{entry.resultPublications}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                  <Button variant="outline" size="sm" onClick={() => handleExportCSV("activity")}>
                    <Download className="h-4 w-4 mr-1" />Export CSV
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExportPDF}>
                    <FileText className="h-4 w-4 mr-1" />Export PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={handlePrintReport}>
                    <Printer className="h-4 w-4 mr-1" />Print Report
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Empty State */}
        {!activeReport && (
          <Card className="p-12 text-center">
            <div className="flex flex-col items-center">
              <div className="p-4 bg-gray-100 rounded-full mb-4">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Report Data</h3>
              <p className="text-gray-500 max-w-md">
                Select a report type from the cards above to view detailed election statistics and generate reports.
              </p>
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}
