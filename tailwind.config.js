/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './src/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                'kcalculate': {
                    'white': '#FEFEFF',
                    'black': '#010100',
                    'pistachio': '#ABD483',
                    'asparagus': '#8BAA7C',
                    'orange': '#FC842D',
                },
            },
            fontFamily: {
                'sans': ['DM Sans', 'sans-serif'],
                'dmsans': ['DM Sans', 'sans-serif'],
            },
            borderRadius: {
                'xl': '0.75rem',
                '2xl': '1rem',
            },
            boxShadow: {
                'bento': '0 4px 20px rgba(0, 0, 0, 0.08)',
                'bento-hover': '0 10px 30px rgba(0, 0, 0, 0.12)',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in-out',
                'slide-up': 'slideUp 0.5s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },
        },
    },
    plugins: [],
}