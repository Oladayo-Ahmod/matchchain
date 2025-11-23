export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI JobMatch
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              The future of Web3 hiring
            </p>
          </div>
          
          <div className="flex space-x-6">
            <a 
              href="#" 
              className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              Terms
            </a>
            <a 
              href="#" 
              className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              Privacy
            </a>
            <a 
              href="#" 
              className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              Contact
            </a>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            © 2024 AI JobMatch. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}