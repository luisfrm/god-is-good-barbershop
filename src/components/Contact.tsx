import { Mail, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';
import { mapUrl, whatsappUrl } from '@/lib/utils';
import H3_Heading from './H3_Heading';


interface Contact {
  title: string;
  description: string;
  icon: React.ReactNode;
  url?: string;
}

const contact: Contact[] = [
	{
		title: "Dirección",
		description: "Calle 89 Av. 7, Maracaibo",
		icon: <MapPin className="h-12 w-12 text-primary" />,
    url: mapUrl
	},
  {
    title:"Teléfono",
    description: "+584246248690",
    icon: <Phone className="h-12 w-12 text-primary" />,
    url: whatsappUrl
  },
  {
    title: "Email",
    description: "info@barbershop.com",
    icon: <Mail className="h-12 w-12 text-primary" />,
    url: "mailto:info@barbershop.com"
  }
];

const Contact = () => {
	return (
		<section id="contact" className="w-full py-10 bg-gray-100">
			<div className="max-w-6xl mx-auto text-center">
				<H3_Heading>Contacto</H3_Heading>
				<div className="grid grid-cols-1 lg:grid-cols-3 justify-center gap-8 mt-2">
					{contact.map((item, index) => (
						<div className="flex flex-col gap-0 md:gap-4 items-center" key={index}>
							<span className="mb-3 md:mb-0">{item.icon}</span>
							<h4 className="font-semibold text-4xl font-serif">{item.title}</h4>
							{item.url ? (
								<Link className="text-lg" target="_blank" href={item.url}>
									{item.description}
								</Link>
							) : (
								<p>{item.description}</p>
							)}
						</div>
					))}
				</div>
				{(mapUrl || whatsappUrl) && (
					<div className="grid grid-cols-1 px-4 md:flex gap-2 items-center justify-center mt-10">
						{whatsappUrl && (
							<Link target="_blank" href={whatsappUrl}>
								<Button variant="default" className="w-full shadow-sm hover:opacity-90">
									Reserva tu cita
								</Button>
							</Link>
						)}
						{mapUrl && (
							<Link target="_blank" href={mapUrl}>
								<Button variant="secondary" className="w-full shadow-sm border border-black bg-white hover:opacity-90">
									Ver ubicación
								</Button>
							</Link>
						)}
					</div>
				)}
			</div>
		</section>
	);
};

export default Contact
