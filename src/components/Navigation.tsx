"use client"
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";

interface NavItems {
  text: string;
  href: string;
}

const items: NavItems[] = [
  {
    text: "Inicio",
    href: "home"
  },
  {
    text: "Servicios",
    href: "services"
  },
  {
    text: "Sobre nosotros",
    href: "about"
  },
  {
    text: "Contacto",
    href: "contact"
  },
]

const Navigation = () => {
  const [activeSection, setActiveSection] = useState("")
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("section")
      const scrollPosition = window.scrollY + 100 // Offset for the fixed navbar

      sections.forEach((section) => {
        if (
          section.offsetTop <= scrollPosition &&
          section.offsetTop + section.offsetHeight > scrollPosition
        ) {
          setActiveSection(section.id)
        }
      })
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (href: string) => {
    setIsOpen(false)
    document.querySelector(`#${href}`)?.scrollIntoView({
      behavior: "smooth"
    })
  }

  return (
		<nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
			<div className="max-w-7xl mx-auto px-4">
				<div className="flex items-center justify-between h-16">
					<h1 className="text-3xl font-bold text-gray-800 font-serif drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] transition-all duration-150 hover:drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] cursor-pointer">
						God&apos;s Good
					</h1>
					<ul className="hidden md:flex gap-8">
						{items.map((item, index) => (
							<li
								className={cn(
									"cursor-pointer text-gray-500 hover:text-gray-900 text-sm font-medium border-b-2 py-2 border-transparent hover:border-b-black",
									activeSection == item.href && "text-gray-900 border-b-black",
								)}
								key={index}
								onClick={() => scrollToSection(item.href)}
							>
								<span>{item.text}</span>
							</li>
						))}
					</ul>
					<Sheet open={isOpen} onOpenChange={setIsOpen}>
						<SheetTrigger asChild>
							<Button variant="ghost" className="md:hidden">
								<Menu className="h-6 w-6" />
								<span className="sr-only">Toggle Menu</span>
							</Button>
						</SheetTrigger>
						<SheetContent side="right" className="w-[300px] sm:w-[400px]" aria-describedby="sheet-description">
							<SheetHeader>
								<SheetTitle className="sr-only">Menu de navegación</SheetTitle>
                <SheetDescription className="sr-only">
                  Accede a las diferentes secciones de nuestra página
                </SheetDescription>
							</SheetHeader>
							<nav className="flex flex-col gap-4">
								<ul>
									{items.map((item, index) => (
										<li
											className={cn(
												"text-gray-600 hover:text-gray-900 px-3 py-2 text-lg font-medium",
												"cursor-pointer",
												activeSection == item.href && "text-gray-900 font-bold",
											)}
											key={index}
											onClick={() => scrollToSection(item.href)}
										>
											<span>{item.text}</span>
										</li>
									))}
								</ul>
							</nav>
						</SheetContent>
					</Sheet>
				</div>
			</div>
		</nav>
	);
}

export default Navigation