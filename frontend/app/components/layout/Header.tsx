'use client';

import { useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from '../ui/Button';
import { Link } from '../ui/Link';

export function Header() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="container mx-auto px-4 py-4">
        <nav className="glass-card rounded-2xl p-3 shadow-lg">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">AI</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
              </div>
              <Link href="/" variant="ghost" className="text-xl font-bold gradient-text">
                Matchchain
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              <Link href="/jobs" variant="ghost" className="px-4 py-2 rounded-lg hover:bg-white/10 transition-all">
                <span className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Jobs</span>
                </span>
              </Link>
              
              <Link href="/post-job" variant="ghost" className="px-4 py-2 rounded-lg hover:bg-white/10 transition-all">
                <span className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Post Job</span>
                </span>
              </Link>
              
              <Link href="/applications" variant="ghost" className="px-4 py-2 rounded-lg hover:bg-white/10 transition-all">
                <span className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Applications</span>
                </span>
              </Link>
            </div>

            {/* Custom ConnectButton */}
            <div className="flex items-center space-x-3">
              <ConnectButton.Custom>
                {({
                  account,
                  chain,
                  openAccountModal,
                  openChainModal,
                  openConnectModal,
                  authenticationStatus,
                  mounted,
                }) => {
                  const ready = mounted && authenticationStatus !== 'loading';
                  const connected = ready && account && chain && (!authenticationStatus || authenticationStatus === 'authenticated');

                  return (
                    <div
                      {...(!ready && {
                        'aria-hidden': true,
                        'style': {
                          opacity: 0,
                          pointerEvents: 'none',
                          userSelect: 'none',
                        },
                      })}
                    >
                      {(() => {
                        if (!connected) {
                          return (
                            <Button
                              onClick={openConnectModal}
                              size="sm"
                              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-lg hover:shadow-xl transition-all hover-lift"
                            >
                              <span className="flex items-center space-x-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                <span>Connect Wallet</span>
                              </span>
                            </Button>
                          );
                        }

                        if (chain.unsupported) {
                          return (
                            <Button
                              onClick={openChainModal}
                              size="sm"
                              className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 border-0 shadow-lg"
                            >
                              <span className="flex items-center space-x-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <span>Wrong Network</span>
                              </span>
                            </Button>
                          );
                        }

                        return (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={openChainModal}
                              className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 transition-all"
                            >
                              {chain.hasIcon && chain.iconUrl && (
                                <img
                                  alt={chain.name ?? 'Chain icon'}
                                  src={chain.iconUrl}
                                  className="w-4 h-4 rounded-full"
                                />
                              )}
                              <span className="text-sm font-medium">
                                {chain.name}
                              </span>
                            </button>

                            <button
                              onClick={openAccountModal}
                              className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 hover:from-blue-500/20 hover:to-purple-500/20 transition-all"
                            >
                              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                              <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                {account.displayName}
                              </span>
                            </button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={openAccountModal}
                              className="border border-glass-border hover:border-blue-500/30 transition-all"
                            >
                              <span className="flex items-center space-x-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A7 7 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Account</span>
                              </span>
                            </Button>
                          </div>
                        );
                      })()}
                    </div>
                  );
                }}
              </ConnectButton.Custom>
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-3 pt-3 border-t border-glass-border">
              <div className="flex flex-col space-y-2">
                <Link href="/jobs" variant="ghost" className="px-3 py-2 rounded-lg hover:bg-white/10">
                  Jobs
                </Link>
                <Link href="/post-job" variant="ghost" className="px-3 py-2 rounded-lg hover:bg-white/10">
                  Post Job
                </Link>
                <Link href="/applications" variant="ghost" className="px-3 py-2 rounded-lg hover:bg-white/10">
                  Applications
                </Link>
              </div>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}