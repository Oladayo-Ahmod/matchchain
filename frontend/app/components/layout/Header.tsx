'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '../ui/Button';
import { Link } from '../ui/Link';

export function Header() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  return (
    <header className="border-b border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link href="/" variant="ghost" className="text-xl font-bold">
              AI JobMatch
            </Link>
            
            <nav className="hidden md:flex space-x-6">
              <Link href="/jobs" variant="ghost">
                Jobs
              </Link>
              <Link href="/post-job" variant="ghost">
                Post Job
              </Link>
              <Link href="/applications" variant="ghost">
                My Applications
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {isConnected ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => disconnect()}
                >
                  Disconnect
                </Button>
              </div>
            ) : (
               <ConnectButton 
                showBalance={false}
                chainStatus="icon"
                accountStatus="full"
              />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}