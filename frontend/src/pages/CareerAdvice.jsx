import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

const money = (n) => '$' + Math.round(n).toLocaleString()

export default function CareerAdvice() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [needsProfile, setNeedsProfile] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    setNeedsProfile(false)
    try {
      setResult(await api.recommendations())
    } catch (err) {
      setResult(null)
      setError(err.message)
      setNeedsProfile(!!err.needsProfile)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="narrow">
      <h1>AI Career Recommendations</h1>
      <p className="muted">Personalized career suggestions based on your profile and real job-posting data.</p>

      {!result && (
        <div className="card center mt">
          <div className="icon">✨</div>
          <h3>Ready to discover your ideal career?</h3>
          <p className="muted">We compare your skills with the most requested skills for each role.</p>
          <button className="btn btn-primary" onClick={load} disabled={loading}>{loading ? 'Analyzing...' : 'Get recommendations'}</button>
        </div>
      )}

      {error && (
        <div className="error mt">
          {error} {needsProfile && <Link to="/profile">Go to Profile</Link>}
        </div>
      )}

      {result && (
        <>
          <div className="card note mt">{result.summary}</div>
          {result.recommendations.map((r) => (
            <div className="card mt" key={r.role}>
              <div className="between">
                <h3>{r.role}</h3>
                <div className="match">
                  <span className="small muted">Match</span>
                  <div className="bar match-bar"><div className="bar-fill" style={{ width: `${r.match}%` }} /></div>
                  <strong>{r.match}%</strong>
                </div>
              </div>
              <p>{r.why}</p>
              <div className="grid-2">
                <div className="box">
                  <strong className="small">⚠️ Skill gaps</strong>
                  {r.skillGaps.length ? (
                    <ul>{r.skillGaps.map((s) => <li key={s}>{s}</li>)}</ul>
                  ) : <p className="small muted">None among the top skills 🎉</p>}
                </div>
                <div className="box">
                  <strong className="small">💰 Salary range (US postings)</strong>
                  <p>{r.salary ? `${money(r.salary.low)} – ${money(r.salary.high)}` : 'Not enough salary data'}</p>
                  <p className="small muted">Based on {r.jobCount.toLocaleString()} job postings</p>
                </div>
              </div>
              <Link className="btn btn-outline mt-s" to={`/roadmap?role=${encodeURIComponent(r.role)}`}>View roadmap →</Link>
            </div>
          ))}
          <button className="btn btn-outline mt" onClick={load} disabled={loading}>{loading ? 'Analyzing...' : 'Refresh recommendations'}</button>
        </>
      )}
    </div>
  )
}
