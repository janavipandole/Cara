import icon1 from '../assets/icons/Icon 1.png'
import icon2 from '../assets/icons/Icon 2.png'
import icon3 from '../assets/icons/Icon 3.png'
import icon4 from '../assets/icons/Icon 4.png'
import icon5 from '../assets/icons/Icon 5.png'

function Expertise() {
    return (
        <section style={{ backgroundColor: '#FFFFFF', height: '900px', width: '100%', paddingTop: '85px', paddingBottom: '85px', paddingLeft: '58px', paddingRight: '15px' }}>
            <div style={{ width: '1395px', height: '725px' }}>

                <div style={{ width: '100%', height: '80px', color: 'gray', marginBottom: '40px' }}>
                    <div>EXPERTIES</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '20px' }}>
                        <h1 style={{ color: 'black', fontSize: '40px' }}>The Precision Toolkit</h1>
                        <div>
                            A curated selection of technical and creative<br />
                            disciplines aimed at total brand transformation.
                        </div>
                    </div>
                </div>

                <div style={{ width: '100%', height: '639px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(7, 1fr)', rowGap: '30px', columnGap: '30px' }}>

                    <div style={{ backgroundColor: '#F2F3FF', gridRow: '1 / 4', padding: '30px', borderRadius: '12px' }}>
                        <img src={icon1} style={{ marginTop: '30px', marginBottom: '15px' }} alt="" />
                        <h3 style={{ marginBottom: '15px', fontFamily: "'Manrope', sans-serif", fontWeight: 500, fontSize: '25px' }}>Script Writing</h3>
                        <p style={{ color: '#434656' }}>
                            Articulating the core narrative of your brand
                            through cinematic dialogue and strategic
                            storytelling.
                        </p>
                    </div>

                    <div style={{ backgroundColor: '#F2F3FF', gridRow: '4 / 7', padding: '30px', borderRadius: '12px' }}>
                        <img src={icon2} style={{ marginTop: '30px', marginBottom: '15px' }} alt="" />
                        <h3 style={{ marginBottom: '15px', fontFamily: "'Manrope', sans-serif", fontWeight: 500, fontSize: '25px' }}>Video Editing</h3>
                        <p style={{ color: '#434656' }}>
                            High-end post-production that maintains the
                            integrity of your visual language.
                        </p>
                    </div>

                    <div style={{ backgroundColor: '#F2F3FF', gridColumn: '2 / 3', gridRow: '2 / 5', padding: '30px', borderRadius: '12px' }}>
                        <img src={icon3} style={{ marginTop: '30px', marginBottom: '15px' }} alt="" />
                        <h3 style={{ marginBottom: '15px', fontFamily: "'Manrope', sans-serif", fontWeight: 500, fontSize: '25px' }}>Digital Marketing</h3>
                        <p style={{ color: '#434656' }}>
                            Omnichannel strategies that place your
                            message in the hands of the right curators.
                        </p>
                    </div>

                    <div style={{ backgroundColor: '#F2F3FF', gridColumn: '2 / 3', gridRow: '5 / 8', padding: '30px', borderRadius: '12px' }}>
                        <img src={icon4} style={{ marginTop: '30px', marginBottom: '15px' }} alt="" />
                        <h3 style={{ marginBottom: '15px', fontFamily: "'Manrope', sans-serif", fontWeight: 500, fontSize: '25px' }}>Performance</h3>
                        <p style={{ color: '#434656' }}>
                            Data-driven scaling that respects the
                            aesthetic soul of your campaigns.
                        </p>
                    </div>

                    <div style={{ backgroundColor: '#F2F3FF', gridColumn: '3 / 4', gridRow: '1 / 8', padding: '30px', borderRadius: '12px' }}>
                        <img src={icon5} style={{ paddingTop: '170px' }} alt="" />
                        <h3 style={{ marginBottom: '15px', fontFamily: "'Manrope', sans-serif", fontWeight: 500, fontSize: '25px' }}>Product Design</h3>
                        <p style={{ color: '#434656', paddingBottom: '20px' }}>
                            Architecting digital ecosystems that prioritize
                            user focus and high-end visual utility.
                        </p>
                        <a href="#" style={{ color: '#005A3C', fontSize: '15px', textDecoration: 'none' }}>
                            Explore our design ethos &rarr;
                        </a>
                    </div>

                </div>
            </div>
        </section>
    )
}

export default Expertise
