import { useNavigate, Link } from 'react-router-dom'
import pen from '../assets/Services-img/pen.png'
import videoEdit from '../assets/Services-img/video edit.png'
import compass from '../assets/Services-img/compass.png'
import drawing from '../assets/Services-img/drawing.png'
import idk from '../assets/Services-img/idk.png'

function Services() {
    const navigate = useNavigate()
    return (
        <div style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#F8FAFC' }}>
            <nav style={{ width: '100%' }}>
                <div style={{ width: '100%', height: '80px', border: '1px solid black', display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: 'bold', paddingLeft: '32px', paddingTop: '30px', paddingBottom: '32px', paddingRight: '35.97px', fontSize: 'medium' }}>PRESICION</div>
                    <div style={{ display: 'flex', paddingTop: '30px', gap: '40px' }}>
                        <Link to="/services" style={{ textDecoration: 'none', color: 'gray', fontWeight: 'bold' }}>Services</Link>
                        <Link to="/casestudy" style={{ textDecoration: 'none', color: 'gray', fontWeight: 'bold' }}>Case Study</Link>
                        <Link to="/contact" style={{ textDecoration: 'none', color: 'gray', fontWeight: 'bold' }}>Contact</Link>
                    </div>
                    <div style={{ height: '35px', width: '130px', background: 'linear-gradient(#003EC7, #0052FF)', borderRadius: '9px', color: 'white', fontSize: 'small', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '25px', marginRight: '20px', cursor: 'pointer' }} onClick={() => navigate('/signup')}>
                        Start a Project
                    </div>
                </div>
            </nav>

            <section style={{ width: '100%', background: '#F8FAFC', display: 'flex', justifyContent: 'center' }}>
                <div style={{ width: '1395px', paddingTop: '80px', paddingBottom: '80px', backgroundColor: '#faf8ff' }}>

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', columnGap: '80px' }}>
                        <div>
                            <div style={{ fontSize: '14px', letterSpacing: '3px', color: '#005A3C' }}>CAPABILITIES</div>
                            <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: '66px', marginTop: '15px' }}>
                                Precision in <span style={{ color: '#003EC7' }}>Execution</span>,<br />
                                Innovation in Thought.
                            </div>
                        </div>
                        <div style={{ fontSize: '21px', color: '#434656', marginTop: '62px' }}>
                            We curate digital experiences that transcend
                            the ordinary. Our services are the architectural
                            pillars of modern brand authority.
                        </div>
                    </div>

                    <div style={{ marginTop: '109px', display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '60px', alignItems: 'center', height: '616px' }}>
                        <div style={{ marginBottom: '480px' }}>
                            <div style={{ fontSize: '12px', letterSpacing: '2px', color: '#6B7280' }}>01 / NARRATIVE</div>
                            <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: '40px', marginTop: '10px' }}>
                                Script Writing
                            </div>
                            <div style={{ marginTop: '15px', fontSize: '16px', color: '#434656', width: '420px', lineHeight: '1.7' }}>
                                Transforming complex ideas into compelling human narratives.
                                We don't just write scripts; we build the emotional scaffolding
                                for your brand's story.
                            </div>
                            <div style={{ marginTop: '25px', display: 'flex', flexDirection: 'column', gap: '8px', color: '#005A3C', lineHeight: '1.5' }}>
                                <div>Conceptual Storyboarding</div>
                                <div>Brand Voice Development</div>
                                <div>Multi-channel Dialogue</div>
                            </div>
                        </div>
                        <div>
                            <img src={pen} alt="" style={{ width: '100%', borderRadius: '12px', height: '750px' }} />
                        </div>
                    </div>

                    <div style={{ marginTop: '120px', display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '60px', alignItems: 'center' }}>
                        <div style={{ width: '100%', borderRadius: '12px', height: '263px', marginTop: '10px', marginBottom: '10px' }}>
                            <img src={videoEdit} alt="" style={{ width: '100%', height: '100%', borderRadius: '12px', objectFit: 'cover' }} />
                        </div>
                        <div>
                            <div style={{ fontSize: '12px', letterSpacing: '2px', color: '#6B7280' }}>02 / VISUALS</div>
                            <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: '40px', marginTop: '10px' }}>
                                Video Editing
                            </div>
                            <div style={{ marginTop: '15px', fontSize: '16px', color: '#434656', width: '420px', lineHeight: '1.7' }}>
                                Precision-cut visuals that command attention.
                                Our editing process fuses rhythm, pacing,
                                and color science to evoke specific responses.
                            </div>
                            <div style={{ marginTop: '20px', color: '#0052FF', lineHeight: '1.7' }}>
                                Dynamic Pacing<br />
                                <span style={{ color: '#434656' }}>Cinematic flow optimized for short-form and feature content.<br /></span>
                                Advanced Color Grading<br />
                                <span style={{ color: '#434656' }}>A unique visual palette for your brand's filmic presence.</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: '120px', display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: '40px' }}>
                        <div style={{ padding: '40px', borderRadius: '12px', background: '#EEF2F7' }}>
                            <div style={{ fontSize: '12px', letterSpacing: '2px', color: '#6B7280' }}>03 / GROWTH</div>
                            <div style={{ fontSize: '26px', marginTop: '10px' }}>
                                Digital Marketing
                            </div>
                            <div style={{ marginTop: '15px', fontSize: '15px', color: '#434656' }}>
                                Integrated ecosystem management focusing
                                on community engagement and high-quality
                                lead generation through creative strategies.
                            </div>
                            <div style={{ marginTop: '20px' }}>
                                <span style={{ background: '#DDE3FF', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', marginRight: '8px' }}>SEO STRATEGY</span>
                                <span style={{ background: '#DDE3FF', padding: '6px 12px', borderRadius: '6px', fontSize: '12px' }}>SOCIAL ARCHITECTURE</span>
                            </div>
                        </div>
                        <div style={{ padding: '40px', borderRadius: '12px', background: '#0F3FBF' }}>
                            <div style={{ fontSize: '12px', letterSpacing: '2px', color: 'white' }}>04 / SCALABILITY</div>
                            <div style={{ fontSize: '26px', marginTop: '10px', color: 'white' }}>
                                Performance Marketing
                            </div>
                            <div style={{ marginTop: '15px', fontSize: '15px', color: 'white' }}>
                                Data-driven aggression. We leverage proprietary
                                analytics and rapid A/B testing to ensure every
                                dollar spent translates to exponential ROI.
                            </div>
                            <div style={{ marginTop: '25px', color: 'white' }}>
                                Real-time Attribution &rarr;
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            <section style={{ width: '100%', height: '420px', background: '#EEF2F7', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ width: '1395px', textAlign: 'center' }}>
                    <div style={{ fontSize: '12px', letterSpacing: '3px', color: '#6B7280' }}>06 / INNOVATION</div>
                    <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: '40px', marginTop: '10px' }}>
                        Product Design
                    </div>
                    <div style={{ marginTop: '10px', fontSize: '15px', color: '#434656' }}>
                        Creating intuitive digital products that marry ergonomic
                        function with museum-grade aesthetics.
                    </div>
                    <div style={{ marginTop: '50px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', columnGap: '40px' }}>
                        <div style={{ padding: '20px' }}>
                            <img src={compass} alt="" style={{ marginBottom: '12px' }} />
                            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>UX Blueprinting</div>
                            <div style={{ marginTop: '6px', fontSize: '14px', color: '#6B7280' }}>
                                Mapping journeys that eliminate friction
                                and spark delight at every touchpoint.
                            </div>
                        </div>
                        <div style={{ padding: '20px' }}>
                            <img src={drawing} alt="" style={{ marginBottom: '12px' }} />
                            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>UI Aesthetics</div>
                            <div style={{ marginTop: '6px', fontSize: '14px', color: '#6B7280' }}>
                                Developing design systems that serve
                                as a scalable source of truth for your
                                digital identity.
                            </div>
                        </div>
                        <div style={{ padding: '20px' }}>
                            <img src={idk} alt="" style={{ marginBottom: '12px' }} />
                            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>Prototyping</div>
                            <div style={{ marginTop: '6px', fontSize: '14px', color: '#6B7280' }}>
                                High-fidelity interactive models that
                                visualize the future of your product
                                before a single line of code is written.
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section style={{ width: '100%', height: '320px', background: '#E9EEF8', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ width: '1395px', textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Manrope', sans-serif", fontSize: '42px' }}>
                        Ready to redefine your <span style={{ color: '#0052FF' }}>Precision?</span>
                    </div>
                    <div style={{ marginTop: '12px', fontSize: '15px', color: '#6B7280' }}>
                        Join the ranks of market leaders who prioritize intentional design
                        and strategic clarity.
                    </div>
                    <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
                        <div style={{ width: '180px', height: '48px', background: 'linear-gradient(#003EC7, #0052FF)', color: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', borderRadius: '8px', cursor: 'pointer' }}>
                            Book Strategy Call
                        </div>
                        <div style={{ color: '#005A3C', fontWeight: 800, paddingTop: '15px', cursor: 'pointer' }}>
                            Download Portfolio &rarr;
                        </div>
                    </div>
                </div>
            </section>

            <section style={{ width: '100%', height: '140px', backgroundColor: '#F8FAFC', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ width: '1395px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 'bold' }}>PRECISION</div>
                    <div style={{ display: 'flex', gap: '40px', color: 'gray', fontSize: '14px' }}>
                        <div>Services</div>
                        <div>Case Studies</div>
                        <div>Privacy</div>
                        <div>Terms</div>
                    </div>
                    <div style={{ fontSize: '14px', color: 'gray' }}>&copy; 2024 Precision Agency. All rights reserved.</div>
                </div>
            </section>
        </div>
    )
}
export default Services
