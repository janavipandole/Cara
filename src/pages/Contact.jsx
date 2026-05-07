import { useNavigate, Link } from 'react-router-dom'
import email from '../assets/Contact-Us-img/email.png'
import location from '../assets/Contact-Us-img/location.png'
import call from '../assets/Contact-Us-img/call.png'
import map from '../assets/Contact-Us-img/map.png'
import office from '../assets/Contact-Us-img/office.png'

function Contact() {
    const navigate = useNavigate()
    return (
        <div className="bg-[#faf8ff]" style={{ fontFamily: "'Inter', sans-serif" }}>
            <nav className="w-full bg-[#F8FAFCCC]">
                <div className="flex justify-between h-[80px] w-full">
                    <div className="font-bold text-medium pl-[32px] pt-[30px] pb-[32px] pr-[35.97px]">PRECISION</div>
                    <div className="flex pt-[30px] gap-[40px]">
                        <Link to="/services" className="text-gray-500 font-bold no-underline hover:text-[#003EC7]">Services</Link>
                        <Link to="/casestudy" className="text-gray-500 font-bold no-underline hover:text-[#003EC7]">Case Study</Link>
                        <Link to="/contact" className="text-gray-500 font-bold no-underline hover:text-[#003EC7]">Contact</Link>
                    </div>
                    <div className="w-[130px] h-[35px] bg-gradient-to-b from-[#003EC7] to-[#0052FF] rounded-[9px] text-white text-sm flex items-center justify-center mt-[25px] mr-[20px] cursor-pointer" onClick={() => navigate('/signup')}>
                        Start a Project
                    </div>
                </div>
            </nav>
            <section className="h-[315px] w-[1450px] mt-[25px] mx-[25px] !pl-[70px]">
                <div className="w-[154px] h-[27px] rounded-[15px] flex items-center justify-center text-sm bg-[#EAEDFF] text-[#003EC7] font-bold">
                    LET'S CONNECT
                </div>
                <div className="text-[35px] pt-[30px]" style={{ fontFamily: "'Inter', sans-serif" }}>
                    <h1 className="font-black">Let's Create Something</h1>
                    <h1 className="font-black text-[#005A3C]">Extraordinary</h1>
                </div>
                <div className="w-[680px] h-[69px] text-[#434656] text-lg flex items-end mt-5">
                    Whether you're starting from zero or scaling to the next billion, we're here to curate your digital presence with surgical precision.
                </div>
            </section>
            <section className="w-full h-[750px] bg-[#F8FAFC] flex items-center justify-center">
                <div className="w-[1395px] grid grid-cols-[2fr_1fr] gap-[60px]">
                    <div className="flex flex-col gap-[25px]">
                        <div className="bg-white h-[604px] w-[890px] pt-[36px] px-[36px] pb-[10px] rounded-[12px]">
                            <div className="grid grid-cols-2 gap-[25px] mb-[25px]">
                                <div className="flex flex-col">
                                    <label className="text-[12px] tracking-[2px] mb-2 text-[#6B7280]">FULL NAME</label>
                                    <input type="text" placeholder="John Doe" className="h-[55px] rounded-[8px] border border-[#D1D5DB] pl-[18px] bg-[#eaedff]" />
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-[12px] tracking-[2px] mb-2 text-[#6B7280]">EMAIL ADDRESS</label>
                                    <input type="email" placeholder="john@company.com" className="h-[55px] rounded-[8px] border border-[#D1D5DB] pl-[18px] bg-[#eaedff]" />
                                </div>
                            </div>
                            <div className="flex flex-col mb-[25px]">
                                <label className="text-[12px] tracking-[2px] mb-2 text-[#6B7280]">SERVICE OF INTEREST</label>
                                <input type="text" placeholder="Digital Strategy" className="h-[55px] rounded-[8px] border border-[#D1D5DB] pl-[18px] bg-[#eaedff]" />
                            </div>
                            <div className="flex flex-col mb-[25px]">
                                <label className="text-[12px] tracking-[2px] mb-2 text-[#6B7280]">YOUR MESSAGE</label>
                                <textarea placeholder="Tell us about your vision..." className="h-[160px] rounded-[8px] border border-[#D1D5DB] p-[18px] bg-[#eaedff]" />
                            </div>
                            <div className="w-[160px] h-[50px] bg-gradient-to-b from-[#003EC7] to-[#0052FF] text-white flex items-center justify-center rounded-[10px] font-bold mt-[25px] cursor-pointer hover:opacity-90">
                                Send Brief
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-[25px]">
                        <div className="flex flex-col gap-[28px] p-8 bg-[#f0f0fa] rounded-[16px] max-w-[400px] w-full">
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 min-w-16 rounded-[12px] flex items-center justify-center">
                                    <img src={email} width="40" height="40" alt="" />
                                </div>
                                <div className="flex flex-col gap-1 min-h-[64px] justify-center">
                                    <p className="text-base font-semibold text-[#131B2E]">Email Us</p>
                                    <p className="text-[15px] text-[#434656] leading-relaxed">hello@precision.agency</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 min-w-16 rounded-[12px] flex items-center justify-center">
                                    <img src={location} width="40" height="40" alt="" />
                                </div>
                                <div className="flex flex-col gap-1 min-h-[64px] justify-center">
                                    <p className="text-base font-semibold text-[#131B2E]">Our Studio</p>
                                    <p className="text-[15px] text-[#434656] leading-relaxed">1221 Creative Way,<br />Austin, TX 78701</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 min-w-16 rounded-[12px] flex items-center justify-center">
                                    <img src={call} width="40" height="40" alt="" />
                                </div>
                                <div className="flex flex-col gap-1 min-h-[64px] justify-center">
                                    <p className="text-base font-semibold text-[#131B2E]">Voice</p>
                                    <p className="text-[15px] text-[#434656] leading-relaxed">+1 (555) 234-8900</p>
                                </div>
                            </div>
                        </div>
                        <div className="h-[260px] rounded-[12px] relative flex items-end" style={{ backgroundImage: `url(${office})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                            <div className="bg-white/85 m-[20px] p-[15px] rounded-[8px] text-[14px]">
                                <div className="text-[12px] text-[#005A3C] mb-[5px]">IN-PERSON</div>
                                <div>"We host curated strategy sessions every Friday. Stop by for coffee."</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section className="w-full h-[600px]">
                <img src={map} alt="" className="pt-5 pb-5 pl-[50px]" height="600" width="1450" />
            </section>
            <section className="w-full h-[140px] bg-[#F8FAFC] flex justify-center items-center">
                <div className="w-[1395px] flex justify-between items-center">
                    <div className="font-bold">PRECISION</div>
                    <div className="flex gap-[40px] text-gray-500 text-[14px]">
                        <div>Services</div>
                        <div>Case Studies</div>
                        <div>Privacy</div>
                        <div>Terms</div>
                    </div>
                    <div className="text-[14px] text-gray-500">&copy; 2024 Precision Agency. All rights reserved.</div>
                </div>
            </section>
        </div>
    )
}
export default Contact
