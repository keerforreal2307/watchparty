import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Afterglow — A good film. Better company.',description:'Your people. One screen. Discover open films and watch in sync with shared queues, chat, reactions and polls.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>;}
