import { Mail, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';
import { Button } from './ui/button';


interface Contact {
  title: string;
  description: string;
  icon: React.ReactNode;
  url?: string;
}

const contact: Contact[] = [
	{
		title: "Dirección",
		description: "Calle 89, -bajando Av7-, Maracaibo",
		icon: <MapPin className="h-12 w-12 text-primary" />,
    url: "https://maps.app.goo.gl/wMSAPhbnzKqrcQhY8"
	},
  {
    title:"Teléfono",
    description: "+584246248690",
    icon: <Phone className="h-12 w-12 text-primary" />,
    url: "https://api.whatsapp.com/send?phone=584246248690"
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
		<section id="contact" className="w-full py-28 bg-gray-100">
			<div className="max-w-6xl mx-auto text-center">
				<h3 className="text-4xl mb-12 font-bold">Contacto</h3>
				<div className="grid grid-cols-1 lg:grid-cols-3 justify-center gap-12 md:gap-8">
					{contact.map((item, index) => (
						<div className="flex flex-col gap-4 items-center" key={index}>
							{item.icon}
							<h4 className='font-semibold text-4xl font-serif'>{item.title}</h4>
							{item.url ? <Link className='text-lg' target='_blank' href={item.url}>{item.description}</Link> : <p>{item.description}</p>}
						</div>
					))}
				</div>
        <Link href="https://api.whatsapp.com/send?phone=584246248690">
					<Button variant="default" className="shadow-sm border-0 mt-12">
						Reserva tu cita
					</Button>
				</Link>
			</div>
		</section>
	);
};

export default Contact
