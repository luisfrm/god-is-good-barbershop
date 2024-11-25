import React from 'react'
import Image from 'next/image'
import H3_Heading from './H3_Heading';

interface About {
  title: string;
  description: string[];
}

const about: About = {
  title: "Sobre Nosotros",
  description: [
    "Con más de 5 años de experiencia, nuestro equipo de barberos expertos se dedica a proporcionar cortes de pelo y servicios de barbería de la más alta calidad. Nos enorgullecemos de crear un ambiente acogedor y profesional donde cada cliente se sienta valorado y atendido.",
    "Utilizamos técnicas modernas y productos de primera calidad para asegurar que cada visita a nuestra barbería sea una experiencia excepcional. Ya sea que busques un corte clásico o un estilo moderno, estamos aquí para ayudarte a lucir y sentirte lo mejor posible."
  ]
}

const About = () => {
  return (
		<section id="about" className="bg-white py-20">
			<div className="max-w-6xl mx-auto">
				<div className="flex flex-col md:flex-row items-center gap-10">
					<div className="md:w-1/2">
						<Image
							src="https://res.cloudinary.com/dw4ecbwo9/image/upload/c_pad,b_gen_fill,w_684,h_684,ar_1:1/v1732254554/photo-1605497788044-5a32c7078486-compress_l4cbk7.webp"
							alt="Barber photo"
							height={684}
							width={684}
							className='aspect-square'
							priority={false}
						/>
					</div>
					<div className="px-5 md:px-0 md:w-1/2">
						<H3_Heading>{about.title}</H3_Heading>
						{about.description.map((desc, index) => (
							<p className={`text-lg text-pretty ${index == 0 && "mb-4"}`} key={index}>
								{desc}
							</p>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}

export default About