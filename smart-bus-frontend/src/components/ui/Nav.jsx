import React, { useState, useEffect, useMemo } from "react";
import { Menu, X } from "lucide-react";
import { useLocation } from "react-router-dom";

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeSection, setActiveSection] = useState("Home");
    const location = useLocation();
    
    
    const navItems = useMemo(() => [

        { href: "/auth", label: "Sign In", isAuth: true },
    ], []);

    // Removed scroll listener (window.scrollY) to keep navbar appearance stable across pages

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    const scrollToSection = (e, href, isAuth = false) => {
        e.preventDefault();
        if (isAuth) {
            window.location.href = '/auth';
            setIsOpen(false);
            return;
        }
        // Handle home navigation specially
        if (href === "#Home") {
            if (location.pathname !== '/') {
                window.location.href = '/';
                return;
            }
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        } else {
            const section = document.querySelector(href);
            if (section) {
                window.scrollTo({
                    top: section.offsetTop - 80,
                    behavior: "smooth"
                });
            }
        }
        setIsOpen(false);
    };

    return (
        <nav className={`fixed w-full top-0 z-50 bg-[#030014]/80 backdrop-blur-xl`}>
            <div className="mx-auto px-4 sm:px-6 lg:px-[10%]">
                <div className="flex items-center justify-between h-16">
                    {/* Logo with image */}
                    <div className="flex-shrink-0">
                        <a
                            href="#Home"
                            onClick={(e) => scrollToSection(e, "#Home")}
                            className="flex items-center"
                        >
                            <img 
                                src="src\assets\media\side logo.png" 
                                alt="Hikma Learn Logo"
                                className="h-10 w-auto"
                                loading="lazy"
                                />
                        </a>
                    </div>
    
                    {/* Desktop Navigation */}
                    <div className="hidden md:block">
                        <div className="ml-8 flex items-center space-x-8">
                            {navItems.map((item) => (
                                <a
                                    key={item.label}
                                    href={item.href}
                                    onClick={(e) => scrollToSection(e, item.href, item.isAuth)}
                                    className="group relative px-1 py-2 text-sm font-medium"
                                >
                                    <span
                                        className={`relative z-10 transition-colors duration-300 ${
                                            activeSection === item.href.slice(1)
                                                ? "bg-gradient-to-r from-[#2e3c79] to-[#f75555] bg-clip-text text-transparent font-semibold"
                                                : "text-[#e2d3fd] group-hover:text-white"
                                        }`}
                                    >
                                        {item.label}
                                    </span>
                                    <span
                                        className={`absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#6366f1] to-[#a855f7] transform origin-left transition-transform duration-300 ${
                                            activeSection === item.href.slice(1)
                                                ? "scale-x-100"
                                                : "scale-x-0 group-hover:scale-x-100"
                                        }`}
                                    />
                                </a>
                            ))}
                        </div>
                    </div>
    
                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className={`relative p-2 text-[#e2d3fd] hover:text-white transition-transform duration-300 ease-in-out transform ${
                                isOpen ? "rotate-90 scale-125" : "rotate-0 scale-100"
                            }`}
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>
    
            {/* Mobile Menu Overlay */}
            <div
                className={`md:hidden fixed inset-0 bg-[#030014] transition-all duration-300 ease-in-out ${
                    isOpen
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-[-100%] pointer-events-none"
                }`}
                style={{ top: "64px", height: "calc(100vh - 64px)" }}
            >
                <div className="flex flex-col h-full">
                    <div className="px-4 py-6 space-y-4 flex-1">
                        {navItems.map((item) => (
                            <a
                                key={item.label}
                                href={item.href}
                                onClick={(e) => scrollToSection(e, item.href, item.isAuth)}
                                className={`block px-4 py-3 text-lg font-medium ${
                                    activeSection === item.href.slice(1)
                                        ? "bg-gradient-to-r from-[#4648d1] to-[#f75555] bg-clip-text text-transparent font-semibold"
                                        : "text-[#e2d3fd] hover:text-white"
                                }`}
                            >
                                {item.label}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;