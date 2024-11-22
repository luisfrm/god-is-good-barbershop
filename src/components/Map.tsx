import Image from 'next/image'
import React from 'react'

const Map = () => {
  return (
		<section className="w-full">
			<Image
				src="https://res.cloudinary.com/dw4ecbwo9/image/upload/v1732262666/Screenshot_2024-11-22_040245-compress_gru3tp.webp"
				alt="Barber photo"
				sizes="100vw"
        width={1900}
        height={450}
				className="w-100"
				priority={false}
			/>
		</section>
	);
}

export default Map