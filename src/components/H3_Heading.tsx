import { cn } from '@/lib/utils';
import React from 'react'

const H3_Heading = ({ children, className }: { children: React.ReactNode, className?: string }) => {
	return <h3 className={cn("text-4xl mb-8 font-bold", className)}>{children}</h3>; 
};

export default H3_Heading