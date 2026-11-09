import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { api } from '../api'

const money = (n) => '$' + Math.round(n).toLocaleString()

export default function Roadmap() {
  const [params] = useSearchParams()
  const [role, setRole] = useState(params.get('role') || '')
  const [data, setData] = useState(null)
  const [completed, setCompleted] = useState([])
  const [open, setOpen] = useState([0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const generate = async (name, refresh = false) => {
    if (!name.trim()) return setError('Enter a job role first.')
    setLoading(true)
    setError('')
    try {
      const d = await api.roadmap(name, refresh)
      setData(d)
      setCompleted(d.completed || [])
      setOpen([0])
    } catch (err) {
      setData(null)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // If we arrived from Career Advice (?role=...), generate straight away
  useEffect(() => {
    const r = params.get('role')
    if (r) generate(r)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleOpen = (i) => setOpen(open.includes(i) ? open.filter((x) => x !== i) : [...open, i])

  const toggleDone = (i) => {
    const id = String(i)
    const next = completed.includes(id) ? completed.filter((x) => x !== id) : [...completed, id]
    setCompleted(next)
    api.saveProgress(data.key, next).catch(() => {})
  }

  const steps = data?.steps || []
  const pct = steps.length ? Math.round((completed.length / steps.length) * 100) : 0

  return (
    <div className="narrow">
      <h1>Career Roadmap Generator</h1>
      <p className="muted">Enter the job you want. We work backward to show how to get there.</p>

      <div className="row mt">
        <input
          value={role}
          onChange={(e) => setRole(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && generate(role)}
          placeholder="e.g. Data Scientist, DevOps Engineer, Project Manager"
        />
        <button className="btn btn-primary" onClick={() => generate(role)} disabled={loading}>{loading ? 'Generating...' : 'Generate'}</button>
      </div>
      {error && <div className="error mt">{error}</div>}

      {data && (
        <div className="mt">
          <div className="card">
            <h2>{data.role}</h2>
            {data.summary && <p>{data.summary}</p>}
            {data.fromDataset
              ? <p className="small ok-text">✅ Skills and salaries based on {data.jobCount.toLocaleString()} real job postings</p>
              : <p className="small muted">No job-posting data for this role. Showing AI-generated guidance only.</p>}
          </div>

          {data.salary && (
            <div className="grid-3 mt">
              {[['Entry level', data.salary.entry], ['Mid level', data.salary.mid], ['Senior level', data.salary.senior]].map(([label, value]) => (
                <div className="card center" key={label}>
                  <span className="small muted">{label}</span>
                  <h2>{money(value)}</h2>
                  <span className="small muted">per year (USD)</span>
                </div>
              ))}
            </div>
          )}
          {data.salary && <p className="small muted">Estimated from the 25th, 50th and 75th percentile of {data.salary.count} US postings with salary. {data.salaryNote}</p>}

          <div className="card mt">
            <h3>🧠 Skill gap analysis</h3>
            {data.skillGap ? (
              <div className="grid-2">
                <div>
                  <strong className="small">You already have</strong>
                  <div className="chips mt-xs">{data.skillGap.have.length ? data.skillGap.have.map((s) => <span className="chip chip-ok" key={s}>{s}</span>) : <span className="muted small">None of the top skills yet</span>}</div>
                </div>
                <div>
                  <strong className="small">Skills to learn</strong>
                  <div className="chips mt-xs">{data.skillGap.missing.length ? data.skillGap.missing.map((s) => <span className="chip chip-bad" key={s}>{s}</span>) : <span className="muted small">Nothing missing 🎉</span>}</div>
                </div>
              </div>
            ) : (
              <>
                <p className="muted small">Most requested skills{data.topSkills.length ? '' : ' (AI suggestion)'}:</p>
                <div className="chips">
                  {data.topSkills.length
                    ? data.topSkills.map((s) => <span className="chip" key={s.skill}>{s.skill} <small>({s.count})</small></span>)
                    : (data.skills || []).map((s) => <span className="chip" key={s}>{s}</span>)}
                </div>
                <p className="small muted mt-s">Add your skills in your <Link to="/profile">profile</Link> to see your personal skill gap.</p>
              </>
            )}
          </div>

          {steps.length > 0 && (
            <div className="card mt">
              <div className="between">
                <h3>🛣️ Step-by-step path</h3>
                <span className="small">{completed.length}/{steps.length} done</span>
              </div>
              <div className="bar mb"><div className="bar-fill" style={{ width: `${pct}%` }} /></div>
              {steps.map((s, i) => (
                <div className={'step' + (completed.includes(String(i)) ? ' step-done' : '')} key={i}>
                  <div className="between">
                    <label className="check">
                      <input type="checkbox" checked={completed.includes(String(i))} onChange={() => toggleDone(i)} />
                      <strong>Step {i + 1}: {s.title}</strong>
                    </label>
                    <button className="link-btn" onClick={() => toggleOpen(i)}>{s.duration} {open.includes(i) ? '▲' : '▼'}</button>
                  </div>
                  {open.includes(i) && <ul>{(s.details || []).map((d, j) => <li key={j}>{d}</li>)}</ul>}
                </div>
              ))}
            </div>
          )}

          <div className="grid-2 mt">
            {data.education && (
              <div className="card"><h3>🎓 Education</h3><ul>{data.education.map((e, i) => <li key={i}>{e}</li>)}</ul></div>
            )}
            {data.certifications && (
              <div className="card"><h3>📜 Certifications</h3><ul>{data.certifications.map((c, i) => <li key={i}>{c}</li>)}</ul></div>
            )}
          </div>

          {data.projects && (
            <div className="card mt"><h3>🛠️ Project ideas</h3><ul>{data.projects.map((p, i) => <li key={i}>{p}</li>)}</ul></div>
          )}

          {!data.aiAvailable && <p className="small muted mt">AI details are unavailable right now (check the backend terminal). Dataset results are shown above.</p>}
          {data.aiAvailable && <button className="btn btn-outline mt" onClick={() => generate(data.role, true)} disabled={loading}>Regenerate AI steps</button>}
        </div>
      )}
    </div>
  )
}
