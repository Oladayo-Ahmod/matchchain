import { Button } from './components/ui/Button';
import { Link } from './components/ui/Link';
import { Card, CardContent } from './components/ui/Card';
import { JobList } from './jobs/components/JobList';

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center max-w-4xl mx-auto">
            {/* Animated gradient text */}
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="gradient-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-gradient">
                Matchchain
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Where <span className="font-semibold text-blue-600 dark:text-blue-400">AI intelligence</span> meets{' '}
              <span className="font-semibold text-purple-600 dark:text-purple-400">Web3 security</span>.
              The future of hiring is here.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                size="xl" 
                as={Link} 
                href="/jobs"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-xl hover:shadow-2xl hover-lift"
              >
                <span className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>Find Your Dream Job</span>
                </span>
              </Button>
              <Button 
                variant="outline" 
                size="xl" 
                as={Link} 
                href="/post-job"
                className="border-2 border-blue-500/30 hover:border-blue-500/50 bg-white/10 dark:bg-gray-800/10 backdrop-blur-sm hover-lift"
              >
                <span className="flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Post a Job</span>
                </span>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-12">
              {[
                { label: 'AI Matches', value: '1,000+' },
                { label: 'Jobs Filled', value: '500+' },
                { label: 'Avg. Salary', value: '$85k' },
                { label: 'Success Rate', value: '95%' }
              ].map((stat, index) => (
                <Card key={index} variant="glass" className="py-4">
                  <CardContent className="p-0 text-center">
                    <div className="text-2xl md:text-3xl font-bold gradient-text mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {stat.label}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose <span className="gradient-text">AI JobMatch</span>?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Revolutionizing hiring with cutting-edge technology and blockchain security
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              icon: '🤖',
              title: 'AI-Powered Matching',
              description: 'Intelligent algorithms match candidates with perfect opportunities using advanced ML.',
              gradient: 'from-blue-500/20 to-cyan-500/20'
            },
            {
              icon: '🔐',
              title: 'Secure Escrow',
              description: 'Blockchain-powered escrow ensures safe, transparent payments with smart contracts.',
              gradient: 'from-purple-500/20 to-pink-500/20'
            },
            {
              icon: '⚡',
              title: 'Instant Interviews',
              description: 'AI-driven interviews with real-time evaluation and personalized feedback.',
              gradient: 'from-orange-500/20 to-yellow-500/20'
            }
          ].map((feature, index) => (
            <Card 
              key={index} 
              variant="glass" 
              className="p-6 text-center hover-lift group"
            >
              <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <span className="text-2xl">{feature.icon}</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* Featured Jobs */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              Featured <span className="gradient-text">Web3 Jobs</span>
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Discover the latest opportunities in the decentralized ecosystem
            </p>
          </div>
          <Button 
            as={Link} 
            href="/jobs" 
            variant="outline"
            className="border-blue-500/30 hover:border-blue-500/50"
          >
            View All Jobs
          </Button>
        </div>
        
        <JobList />
      </div>
    </>
  );
}