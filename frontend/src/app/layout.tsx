"use client";
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { FirebaseProvider } from '@/context/Firebase';
import { MenuIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useFirebase } from '@/context/Firebase';
import { useRouter } from 'next/navigation'

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <FirebaseProvider>
      <html lang="en">
        <body className={inter.className}>
          <Navbar />
          {children}
        </body>
      </html>
    </FirebaseProvider>
  );
}

const Navbar = () => {
  const firebase = useFirebase();
  const router = useRouter();

  const signOut = async () => {
    await firebase.signOutUser();
    router.push("/");
  };

  return (
    <nav className="flex items-center justify-between p-4 bg-background">
      <div className="flex items-center space-x-2">
        <Image src="https://i.pinimg.com/564x/b9/41/92/b94192b51d1d5c71301b942f53bbce21.jpg" alt="Logo" width={40} height={40} />
        <span className="text-xl font-bold">Nutrify</span>
      </div>
      <div className="hidden md:flex space-x-4">
        {firebase.isLoggedIn ? (
          <Button
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            onClick={signOut}
          >
            Log Out
            
          </Button>
        ) : (
          <>
            <Link href="/login" passHref>
              <button className="border border-gray-700 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-100">
                Log In
              </button>
            </Link>
            <Link href="/signup" passHref>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Sign Up
              </button>
            </Link>
          </>
        )}
      </div>
      <Button variant="ghost" size="icon" className="md:hidden">
        <MenuIcon className="h-6 w-6" />
      </Button>
    </nav>
  );
};
