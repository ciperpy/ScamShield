/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        saas: {
          bg: '#F7F9FC',
          surface: '#FFFFFF',
          secondary: '#F1F5F9',
          text: '#0F172A',
          muted: '#475569',
          subtle: '#64748B',
          border: '#E2E8F0',
          'border-dark': '#CBD5E1',
          blue: '#2563EB',
          'blue-hover': '#1D4ED8',
          'blue-light': '#EFF6FF',
          success: '#16A34A',
          'success-bg': '#F0FDF4',
          warning: '#D97706',
          'warning-bg': '#FFFBEB',
          danger: '#DC2626',
          'danger-bg': '#FEF2F2',
          critical: '#B91C1C'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
      },
      boxShadow: {
        'saas-card': '0 10px 35px rgba(15, 23, 42, 0.08)',
        'saas-sm': '0 2px 8px 0 rgba(15, 23, 42, 0.04)',
        'saas-focus': '0 0 0 3px rgba(37, 99, 235, 0.15)',
      }
    },
  },
  plugins: [],
}
