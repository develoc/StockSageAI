import { Link } from "wouter";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-quantum-gray border-t border-quantum-accent/10 mt-auto">
      <div className="container mx-auto py-6 px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-quantum-text-secondary">
              &copy; {currentYear} Quantum Trade. All rights reserved.
            </p>
          </div>
          <div className="flex space-x-6">
            <Link href="/privacy-policy" className="text-sm text-quantum-text-secondary hover:text-quantum-accent">
              Privacy Policy
            </Link>
            <Link href="/terms-and-conditions" className="text-sm text-quantum-text-secondary hover:text-quantum-accent">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
