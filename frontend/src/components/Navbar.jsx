import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../AuthContext'

const LINKS = [
  ['/dashboard', 'Dashboard'],
  ['/advice', 'Career Advice'],
  ['/roadmap', 'Roadmap'],
  ['/resume', 'Resume'],
  ['/profile', 'Profile'],
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const initials = (user?.name || 'U').split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()

  return (
    <nav className="navbar">
      <div className="nav-inner">
        <NavLink to="/dashboard" className="logo">success route<span className="dot">.</span></NavLink>
        <div className="nav-links">
          {LINKS.map(([to, label]) => (
            <NavLink key={to} to={to} className={({ isActive }) => (isActive ? 'active' : '')}>{label}</NavLink>
          ))}
        </div>
        <div className="nav-user">
          <span className="avatar" title={user?.email}>{initials}</span>
          <button className="btn btn-outline" onClick={() => { logout(); navigate('/') }}>Logout</button>
        </div>
      </div>
    </nav>
  )
}
