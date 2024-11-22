import Image from "next/image";
import { Button } from "./ui/button";
import Link from "next/link";

const HeroSection: React.FC = () => {
  return (
		<section id="home" className="relative h-[820px] md:h-dvh w-full flex items-center justify-center">
			<Image
				src="https://res.cloudinary.com/dw4ecbwo9/image/upload/c_pad,b_gen_fill,w_1920,h_1080,ar_16:9/v1732250788/wp9441481_xecwvr.webp"
				alt="Barbershop interior"
				priority
				className="absolute z-0 object-cover hidden md:block"
				fill
				sizes="100vw"
			/>
			<Image
				src="https://res.cloudinary.com/dw4ecbwo9/image/upload/c_pad,b_gen_fill,w_385,h_684,ar_9:16/v1732250788/wp9441481_xecwvr.webp"
				alt="Barbershop interior mobile"
				priority
				className="absolute z-0 object-fill md:hidden"
				fill
				sizes="100vw"
			/>
			<div className="z-10 relative flex flex-col items-center text-center bg-[#000] bg-opacity-30 p-8 rounded-lg">
				<h2 className="text-5xl md:text-7xl font-bold mb-4 text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] text-balance">
					Estilo Clásico, Toque Moderno
				</h2>
				<p className="text-xl md:text-2xl text-white mb-8 drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] text-balance">
					Experiencia de barbería premium desde 2024
				</p>
				<Link href="https://api.whatsapp.com/send?phone=584246248690">
					<Button variant="outline" className="shadow-sm hover:bg-black hover:text-white border-0">
						Reserva tu cita
					</Button>
				</Link>
			</div>
		</section>
	);
};

export default HeroSection;