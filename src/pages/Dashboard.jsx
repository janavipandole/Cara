import { useNavigate } from 'react-router-dom'
import icon from '../assets/dashboard-images/icon.png'
import light from '../assets/dashboard-images/light.png'
import logo from '../assets/dashboard-images/logo.png'
import phone from '../assets/dashboard-images/phone.png'


function Dashboard() {
  const navigate = useNavigate()
  return (
    <div className="flex h-screen overflow-hidden bg-[#eef2f7]" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* ── SIDEBAR ── */}
      <aside className="w-[210px] min-w-[210px] bg-[#f0f4fa] flex flex-col py-5 px-3.5 border-r border-[#dde4ef] gap-1.5">
        <div className="flex items-center gap-2.5 px-1.5 pb-4">
          <img src={logo} className="w-[18px] h-[18px]" alt="" />
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

        <a className="flex items-center gap-2.5 py-2 px-3 rounded-lg text-[13.5px] font-medium text-[#4b5563] cursor-pointer no-underline bg-white font-semibold shadow-[0_1px_4px_rgba(0,0,0,0.07)]">
          Dashboard
        </a>

        <button onClick={() => navigate('/projects')} className="flex items-center gap-2.5 py-2 px-3 rounded-lg text-[13.5px] font-medium text-[#4b5563] cursor-pointer no-underline hover:bg-[#e2e8f3] hover:text-[#1a1d23] w-full bg-transparent border-none text-left">
          
          Projects
        </button>

        <a className="flex items-center gap-2.5 py-2 px-3 rounded-lg text-[13.5px] font-medium text-[#4b5563] cursor-pointer no-underline hover:bg-[#e2e8f3] hover:text-[#1a1d23]">
          
          Metrics
        </a>

        <a className="flex items-center gap-2.5 py-2 px-3 rounded-lg text-[13.5px] font-medium text-[#4b5563] cursor-pointer no-underline hover:bg-[#e2e8f3] hover:text-[#1a1d23]">
          
          Clients
        </a>

        <div className="flex-1"></div>
        <hr className="border-t border-dashed border-[#c9d3e0] my-2"/>

        <a className="flex items-center gap-2.5 py-2 px-3 rounded-lg text-[13.5px] font-medium text-[#4b5563] cursor-pointer no-underline hover:bg-[#e2e8f3] hover:text-[#1a1d23]">
          
          Support
        </a>

        <a className="flex items-center gap-2.5 py-2 px-3 rounded-lg text-[13.5px] font-medium text-[#4b5563] cursor-pointer no-underline hover:bg-[#e2e8f3] hover:text-[#1a1d23]">
          
          Sign Out
        </a>
      </aside>

      {/* ── MAIN ── */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <div className="flex items-center justify-between px-8 pt-[22px]">
          <div>
            <div className="text-[11px] font-semibold text-[#8595ab]" style={{ letterSpacing: '.8px' }}>Overview</div>
            <div className="text-[34px] font-extrabold text-[#0f1117]" style={{ letterSpacing: '-1px' }}>Curated Insights</div>
          </div>
          <div className="flex items-center gap-3.5">
            <div className="w-[38px] h-[38px] rounded-full bg-white border border-[#dde4ef] flex items-center justify-center cursor-pointer">
              <svg width="16" height="16" fill="none" viewBox="0 0 16 16" stroke="#6b7280" strokeWidth="1.7">
                <circle cx="7" cy="7" r="5.5"/>
                <path d="M11 11l3 3" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="w-[38px] h-[38px]  overflow-hidden border-2 border-white shadow-[0_0_0_1.5px_#dde4ef]">
              <img src={icon} className="w-full h-full object-cover" alt="" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 grid grid-cols-[1fr_310px] gap-[18px] px-8 pt-5 pb-6 overflow-hidden">
          
          {/* LEFT COLUMN */}
          <div className="flex flex-col gap-4 overflow-y-auto pr-1" style={{ scrollbarWidth: 'none' }}>
            
            {/* IN PROGRESS CARD */}
            <div className="bg-white rounded-[18px] border border-[#e8edf5] px-6 pt-[30px] pb-[30px]">
              <div className="flex items-center gap-[7px] text-[10.5px] font-bold text-[#22c55e]" style={{ letterSpacing: '.7px' }}>
                <span className="w-[7px] h-[7px] rounded-full bg-[#22c55e]"></span>
                In Progress
              </div>
              <div className="text-[22px] font-extrabold text-[#0f1117]" style={{ letterSpacing: '-0.6px' }}>Lumière Atelier</div>
              <div className="text-[13px] text-[#6b7280] leading-relaxed">
                Brand identity refinement and high-fidelity prototype<br/>curation for luxury fashion house.
              </div>

              <div className="flex gap-3 mt-5">
                <div className="flex-1 h-[105px] rounded-[11px] overflow-hidden relative">
                  <img src={light} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="flex-1 h-[105px] rounded-[11px] overflow-hidden relative">
                  <img src={phone} className="w-full h-full object-cover" alt="" />
                  <div className="absolute bottom-2 right-2 bg-white/18 backdrop-blur-sm text-white text-[10.5px] font-semibold px-2.5 py-0.5 rounded-full border border-white/25">
                    65% Complete
                  </div>
                </div>
              </div>
            </div>

            {/* COMPLETED CARD */}
            <div className="bg-[#f5f7fc] rounded-[18px] border border-[#e4eaf5] px-6 pt-[30px] pb-[30px]">
              <div className="flex items-center gap-[7px] text-[15px] font-bold text-[#64748b]" style={{ letterSpacing: '.7px' }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="6" stroke="#64748b" strokeWidth="1.3"/>
                  <path d="M4 7l2 2 4-4" stroke="#64748b" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Completed
              </div>
              <div className="text-[22px] font-extrabold text-[#0f1117]" style={{ letterSpacing: '-0.6px' }}>Vertex Capital</div>
              <div className="text-[13px] text-[#6b7280] leading-relaxed">
                Full-stack digital presence overhaul for boutique investment firm.
              </div>
              <div className="flex items-center gap-8 mt-[18px]">
                <div>
                  <div className="text-[22px] font-extrabold text-[#2563eb]" style={{ letterSpacing: '-0.5px' }}>4.2x</div>
                  <div className="text-[9.5px] font-bold text-[#94a3b8]" style={{ letterSpacing: '.8px' }}>Engagement Lift</div>
                </div>
                <div>
                  <div className="text-[22px] font-extrabold text-[#2563eb]" style={{ letterSpacing: '-0.5px' }}>Q3</div>
                  <div className="text-[9.5px] font-bold text-[#94a3b8]" style={{ letterSpacing: '.8px' }}>Delivery</div>
                </div>
                <div className="ml-auto text-[13px] font-semibold text-[#2563eb] cursor-pointer hover:underline">View Case</div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-4 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            
            {/* GROWTH VELOCITY */}
            <div className="bg-white rounded-[18px] border border-[#e8edf5] px-[22px] pt-[22px] pb-[18px]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[14px] font-bold text-[#1a1d23]">Growth Velocity</span>
                <span className="flex items-center gap-[5px] text-[12.5px] font-medium text-[#4b5563] cursor-pointer">
                  This Month
                  <svg viewBox="0 0 14 14" fill="none" stroke="#4b5563" strokeWidth="1.5">
                    <path d="M3 5l4 4 4-4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              </div>
              <div>
                <span className="text-[40px] font-extrabold text-[#0f1117]" style={{ letterSpacing: '-1.5px' }}>124k</span>
                <span className="inline-flex items-center gap-[3px] bg-[#dcfce7] text-[#16a34a] text-[11px] font-bold px-2 py-0.5 rounded-full ml-2.5">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 7L5 3l3 4" stroke="#16a34a" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  +14%
                </span>
              </div>
              <div className="text-[12px] text-[#94a3b8] mt-[6px] mb-4 leading-snug">Unique impressions across active campaigns.</div>

              <div className="flex items-end gap-[6px] h-[70px]">
                <div className="flex-1 rounded-t-[5px]" style={{ height: '40%', backgroundColor: '#dde4f0' }}></div>
                <div className="flex-1 rounded-t-[5px]" style={{ height: '55%', backgroundColor: '#dde4f0' }}></div>
                <div className="flex-1 rounded-t-[5px]" style={{ height: '65%', backgroundColor: '#dde4f0' }}></div>
                <div className="flex-1 rounded-t-[5px]" style={{ height: '75%', backgroundColor: '#dde4f0' }}></div>
                <div className="flex-1 rounded-t-[5px]" style={{ height: '100%', backgroundColor: '#2563eb' }}></div>
                <div className="flex-1 rounded-t-[5px]" style={{ height: '60%', backgroundColor: '#dde4f0' }}></div>
              </div>
            </div>

            {/* RECENT ACTIVITY */}
            <div className="bg-white rounded-[18px] border border-[#e8edf5] px-[22px] pt-5 pb-[20px]">
              <div className="text-[14px] font-bold text-[#1a1d23] mb-4">Recent Activity</div>
              <div className="flex flex-col gap-0">

                <div className="flex items-start gap-3 py-2.5 relative">
                  <div className="w-6 h-6 rounded-full border-2 border-[#2563eb] bg-[#2563eb] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <circle cx="5" cy="5" r="3" fill="white"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-[12.5px] font-semibold text-[#1a1d23] leading-snug">Elena R. uploaded new assets for Lumière</div>
                    <div className="text-[11px] text-[#94a3b8] mt-0.5">2 hours ago</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 py-2.5 relative">
                  <div className="w-6 h-6 rounded-full border-2 border-[#cbd5e1] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <circle cx="5" cy="5" r="3.5" stroke="#cbd5e1" strokeWidth="1.5"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-[12.5px] font-semibold text-[#1a1d23] leading-snug">Client feedback received on Phase 2</div>
                    <div className="text-[11px] text-[#94a3b8] mt-0.5">Yesterday, 14:30</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 py-2.5 relative">
                  <div className="w-6 h-6 rounded-full border-2 border-[#94a3b8] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2.5 5l2 2 3-3" stroke="#94a3b8" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-[12.5px] font-semibold text-[#1a1d23] leading-snug">Milestone Vertex Launch completed</div>
                    <div className="text-[11px] text-[#94a3b8] mt-0.5">Oct 12</div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}
export default Dashboard
