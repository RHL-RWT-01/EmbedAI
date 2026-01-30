import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';
import CopilotWidget from '@/components/CopilotWidget';
const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
    title: 'Embed - AI Chat Widget for Your Software',
    description: 'Manage your embeddable AI chat copilot for software products',
    icons: {
        icon: '/favicon.ico',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className={inter.variable}>
            <body className="bg-zinc-950 text-white antialiased">
                {children}
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: '#1f2937',
                            color: '#f9fafb',
                            borderRadius: '8px',
                        },
                        success: {
                            iconTheme: {
                                primary: '#10b981',
                                secondary: '#f9fafb',
                            },
                        },
                        error: {
                            iconTheme: {
                                primary: '#ef4444',
                                secondary: '#f9fafb',
                            },
                        },
                    }}
                />
                <CopilotWidget />
            </body>
        </html>
    );
}
