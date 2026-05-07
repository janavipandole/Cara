import { useNavigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase/config'
import logo from '../assets/dashboard-images/logo.png'
import icon from '../assets/dashboard-images/icon.png'

function Projects() {
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      navigate('/login')
    } catch (err) {
      console.error('Sign out error:', err.message)
    }
  }

  const projects = [
    { name: 'Contact Page', status: 'Completed', date: 'May 2026' },
    { name: 'Services Page', status: 'Completed', date: 'May 2026' },
    { name: 'Case Study Page', status: 'Completed', date: 'May 2026' },
    { name: 'Home Page', status: 'Completed', date: 'May 2026' },
  ]

  return (
    <div className="flex h-screen overflow-hidden bg-[#eef2f7]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <aside className="w-[210px] min-w-[210px] bg-[#f0f4fa] flex flex-col py-5 px-3.5 border-r border-[#dde4ef] gap-1.5">
        <div className="flex items-center gap-2.5 px-1.5 pb-4">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center overflow-hidden">
            <img src={logo} className="w-[18px] h-[18px]" alt="" />
          </div>
          <div className="leading-tight">
            <div className="text-[13.5px] font-bold text-[#1a1d23]" style={{ letterSpacing: '-0.2px' }}>PrecisionOS</div>
            <div className="text-[10px] text-[#7a869a] font-normal">Digital Curator Mode</div>
          </div>
        </div>

        <button className="bg-[#2563eb] text-white rounded-[10px] py-2.5 text-[13px] font-semibold cursor-pointer hover:bg-[#1d4ed8] flex items-center justify-center gap-1.5 mb-2.5 w-full" style={{ letterSpacing: '-0.1px' }}>
          <svg width="14" height="14" fill="none" viewBox="0 0 14 14">
            <path d="M7 1v12M1 7h12" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          New Project
        </button>

        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2.5 py-2 px-3 rounded-lg text-[13.5px] font-medium text-[#4b5563] cursor-pointer no-underline hover:bg-[#e2e8f3] hover:text-[#1a1d23] w-full bg-transparent border-none text-left">
          <svg width="17" height="17" fill="none" viewBox="0 0 17 17">
            <rect x="1" y="1" width="6" height="6" rx="1.5" fill="#2563eb"/>
            <rect x="10" y="1" width="6" height="6" rx="1.5" fill="#2563eb"/>
            <rect x="1" y="10" width="6" height="6" rx="1.5" fill="#2563eb"/>
            <rect x="10" y="10" width="6" height="6" rx="1.5" fill="#2563eb"/>
          </svg>
          Dashboard
        </button>

        <button className="flex items-center gap-2.5 py-2 px-3 rounded-lg text-[13.5px] font-medium text-[#4b5563] cursor-pointer no-underline hover:bg-[#e2e8f3] hover:text-[#1a1d23] w-full bg-transparent border-none text-left bg-white font-semibold shadow-[0_1px_4px_rgba(0,0,0,0.07)]">
          <svg width="17" height="17" fill="none" viewBox="0 0 17 17" stroke="#6b7280" strokeWidth="1.5">
            <rect x="1.5" y="1.5" width="14" height="14" rx="2.5"/>
            <path d="M1.5 6h14M5.5 1.5v4.5" strokeLinecap="round"/>
          </svg>
          Projects
        </button>

        <div className="flex-1"></div>
        <hr className="border-t border-dashed border-[#c9d3e0] my-2"/>

        <button onClick={handleSignOut} className="flex items-center gap-2.5 py-2 px-3 rounded-lg text-[13.5px] font-medium text-[#4b5563] cursor-pointer no-underline hover:bg-[#e2e8f3] hover:text-[#1a1d23] w-full bg-transparent border-none text-left">
          <svg width="17" height="17" fill="none" viewBox="0 0 17 17" stroke="#6b7280" strokeWidth="1.5">
            <path d="M6 2H3a1.5 1.5 0 0 0-1.5 1.5v10A1.5 1.5 0 0 0 3 15h3M11 12l4-3.5-4-3.5M15 8.5H6.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Sign Out
        </button>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-8 pt-[22px]">
          <div>
            <div className="text-[11px] font-semibold text-[#8595ab]" style={{ letterSpacing: '.8px' }}>Workspace</div>
            <div className="text-[34px] font-extrabold text-[#0f1117]" style={{ letterSpacing: '-1px' }}>Projects</div>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="w-[38px] h-[38px] rounded-full bg-white border border-[#dde4ef] flex items-center justify-center cursor-pointer">
              <svg width="16" height="16" fill="none" viewBox="0 0 16 16" stroke="#6b7280" strokeWidth="1.7">
                <circle cx="7" cy="7" r="5.5"/>
                <path d="M11 11l3 3" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="w-[38px] h-[38px]  bg-[#c7d2e2] flex items-center justify-center overflow-hidden border-2 border-white shadow-[0_0_0_1.5px_#dde4ef]">
              <img src={icon} className="w-full h-full object-cover" alt="" />
            </div>
          </div>
        </div>

        <div className="flex-1 px-8 pt-5 pb-6 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          <div className="flex flex-col gap-3">
            {projects.map((p, i) => (
                  <div key={i} className="bg-white rounded-[14px] border border-[#e8edf5] px-6 py-6 flex items-center justify-between cursor-pointer hover:border-[#c5d0e2]">
                <div>
                  <div className="text-[15px] font-semibold text-[#1a1d23]">{p.name}</div>
                  <div className="text-[12px] text-[#94a3b8] mt-0.5">{p.date}</div>
                </div>
                <div className={`text-[12px] font-semibold px-3 py-1 rounded-full ${p.status === 'In Progress' ? 'bg-[#2563eb] text-white' : 'bg-[#e8edf5] text-[#4b5563]'}`}>
                  {p.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Projects
