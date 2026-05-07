import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { auth } from '../firebase/config'
import { createUserWithEmailAndPassword } from 'firebase/auth'

function Signup() {
    const [fullName, setFullName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleSignup = async (e) => {
        e.preventDefault()
        try {
            await createUserWithEmailAndPassword(auth, email, password)
            navigate('/dashboard')
        } catch (err) {
            setError(err.message)
        }
    }

    return (
        <div className="min-h-screen w-full bg-[#f0f0f8] flex items-center justify-center border-[6px] border-solid border-[#111] box-border font-sans">
            <div className="w-full min-h-screen bg-[#f0f0f8] flex flex-col items-center justify-center pb-[20px] box-border">
                <div className="text-center mb-[24px]">
                    <h1 className="text-[28px] font-bold text-[#0d0d1a] mb-[4px] tracking-[-0.3px] leading-[1.2] m-0 p-0">
                        The Precision Agency
                    </h1>
                    <p className="text-[14px] text-[#7a7a9a] font-normal leading-[1.4] !mb-[40px]">
                        Digital Curator Mode.
                    </p>
                </div>

                <div className="bg-white rounded-[12px] px-[36px] pt-[36px] pb-[32px] w-full max-w-[350px] min-h-[300px] shadow-[0_2px_12px_rgba(0,0,0,0.06)] box-border">
                    <div className="mb-[18px]">
                        <label htmlFor="fullname" className="block text-[13px]  font-semibold tracking-[0.08em] text-[#555570] uppercase mb-[7px]  pt-10">
                            Full Name
                        </label>
                        <input
                            type="text"
                            id="fullname"
                            placeholder="Jane Doe"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full bg-[#eeeef8] border-0 rounded-[6px] py-[10px] px-[20px] text-[14px] text-[#0d0d1a] outline-none font-sans leading-[1.4285714] focus:shadow-[0_0_0_2px_rgba(45,82,224,0.25)] placeholder:text-[#aaaacc] placeholder:text-[13.5px] appearance-none"
                        />
                    </div>

                    <div className="mb-[18px]">
                        <label htmlFor="email" className="block text-[13px] font-semibold tracking-[0.08em] text-[#555570] uppercase mb-[7px] m-0 p-0">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            placeholder="jane@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[#eeeef8] border-0 rounded-[6px] py-[10px] px-[20px] text-[14px] text-[#0d0d1a] outline-none font-sans leading-[1.4285714] focus:shadow-[0_0_0_2px_rgba(45,82,224,0.25)] placeholder:text-[#aaaacc] placeholder:text-[13.5px] appearance-none"
                        />
                    </div>

                    <div className="mb-[18px]">
                        <label htmlFor="password" className="block text-[13px] font-semibold tracking-[0.08em] text-[#555570] uppercase mb-[7px] m-0 p-0">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[#eeeef8] border-0 rounded-[6px] py-[10px] px-[20px] text-[14px] text-[#555570] tracking-[0.15em] outline-none font-sans leading-[1.4285714] focus:shadow-[0_0_0_2px_rgba(45,82,224,0.25)] appearance-none"
                        />
                    </div>

                    {error && <p className="text-red-500 text-[12px] mb-[6px] m-0 p-0">{error}</p>}

                    <button
                        type="submit"
                        onClick={handleSignup}
                        className="block w-full bg-[#2d52e0] text-white border-0 rounded-[6px] py-[14px] px-[14px] text-[14px] font-semibold cursor-pointer mt-[22px] tracking-[0.01em] hover:bg-[#2344c8] font-sans m-0 p-0 leading-[1.4285714] appearance-none"
                    >
                        Create Account
                    </button>

                    <div className="text-center mt-[18px] text-[13px] text-[#7a7a9a]">
                        Already have an account?{' '}
                        <Link to="/login" className="text-[#2d52e0] no-underline font-semibold border-b-[1.5px] border-b-[#2d52e0] pb-[1px] hover:opacity-80">
                            Login
                        </Link>
                    </div>
                </div>

                <div className="mt-[28px] text-[10px] tracking-[0.1em] text-[#aaaabb] uppercase text-center m-0 p-0">
                    &copy; 2024 The Precision Agency
                </div>
            </div>
        </div>
    )
}

export default Signup
