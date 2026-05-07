import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { auth } from '../firebase/config'
import { signInWithEmailAndPassword } from 'firebase/auth'

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault()
        try {
            const cred = await signInWithEmailAndPassword(auth, email, password)
            navigate('/dashboard')
        } catch (err) {
            setError(err.message)
        }
    }

    return (
        <div className="w-full min-h-screen bg-[#f0f0f8] flex items-center justify-center">
            <div className="w-full min-h-screen bg-[#f0f0f8] flex flex-col items-center justify-center">
                <div className="text-center mb-6">
                    <h1 className="text-[28px] font-bold text-[#0d0d1a] mb-1" style={{ letterSpacing: '-0.3px' }}>
                        The Precision Agency
                    </h1>
                    <p className="text-[14px] text-[#7a7a9a] font-normal">
                        Digital Curator Mode
                    </p>
                </div>

                <div className="bg-white rounded-[12px] px-[36px] pt-[36px] pb-[32px] w-full max-w-[296px] shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
                    <form onSubmit={handleLogin}>
                        <div className="mb-[18px]">
                            <label htmlFor="email" className="block text-[10px] font-semibold text-[#555570] uppercase mb-1.5" style={{ letterSpacing: '0.08em' }}>
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                placeholder="curator@precision.agency"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#eeeef8] border-none rounded-[6px] text-[14px] text-[#0d0d1a] outline-none placeholder:text-[#aaaacc] focus:shadow-[0_0_0_2px_rgba(45,82,224,0.25)]"
                                style={{ padding: '11px 14px' }}
                                required
                            />
                        </div>

                        <div className="mb-[18px]">
                            <div className="flex justify-between items-center mb-1.5">
                                <label htmlFor="password" className="text-[10px] font-semibold text-[#555570] uppercase" style={{ letterSpacing: '0.08em' }}>
                                    Password
                                </label>
                                <a href="#" className="text-[12px] text-[#2d52e0] no-underline hover:underline font-normal">
                                    Forgot Password?
                                </a>
                            </div>
                            <input
                                type="password"
                                id="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#eeeef8] border-none rounded-[6px] text-[14px] text-[#555570] outline-none focus:shadow-[0_0_0_2px_rgba(45,82,224,0.25)]"
                                style={{ padding: '11px 14px', letterSpacing: '0.15em' }}
                                required
                            />
                        </div>

                        {error && <p className="text-red-500 text-[12px] mb-[6px]">{error}</p>}

                        <button
                            type="submit"
                            className="w-full bg-[#2d52e0] text-white border-none rounded-[6px] text-[14px] font-semibold cursor-pointer hover:bg-[#2344c8] block"
                            style={{ padding: '13px', marginTop: '20px', letterSpacing: '0.01em' }}
                        >
                            Sign In
                        </button>
                    </form>

                    <div className="text-center text-[13px] text-[#7a7a9a] mt-[18px]">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-[#2d52e0] no-underline font-medium hover:underline">
                            Sign Up
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login
