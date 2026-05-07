'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function FloatingPaths({ position, className }: { position: number, className?: string }) {
	const paths = Array.from({ length: 16 }, (_, i) => ({
		id: i,
		d: `M-${380 - i * 12 * position} -${189 + i * 15}C-${
			380 - i * 12 * position
		} -${189 + i * 15} -${312 - i * 12 * position} ${216 - i * 15} ${
			152 - i * 12 * position
		} ${343 - i * 15}C${616 - i * 12 * position} ${470 - i * 15} ${
			684 - i * 12 * position
		} ${875 - i * 15} ${684 - i * 12 * position} ${875 - i * 15}`,
		color: `rgba(15,23,42,${0.1 + i * 0.05})`,
		width: 0.5 + i * 0.05,
	}));

	return (
		<div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
			<svg
				className="h-full w-full"
				viewBox="0 0 696 316"
				fill="none"
				preserveAspectRatio="none"
			>
				<title>Background Paths</title>
				{paths.map((path) => (
					<motion.path
						key={path.id}
						d={path.d}
						stroke="currentColor"
						strokeWidth={path.width}
						strokeOpacity={0.1 + path.id * 0.03}
						initial={{ pathLength: 0.3, opacity: 0.6 }}
						animate={{
							pathLength: 1,
							opacity: [0.3, 0.6, 0.3],
							pathOffset: [0, 1, 0],
						}}
						transition={{
							duration: 20 + Math.random() * 10,
							repeat: Number.POSITIVE_INFINITY,
							ease: 'linear',
						}}
					/>
				))}
			</svg>
		</div>
	);
}
