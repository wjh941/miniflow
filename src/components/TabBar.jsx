import { NavLink } from 'react-router-dom'
import { IconHouse, IconPencil, IconGear, IconProfile } from './icons'

const tabs = [
  { to: '/', label: '笔记', icon: IconHouse },
  { to: '/editor', label: '写作', icon: IconPencil },
  { to: '/profile', label: '画像', icon: IconProfile },
  { to: '/settings', label: '设置', icon: IconGear },
]

export default function TabBar() {
  return (
    <nav className="tabbar">
      {tabs.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => (isActive ? 'on' : '')}>
          <span className="tab-icon"><Icon size={23} /></span>
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
