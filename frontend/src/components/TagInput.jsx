import { useState } from 'react'

// Type a value, press Enter (or Add) and it becomes a removable chip
export default function TagInput({ tags, onChange, placeholder }) {
  const [text, setText] = useState('')

  const add = () => {
    const value = text.trim()
    if (value && !tags.some((t) => t.toLowerCase() === value.toLowerCase())) {
      onChange([...tags, value])
    }
    setText('')
  }

  return (
    <div>
      <div className="row">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder={placeholder}
        />
        <button type="button" className="btn btn-outline" onClick={add}>Add</button>
      </div>
      <div className="chips mt">
        {tags.length === 0 && <span className="muted small">Nothing added yet</span>}
        {tags.map((t) => (
          <span className="chip" key={t}>
            {t}
            <button type="button" className="chip-x" onClick={() => onChange(tags.filter((x) => x !== t))}>×</button>
          </span>
        ))}
      </div>
    </div>
  )
}
