import { useState } from 'react'
import { api } from '../api'

const TABS = ['Score', 'Improve', 'Keywords', 'Optimized']

export default function Resume() {
  const [file, setFile] = useState(null)
  const [role, setRole] = useState('')
  const [result, setResult] = useState(null)
  const [resumeText, setResumeText] = useState('')
  const [tab, setTab] = useState('Score')
  const [optimized, setOptimized] = useState('')
  const [loading, setLoading] = useState(false)
  const [optimizing, setOptimizing] = useState(false)
  const [error, setError] = useState('')

  const analyze = async () => {
    if (!file) return setError('Choose a PDF or DOCX resume first.')
    setLoading(true)
    setError('')
    setOptimized('')
    try {
      const d = await api.analyzeResume(file, role)
      setResult(d.analysis)
      setResumeText(d.resumeText)
      setTab('Score')
    } catch (err) {
      setResult(null)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const optimize = async () => {
    setOptimizing(true)
    setError('')
    try {
      const d = await api.optimizeResume(resumeText, result.role, result.keywords.missing)
      setOptimized(d.optimized)
    } catch (err) {
      setError(err.message)
    } finally {
      setOptimizing(false)
    }
  }

  const download = () => {
    const blob = new Blob([optimized], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'optimized-resume.txt'
    a.click()
  }

  const color = (s) => (s >= 80 ? '#4f9d69' : s >= 65 ? '#7c6cf0' : s >= 45 ? '#d4953b' : '#d2594c')

  return (
    <div>
      <h1>Resume ATS Analyzer</h1>
      <p className="muted">Upload your resume to get an ATS compatibility score and AI-powered optimization.</p>

      <div className="resume-layout mt">
        <div className="card">
          <h3>⬆️ Upload resume</h3>
          <p className="small muted">Supported formats: PDF, DOCX (max 10 MB)</p>
          <input type="file" accept=".pdf,.docx" onChange={(e) => setFile(e.target.files[0] || null)} />
          <label>Target role (optional)</label>
          <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Data Scientist" />
          <button className="btn btn-primary btn-block mt" onClick={analyze} disabled={loading}>{loading ? 'Analyzing...' : 'Analyze resume'}</button>
          {error && <div className="error mt">{error}</div>}

          {result && (
            <div className="score-box mt" style={{ borderColor: color(result.score) }}>
              <div className="score-num" style={{ color: color(result.score) }}>{result.score}</div>
              <strong>{result.grade}</strong>
              <span className="small muted">ATS score for {result.role}</span>
            </div>
          )}
        </div>

        <div className="card">
          {!result && <p className="muted">Your results will appear here after you analyze a resume.</p>}
          {result && (
            <>
              {result.inferred && (
                <div className="note small mb">
                  {result.requestedRole
                    ? `No job-posting data for "${result.requestedRole}", so your resume was compared with the closest role: ${result.role}.`
                    : `No target role given, so your resume was compared with the best-matching role: ${result.role}.`}
                </div>
              )}
              <div className="tabs">
                {TABS.map((t) => <button key={t} className={tab === t ? 'tab on' : 'tab'} onClick={() => setTab(t)}>{t}</button>)}
              </div>

              {tab === 'Score' && (
                <div className="mt">
                  <h3>Score breakdown</h3>
                  {result.breakdown.map((b) => (
                    <div key={b.name} className="mb">
                      <div className="between"><strong className="small">{b.name}</strong><span className="small">{b.score}/{b.max}</span></div>
                      <div className="bar"><div className="bar-fill" style={{ width: `${(b.score / b.max) * 100}%` }} /></div>
                      <span className="small muted">{b.note}</span>
                    </div>
                  ))}
                  <div className="grid-2 mt">
                    <div className="box"><strong className="small">✅ Strengths</strong><ul>{result.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
                    <div className="box"><strong className="small">⚠️ Areas to improve</strong><ul>{result.improvements.length ? result.improvements.slice(0, 4).map((s, i) => <li key={i}>{s}</li>) : <li>Nothing major 🎉</li>}</ul></div>
                  </div>
                </div>
              )}

              {tab === 'Improve' && (
                <div className="mt">
                  <h3>Suggestions</h3>
                  <ul>{result.improvements.length ? result.improvements.map((s, i) => <li key={i}>{s}</li>) : <li>Your resume looks well optimized.</li>}</ul>
                </div>
              )}

              {tab === 'Keywords' && (
                <div className="mt">
                  <h3>Missing keywords</h3>
                  <div className="chips">{result.keywords.missing.length ? result.keywords.missing.map((k) => <span className="chip chip-bad" key={k}>{k}</span>) : <span className="muted small">None 🎉</span>}</div>
                  <h3 className="mt">Keywords found</h3>
                  <div className="chips">{result.keywords.matched.length ? result.keywords.matched.map((k) => <span className="chip chip-ok" key={k}>{k}</span>) : <span className="muted small">None detected</span>}</div>
                  <h3 className="mt">Suggested skills to learn</h3>
                  <div className="chips">{result.suggestedSkills.map((k) => <span className="chip" key={k}>{k}</span>)}</div>
                  <p className="small muted mt">Compared with the top skills from {result.basedOnJobs ? result.basedOnJobs.toLocaleString() : 'a general'} job postings.</p>
                </div>
              )}

              {tab === 'Optimized' && (
                <div className="mt">
                  <h3>AI-optimized resume</h3>
                  {!optimized && (
                    <>
                      <p className="muted small">AI rewrites your resume for {result.role} using only your own content. Missing details appear as [ADD: ...] placeholders for you to fill in.</p>
                      <button className="btn btn-primary" onClick={optimize} disabled={optimizing}>{optimizing ? 'Optimizing...' : 'Generate optimized resume'}</button>
                    </>
                  )}
                  {optimized && (
                    <>
                      <textarea className="optimized" value={optimized} onChange={(e) => setOptimized(e.target.value)} rows={18} />
                      <div className="row mt-s">
                        <button className="btn btn-outline" onClick={() => navigator.clipboard.writeText(optimized)}>Copy</button>
                        <button className="btn btn-outline" onClick={download}>Download .txt</button>
                      </div>
                      <p className="small muted mt-s">Review carefully and replace every [ADD: ...] with real information before using it.</p>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
