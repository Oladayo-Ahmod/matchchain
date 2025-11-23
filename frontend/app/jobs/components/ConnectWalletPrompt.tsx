'use client';

import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useConnect } from 'wagmi';

export function ConnectWalletPrompt() {
  const { connect, connectors } = useConnect();

  return (
    <Card variant="elevated">
      <CardContent className="text-center py-12">
        <div className="max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Connect Your Wallet
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Connect your wallet to access job applications, post new opportunities, and manage your profile.
          </p>
          <Button
            onClick={() => connect({ connector: connectors[0] })}
            size="lg"
          >
            Connect MetaMask
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}