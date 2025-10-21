import {Link} from "react-router-dom";

export default function Page404(){
    return (
        <>
            <div className="bg-gradient-to-b from-[#97E2FA] to-[#D0D8F2] h-screen overflow-hidden flex flex-col items">
                <img src="/imgs/planepath.png" className="absolute w-[60vh] " alt="plane path"/>
                <div className="flex flex-col items-center mt-48 lg:mt-64">
                    <h1 className="font-regular text-[23vh] lg:text-[25vh] font-['Inter'] ">404</h1>
                    <p className="text-[5vh] -mt-20  lg:-mt-28 ">Page not found</p>
                </div>
                <div className="flex items-center  flex-col mt-20 gap-3 ">
                    <p className="text-[2vh] text-center text-balance">Oops the page you where looking for doesn’t exists or has been moved</p>
                    <p className="text-[2vh]">Take me back to <Link to='/' className="font-bold hover:text-blue-600 hover:cursor-pointer">home</Link></p>
                </div>
                <img src="/imgs/planepath.png" className=" w-[60vh] self-end rotate-90" alt="plane path 2"/>
            </div>
        </>
    )
}