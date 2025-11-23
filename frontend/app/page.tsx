import { Button } from './components/ui/Button';
import { Card, CardContent, CardHeader } from './components/ui/Card';
import { Link } from './components/ui/Link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-6">
            AI JobMatch
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            The future of Web3 hiring is here. AI-powered job matching with secure escrow payments on Polygon.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="xl" as={Link} href="/jobs">
              Find Jobs
            </Button>
            <Button variant="outline" size="xl" as={Link} href="/post-job">
              Post a Job
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card variant="elevated">
            <CardHeader>
              <h3 className="text-2xl font-semibold">AI Matching</h3>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                Intelligent job-candidate matching powered by advanced LLMs. Get personalized interview questions and evaluations.
              </p>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <h3 className="text-2xl font-semibold">Secure Escrow</h3>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                Built on Polygon with secure smart contract escrow. Funds are protected until work is completed and verified.
              </p>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <h3 className="text-2xl font-semibold">Web3 Native</h3>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 dark:text-gray-300">
                True ownership of your professional identity. Connect your wallet and start working in the decentralized economy.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}