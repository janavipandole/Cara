import { useNavigate, Link } from 'react-router-dom'
import worldMap from '../assets/case-studies/world map.png'
import black from '../assets/case-studies/black.png'
import phone from '../assets/case-studies/phone.png'
import caseImg from '../assets/case-studies/case.png'
import ninetyNine from '../assets/case-studies/99.png'
import clientPortrait from '../assets/case-studies/Client Portrait.png'

function CaseStudy() {
    const navigate = useNavigate()
    return (
        <div style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#F8FAFC' }}>
            <nav className="w-full">
                <div className="flex justify-between h-[80px] w-full" style={{ border: '1px solid black' }}>
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

            <section className="w-full flex justify-center" style={{ backgroundColor: '#F8FAFC' }}>
                <div className="w-[1395px] pt-[80px] pb-[80px]">
                    <div className="text-[12px] tracking-[3px] text-[#005A3C]">OUR PORTFOLIO</div>
                    <div className="text-[56px] mt-[15px]" style={{ width: '650px' }}>
                        Crafting digital <span className="text-[#0052FF]">authority</span> for global brands.
                    </div>
                    <div className="mt-[20px] text-[16px] text-[#434656]" style={{ width: '600px' }}>
                        We don't just build websites; we curate digital experiences
                        that command attention. Explore how we've helped market leaders
                        redefine their digital presence through intentional design
                        and technical precision.
                    </div>

                    <div className="grid grid-cols-[1fr_1fr] gap-[60px]" style={{ marginTop: '60px' }}>
                        <div>
                            <img src={worldMap} alt="" className="w-full rounded-[12px]" />
                            <div className="text-[#6B7280]" style={{ paddingTop: '30px' }}>UI/UX STRATEGY & DATA VIZ</div>
                            <div className="text-[45px] mt-[15px]">
                                Lumina Analytics
                            </div>
                            <div className="mt-[8px] text-[25px] text-[#6B7280]" style={{ width: '85%' }}>
                                A transformative redesign of an enterprise data
                                platform, resulting in a 60% increase in user retention.
                            </div>
                        </div>
                        <div style={{ marginTop: '85px' }}>
                            <img src={black} alt="" className="w-full rounded-[12px]" />
                            <div className="text-[#6B7280]" style={{ paddingTop: '30px' }}>E-COMMERCE EXPERIENCE</div>
                            <div className="text-[45px] mt-[15px]">
                                Ethereal Watches
                            </div>
                            <div className="mt-[8px] text-[25px] text-[#6B7280]" style={{ width: '85%' }}>
                                Crafting a bespoke digital boutique that translated
                                analogue luxury into a seamless online shopping experience.
                            </div>
                        </div>
                    </div>

                    <div style={{ marginLeft: '105px', marginTop: '100px' }}>
                        <img src={ninetyNine} alt="" />
                    </div>

                    <div className="flex" style={{ marginBottom: '10px', width: '750px' }}>
                        <img src={clientPortrait} alt="" className="rounded-[10px]" style={{ paddingRight: '10px', marginBottom: '10px' }} />
                        <div className="text-[18px] text-[#131B2E] font-black leading-[1.5]" style={{ marginTop: '10px' }}>
                            "Precision didn't just deliver a website; they delivered a new
                            standard for our industry. Their intentional use of space and
                            typography mirrors our own commitment to excellence."
                        </div>
                    </div>
                    <div className="text-[14px] text-[#6B7280]" style={{ marginTop: '-20px', marginLeft: '105px', marginBottom: '85px' }}>
                        Marcus Thorne<br />
                        CEO, Lumière Digital
                    </div>

                    <div className="grid grid-cols-[1fr_1fr] gap-[60px]" style={{ marginTop: '60px' }}>
                        <div>
                            <img src={phone} alt="" className="w-full rounded-[12px]" />
                            <div className="text-[#6B7280]" style={{ paddingTop: '30px' }}>PRODUCT</div>
                            <div className="text-[45px] mt-[15px]">
                                Velo Social
                            </div>
                            <div className="mt-[8px] text-[25px] text-[#6B7280]" style={{ width: '85%' }}>
                                Reimagining social connection through a privacy-first
                                mobile application focused on high-fidelity interaction.
                            </div>
                        </div>
                        <div style={{ marginTop: '85px' }}>
                            <img src={caseImg} alt="" className="w-full rounded-[12px]" />
                            <div className="text-[#6B7280]" style={{ paddingTop: '30px' }}>BRAND IDENTITY</div>
                            <div className="text-[45px] mt-[15px]">
                                Vertex Capital
                            </div>
                            <div className="mt-[8px] text-[25px] text-[#6B7280]" style={{ width: '85%' }}>
                                Developing a digital foundation inclusive of a
                                branding system firm, emphasizing stability and innovation.
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="w-full flex justify-center items-center" style={{ height: '420px', backgroundColor: '#EEF2F7' }}>
                <div className="w-[1395px] grid grid-cols-[1.2fr_1fr] gap-[60px]">
                    <div>
                        <div className="text-[36px]">
                            Designed for those who lead.
                        </div>
                        <div className="mt-[15px] text-[15px] text-[#434656]" style={{ width: '420px' }}>
                            Our methodology is rooted in the belief that digital
                            interfaces should be as refined as the products they represent.
                        </div>
                        <div className="flex flex-col gap-[18px]" style={{ marginTop: '30px' }}>
                            <div>
                                <div className="font-bold">Architectural Rigor</div>
                                <div className="text-[14px] text-[#6B7280]">
                                    Grid-based layouts that ensure visual stability across all device scales.
                                </div>
                            </div>
                            <div>
                                <div className="font-bold">User-Centric Narrative</div>
                                <div className="text-[14px] text-[#6B7280]">
                                    We treat every scroll as a chapter in your brand's unique story.
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-[1fr_1fr] grid-rows-[1fr_1fr] gap-[20px]">
                        <div className="bg-white rounded-[12px] p-[25px] text-[28px] text-[#0052FF]">
                            98%<span className="block text-[12px] text-[#6B7280] mt-[5px]">CLIENT RETENTION</span>
                        </div>
                        <div className="bg-white rounded-[12px] p-[25px] text-[28px] text-[#0052FF]">
                            15+<span className="block text-[12px] text-[#6B7280] mt-[5px]">DESIGN AWARDS</span>
                        </div>
                        <div className="bg-white rounded-[12px] p-[25px] text-[28px] text-[#0052FF]">
                            2.4x<span className="block text-[12px] text-[#6B7280] mt-[5px]">AVG CONVERSION LIFT</span>
                        </div>
                        <div className="bg-white rounded-[12px] p-[25px] text-[28px] text-[#0052FF]">
                            50m<span className="block text-[12px] text-[#6B7280] mt-[5px]">USERS IMPACTED</span>
                        </div>
                    </div>
                </div>
            </section>

            <section className="w-full flex justify-center items-center" style={{ height: '360px', backgroundColor: '#F8FAFC' }}>
                <div className="w-[1395px]" style={{ textAlign: 'center' }}>
                    <div className="text-[65px] font-black">
                        Ready to curate your next<br />
                        <span className="text-[#003EC7]">digital masterpiece?</span>
                    </div>
                    <div className="mt-[30px] flex justify-center gap-[20px]">
                        <div className="w-[170px] h-[48px] bg-gradient-to-b from-[#003EC7] to-[#0052FF] text-white flex justify-center items-center rounded-[8px] cursor-pointer" onClick={() => navigate('/signup')}>
                            Start a Project
                        </div>
                        <div className="w-[170px] h-[48px] bg-[#E2E7FF] text-[#003EC7] flex justify-center items-center rounded-[8px] cursor-pointer" onClick={() => navigate('/services')}>
                            View Services
                        </div>
                    </div>
                </div>
            </section>

            <section className="w-full flex justify-center items-center" style={{ height: '140px', backgroundColor: '#F8FAFC' }}>
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
export default CaseStudy
