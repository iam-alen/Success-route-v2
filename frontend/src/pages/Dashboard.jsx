import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useAuth } from '../AuthContext'

const QUICK = [
  ['/advice', '🎯', 'Career Advice', 'Roles that match your skills'],
  ['/roadmap', '🛣️', 'Roadmap', 'Plan the path to your dream job'],
  ['/resume', '📄', 'Resume Analyzer', 'ATS score and optimization'],
  ['/profile', '👤', 'Profile', 'Keep your details up to date'],
]

export default function Dashboard() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [progress, setProgress] = useState([])

  useEffect(() => {
    api.getProfile().then((d) => setProfile(d.profile)).catch(() => {})
    api.getProgress().then((d) => setProgress(d.progress)).catch(() => {})
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  // Profile completion: 5 checks, 20% each
  const checks = profile
    ? [!!profile.fullName, !!profile.education, profile.skills.length > 0, profile.interests.length > 0, profile.preferences.length > 0]
    : []
  const completion = checks.length ? checks.filter(Boolean).length * 20 : 0

  return (
    <div>
      <h1>{greeting}, {user?.name}</h1>
      <p className="muted">Here is where your career journey stands.</p>

      <div className="card mt">
        <div className="between">
          <strong>Profile completion</strong>
          <span>{completion}%</span>
        </div>
        <div className="bar mt-s"><div className="bar-fill" style={{ width: `${completion}%` }} /></div>
        {completion < 100 && <p className="small muted mt-s">Complete your <Link to="/profile">profile</Link> to get better career recommendations.</p>}
      </div>

      <div className="grid-4 mt">
        {QUICK.map(([to, icon, title, text]) => (
          <Link to={to} className="card quick" key={to}>
            <div className="icon">{icon}</div>
            <strong>{title}</strong>
            <span className="muted small">{text}</span>
          </Link>
        ))}
      </div>

      <div className="grid-2 mt">
        <div className="card">
          <h3>Profile summary</h3>
          {profile ? (
            <>
              <p className="small"><strong>Education:</strong> {profile.education || 'Not set'}</p>
              <p className="small"><strong>Skills:</strong></p>
              <div className="chips">
                {profile.skills.length ? profile.skills.map((s) => <span className="chip" key={s}>{s}</span>) : <span className="muted small">None yet</span>}
              </div>
              <p className="small mt-s"><strong>Interests:</strong></p>
              <div className="chips">
                {profile.interests.length ? profile.interests.map((s) => <span className="chip" key={s}>{s}</span>) : <span className="muted small">None yet</span>}
              </div>
            </>
          ) : <p className="muted">Loading...</p>}
        </div>

        <div className="card">
          <h3>Roadmap progress</h3>
          {progress.length === 0 && <p className="muted small">No progress yet. <Link to="/roadmap">Generate a roadmap</Link> and tick off steps as you complete them.</p>}
          {progress.map((p) => {
            const pct = p.total ? Math.round((p.done / p.total) * 100) : 0
            return (
              <div key={p.key} className="mt-s">
                <div className="between small"><Link to={`/roadmap?role=${encodeURIComponent(p.role)}`}>{p.role}</Link><span>{p.done}/{p.total} steps</span></div>
                <div className="bar mt-xs"><div className="bar-fill" style={{ width: `${pct}%` }} /></div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
