import tailwindTypography from "@tailwindcss/typography";
import daisyui from "daisyui";

const colors = {
	light: {
		green: "hsl(125deg 100% 25%)",
		blue: "hsl(200deg 100% 32%)",
		purple: "hsl(275deg 100% 32%)",
	},
	dark: {
		green: "hsl(125deg 80% 75%)",
		blue: "hsl(200deg 80% 75%)",
		purple: "hsl(275deg 80% 75%)",
	},
	grey: (opacity: number) => `hsl(0deg 0% ${opacity}%)`,
	info: "hsl(200deg 100% 50%)",
	success: "hsl(160deg 100% 35%)",
	warning: "hsl(40deg 100% 50%)",
	error: "hsl(0deg 100% 65%)",
};

/** @type {import('tailwindcss').Config} */
export default {
	content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
	theme: {
		extend: {},
	},
	darkMode: ["selector", '[data-theme="dark"]'],
	plugins: [tailwindTypography, daisyui],
	daisyui: {
		themes: [
			{
				light: {
					primary: colors.light.green,
					secondary: colors.light.blue,
					accent: colors.light.purple,
					"base-100": colors.grey(90),
					"base-200": colors.grey(80),
					"base-300": colors.grey(70),
					"primary-content": colors.grey(10),
					"secondary-content": colors.grey(10),
					"accent-content": colors.grey(10),
					"base-content": colors.grey(10),
					neutral: colors.grey(25),
					"neutral-content": colors.grey(90),
					info: colors.info,
					success: colors.success,
					warning: colors.warning,
					error: colors.error,
					"info-content": colors.grey(10),
					"success-content": colors.grey(10),
					"warning-content": colors.grey(10),
					"error-content": colors.grey(10),
				},
				dark: {
					primary: colors.dark.green,
					secondary: colors.dark.blue,
					accent: colors.dark.purple,
					"base-100": colors.grey(10),
					"base-200": colors.grey(20),
					"base-300": colors.grey(30),
					"primary-content": colors.grey(90),
					"secondary-content": colors.grey(90),
					"accent-content": colors.grey(90),
					"base-content": colors.grey(90),
					neutral: colors.grey(75),
					"neutral-content": colors.grey(90),
					info: colors.info,
					success: colors.success,
					warning: colors.warning,
					error: colors.error,
					"info-content": colors.grey(10),
					"success-content": colors.grey(10),
					"warning-content": colors.grey(10),
					"error-content": colors.grey(10),
				},
			},
		],
	},
};
