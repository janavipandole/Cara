import stack1 from '../assets/hero-images/stack1.png'
import stack2 from '../assets/hero-images/stack2.png'

function Hero() {
  return (
    <section className="w-full h-[700px] flex justify-center items-center bg-[#FEF8FD]" style={{ paddingTop: '110.5px', paddingRight: '32px', paddingBottom: '110.5px', paddingLeft: '32px' }}>
      <div className="w-[96%] h-[121%] grid grid-cols-2 gap-[40px]" style={{ alignItems: 'center' }}>
        <div className="pt-4">
          <div className="w-[154px] h-[27px] rounded-[15px] flex items-center justify-center text-sm bg-[#EAEDFF] text-[#005A3C] font-bold">
            DIGITAL CURATORS
          </div>
          <h1 className="mt-[20px]" style={{ fontFamily: "'Manrope', sans-serif", fontSize: '65px' }}>
            <div>Elevating</div>
            <div className="text-[#005A3C]">Brand</div>
            <span className="text-[#005A3C]">Stories</span>
            <span> With</span>
            <div>Intent.</div>
          </h1>
          <p className="text-gray-500 text-[15px] w-[60%]" style={{ marginTop: '20px', height: '66px' }}>
            We don't just build interfaces. We curate experiences
            through rigorous precision and editorial authority.
          </p>
          <div className="flex gap-[15px]" style={{ marginTop: '40px' }}>
            <span className="bg-gradient-to-b from-[#003EC7] to-[#0052FF] text-white h-[46px] w-[157px] rounded-[2px] flex items-center justify-center cursor-pointer">
              View Showcase
            </span>
            <span className="bg-[#E2E7FF] text-[#003EC7] font-bold h-[46px] w-[157px] rounded-[2px] flex items-center justify-center cursor-pointer">
              The Methodology
            </span>
          </div>
        </div>
        <div className="relative w-full h-full">
          <div className="absolute z-10 overflow-hidden rounded-[20px]" style={{ top: '1px', right: '31px', width: '460px', height: '588px', transform: 'rotate(2deg)' }}>
            <img src={stack2} className="w-full h-full object-cover block" alt="" />
          </div>
          <div className="absolute z-20 overflow-hidden rounded-[20px]" style={{ top: '-2px', right: '60px', width: '481px', height: '635px' }}>
            <img src={stack1} className="w-full h-full object-cover block" alt="" />
          </div>
        </div>
      </div>
    </section>
  ) 
}

export default Hero
