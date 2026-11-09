import { useEffect, useState } from 'react'
import { api } from '../api'
import TagInput from '../components/TagInput'

const EDUCATION = ['High School', 'Diploma', "Bachelor's Degree", "Master's Degree", 'PhD', 'Other']
const FIELDS = ['Technology', 'Management', 'Creative', 'Marketing', 'Finance', 'Healthcare', 'Education', 'Sales', 'Operations', 'Research', 'Consulting', 'Other']

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.getProfile().then((d) => setProfile(d.profile)).catch((e) => setMessage(e.message))
  }, [])

  if (!profile) return <p className="muted">{message || 'Loading...'}</p>

  const update = (field, value) => { setProfile({ ...profile, [field]: value }); setMessage('') }
  const toggleField = (f) =>
    update('preferences', profile.preferences.includes(f) ? profile.preferences.filter((x) => x !== f) : [...profile.preferences, f])

  const save = async () => {
    setSaving(true)
    try {
      await api.saveProfile(profile)
      setMessage('✅ Profile saved')
    } catch (err) {
      setMessage(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="narrow">
      <h1>Your Profile</h1>
      <p className="muted">Keep your information up to date for better career recommendations.</p>

      <div className="card mt">
        <h3>Basic information</h3>
        <div className="grid-2">
          <div>
            <label>Full name</label>
            <input value={profile.fullName} onChange={(e) => update('fullName', e.target.value)} />
          </div>
          <div>
            <label>Education level</label>
            <select value={profile.education} onChange={(e) => update('education', e.target.value)}>
              <option value="">Select...</option>
              {EDUCATION.map((e) => <option key={e}>{e}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="card mt">
        <h3>Skills</h3>
        <p className="muted small">Add technical skills, for example Python, SQL, React, Excel, Docker.</p>
        <TagInput tags={profile.skills} onChange={(v) => update('skills', v)} placeholder="e.g. Python" />
      </div>

      <div className="card mt">
        <h3>Interests</h3>
        <p className="muted small">What areas interest you professionally?</p>
        <TagInput tags={profile.interests} onChange={(v) => update('interests', v)} placeholder="e.g. Machine Learning" />
      </div>

      <div className="card mt">
        <h3>Career preferences</h3>
        <p className="muted small">Select the career fields you are interested in.</p>
        <div className="chips">
          {FIELDS.map((f) => (
            <button type="button" key={f} className={'chip chip-btn' + (profile.preferences.includes(f) ? ' chip-on' : '')} onClick={() => toggleField(f)}>{f}</button>
          ))}
        </div>
      </div>

      <div className="between mt">
        <span>{message}</span>
        <button className="btn btn-primary" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save profile'}</button>
      </div>
    </div>
  )
}
