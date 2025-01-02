"use client";

import "./globals.css";
import {
  ClerkProvider,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import Credits from "./components/Credits";
import { AppContextProvider } from "./AppContext";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AppContextProvider>
      <ClerkProvider>
        <html lang='en'>
          <body className={`antialiased`}>
            <div className='flex justify-end'>
              <div className='pr-6 pt-6 pl-5 pb-4 rounded-bl-[2rem] border-l-8 border-b-8 font-bold hover:animate-pulse'>
                <SignedOut>
                  <SignInButton />
                </SignedOut>
                <SignedIn>
                  <UserButton />
                </SignedIn>
                <Credits />
              </div>
            </div>
            {children}
          </body>
        </html>
      </ClerkProvider>
    </AppContextProvider>
  );
}
