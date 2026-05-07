function CTA() {
    return(
        <section className="bg-[#FAF8FF] w-full h-[500px] flex justify-center items-center">
            <div className="w-[1395px] h-[450px]">
                <div className="w-full h-full rounded-[40px] bg-gradient-to-r from-[#003EC7] to-[#2F6BFF] flex flex-col justify-center items-center">
                    <h2 className="text-[48px] text-white text-center font-bold" style={{ fontFamily: "'Manrope', sans-serif" }}>
                        Ready to refine<br />your narrative?
                    </h2>
                    <p className="text-[16px] text-[#E5E7EB] text-center w-[500px]" style={{ marginTop: '20px' }}>
                        We are currently accepting new projects for Q3 2024.
                        Let's build something intentional together.
                    </p>
                    <div className="w-[180px] h-[50px] bg-white text-[#003EC7] rounded-[10px] flex justify-center items-center font-bold cursor-pointer" style={{ marginTop: '35px' }}>
                        Start a Project
                    </div>
                </div>
            </div>
        </section>
    )
}
export default CTA
