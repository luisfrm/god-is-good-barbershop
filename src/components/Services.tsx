import React from 'react'

import { Scissors, BeakerIcon as Beard, SprayCanIcon as Spray } from 'lucide-react'
import H3_Heading from './H3_Heading'

interface Service {
  name: string
  price: string
  description: string
  icon: React.ReactNode
}

const services: Service[] = [
  {
    name: "Corte de Pelo",
    price: "25€",
    description: "Corte personalizado según tu estilo y preferencias.",
    icon: <Scissors className="h-6 w-6" />
  },
  {
    name: "Arreglo de Barba",
    price: "15€",
    description: "Perfilado y cuidado profesional de tu barba.",
    icon: <Beard className="h-6 w-6" />
  },
  {
    name: "Lavado y Peinado",
    price: "10€",
    description: "Lavado con productos premium y peinado a tu gusto.",
    icon: <Spray className="h-6 w-6" />
  }
]

const Services = () => {
  return (
		<section id='services' className="w-full bg-gray-900 py-28">
			<div className="max-w-6xl mx-auto text-center">
				<H3_Heading className='text-white'>Nuestros Servicios</H3_Heading>
				<div className="grid grid-cols-1 lg:grid-cols-3 justify-between items-center gap-10 md:gap-0">
					{services.map((serv, index) => (
						<div className="flex flex-col gap-4 justify-center items-center" key={index}>
							<div className="h-12 w-12 bg-white rounded-full flex justify-center items-center">{serv.icon}</div>
							<h4 className="text-3xl text-white font-bold">{serv.name}</h4>
							<p className='text-white text-sm'>{serv.description}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

export default Services
