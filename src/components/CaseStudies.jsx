import couch from '../assets/case-studies/couch.png'
import shelves from '../assets/case-studies/shelves.png'

function CaseStudies() {
  return (
    <section className="bg-[#FAF8FF] w-full h-[1300px]" style={{ paddingTop: '85px' }}>
      <div className="w-[1395px] h-[1064px]" style={{ marginLeft: '60px', marginTop: '85px' }}>
        <div className="flex items-center justify-center gap-[20px] w-full h-[40px]">
          <div className="h-[1px] w-[38%] bg-[#D1D5DB]"></div>
          <div className="text-[12px] tracking-[3px] text-gray-500">
            SELECTED CASE STUDIES
          </div>
          <div className="h-[1px] w-[38%] bg-[#D1D5DB]"></div>
        </div>

        <div className="grid grid-cols-2 grid-rows-7 gap-[30px] mt-[30px]" style={{ columnGap: '90px', height: '995px' }}>
          <div className="[grid-row:1/6] [grid-column:1/2]">
            <img src={couch} className="w-full h-full" alt="" />
          </div>

          <div className="[grid-row:2/7] [grid-column:2/3]">
            <img src={shelves} className="w-full h-full" alt="" />
          </div>

          <div className="[grid-row:6/7] [grid-column:1/2]">
            <div className="text-[35px] text-[#131B2E] flex justify-between">
              <span>LUMIÈRE ATELIER</span>
              <span className="text-[20px] text-[#005A3C] font-bold">2024</span>
            </div>
          </div>

          <div className="[grid-row:6/7] [grid-column:1/2]" style={{ paddingTop: '55px' }}>
            <div className="text-[18px] text-[#434656]">
              EDITORIAL WEB DESIGN / BRANDING
            </div>
          </div>

          <div className="[grid-row:7/8] [grid-column:2/3]">
            <div className="text-[35px] text-[#131B2E] flex justify-between">
              <span>KINETIC RETAIL</span>
              <span className="text-[20px] text-[#005A3C] font-bold">2023</span>
            </div>
          </div>

          <div className="[grid-row:7/8] [grid-column:2/3]" style={{ paddingTop: '55px' }}>
            <div className="text-[18px] text-[#434656]">
              PERFORMANCE MARKETING / CONTENT
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CaseStudies
