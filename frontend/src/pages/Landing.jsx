import { Link } from 'react-router-dom'
import { useAuth } from '../AuthContext'

const FEATURES = [
  ['🎯', 'AI Career Match', 'Get role suggestions matched to your skills using real job-posting data.'],
  ['🛣️', 'Career Roadmap', 'Start from your dream job and work backward to a step-by-step learning path.'],
  ['📄', 'Resume Analyzer', 'Get an ATS score, missing keywords and an AI-optimized resume.'],
]

export default function Landing() {
  const { user } = useAuth()
  return (
    <div>
      <header className="navbar">
        <div className="nav-inner">
          <span className="logo">success route<span className="dot">.</span></span>
          <div className="nav-user">
            {user ? (
              <Link className="btn btn-primary" to="/dashboard">Go to Dashboard</Link>
            ) : (
              <>
                <Link className="btn btn-outline" to="/signin">Sign In</Link>
                <Link className="btn btn-primary" to="/signup">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="hero">
        <h1>Navigate your career with <span className="accent">AI guidance</span></h1>
        <p>
          Success Route uses a <strong>Reverse Methodology</strong>: pick the job you want, and we work backward
          to show the skills, certifications and steps needed to get there.
        </p>
        <Link className="btn btn-primary btn-lg" to={user ? '/dashboard' : '/signup'}>Start your journey →</Link>
      </section>

      <section className="features">
        <h2>Everything you need for career success</h2>
        <div className="grid-3">
          {FEATURES.map(([icon, title, text]) => (
            <div className="card center" key={title}>
              <div className="icon">{icon}</div>
              <h3>{title}</h3>
              <p className="muted">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
