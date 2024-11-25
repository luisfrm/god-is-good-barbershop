import React from 'react'

const Logo = ({children}: {children: React.ReactNode}) => {
  return (
		<h2 className="text-5xl md:text-7xl font-bold mb-4 text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] text-balance">
			{children}
		</h2>
	);
}

export default Logo