/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./App.tsx",
        "./index.tsx"
    ],
    theme: {
        extend: {
            colors: {
                "primary": "#2b8cee",
                "primary-hover": "#1a75d2",
                "background-light": "#f6f7f8",
                "background-dark": "#101922",
                "surface-light": "#FFFFFF",
                "surface-dark": "#1C252E",
                "text-main": "#111418",
                "text-secondary": "#617589",
            },
        },
    },
    plugins: [],
}
