import About from "@/components/About";
import Contact from "@/components/Contact";
import HeroSection from "@/components/HeroSection";
import Services from "@/components/Services";

export default function Home() {
  return (
		<>
			<main className="min-h-dvh">
				<HeroSection />
				<Services />
				<About />
				<Contact />
			</main>
			<footer className="bg-gray-900 text-white py-12">
				<div className="container mx-auto px-4 text-center">
					<p className="text-sm font-medium">&copy; 2024 God&apos;s Good BarberShop. Todos los derechos reservados.</p>
				</div>
			</footer>
		</>
	);
}
