import { useNavigate } from 'react-router-dom'

function Navbar() {
  const navigate = useNavigate()
  return (
    <nav className="w-full bg-white shadow-sm">
      <div className="flex justify-between items-center h-[80px] w-full px-[40px]">
        <div className="font-bold text-medium">PRECISION</div>
        <div className="flex gap-[40px]">
          <a href="/services" className="text-gray-500 font-bold no-underline hover:text-[#003EC7]">Services</a>
          <a href="/casestudy" className="text-gray-500 font-bold no-underline hover:text-[#003EC7]">Case Study</a>
          <a href="/contact" className="text-gray-500 font-bold no-underline hover:text-[#003EC7]">Contact</a>
        </div>
        <div className="w-[130px] h-[35px] bg-gradient-to-b from-[#003EC7] to-[#0052FF] rounded-[9px] text-white text-sm flex items-center justify-center cursor-pointer" onClick={() => navigate('/signup')}>
          Start a Project
        </div>
      </div>
    </nav>
  );
}
export default Navbar
