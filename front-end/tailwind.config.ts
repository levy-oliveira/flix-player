import type { Config } from 'tailwindcss';

export default {
    theme: {
        extend: {
            colors: {
                primary: '#E8262D',
                'primary-hover': '#C41F25',
                background: '#0A0A0A',
                surface: '#141414',
                'surface-elevated': '#1F1F1F',
                border: '#2A2A2A',
                text: {
                    primary: '#FFFFFF',
                    secondary: '#A3A3A3',
                    muted: '#525252',
                },
                star: '#F5C518',
            },
            fontFamily: {
                display: ['Bebas Neue', 'sans-serif'],
                sans: ['Inter', 'sans-serif'],
            },
            backgroundImage: {
                'gradient-overlay': 'linear-gradient(to top, #0A0A0A 0%, transparent 60%)',
                'gradient-hero': 'linear-gradient(to right, #0A0A0A 30%, transparent 70%)',
            },
        },
    },
} satisfies Config;
