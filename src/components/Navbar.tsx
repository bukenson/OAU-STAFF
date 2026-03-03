import { useState } from "react";
import { Menu, X, UserPlus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import oauLogo from "@/assets/oaulogo.png";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Staff List", href: "/staff" },
  { label: "Faculties", href: "#faculties" },
  { label: "OAU Website", href: "https://oauife.edu.ng/", external: true },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-primary/95 backdrop-blur-md border-b border-primary-foreground/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-3">
          <img src={oauLogo} alt="OAU Logo" className="w-9 h-9 object-contain" />
          <span className="font-display text-lg font-semibold text-primary-foreground tracking-wide">
            Staff Directory
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) =>
            link.external ? (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-foreground/80 hover:text-accent transition-colors text-sm font-medium tracking-wide"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                to={link.href}
                className="text-primary-foreground/80 hover:text-accent transition-colors text-sm font-medium tracking-wide"
              >
                {link.label}
              </Link>
            )
          )}
          <Link
            to={user ? "/my-profile" : "/auth"}
            className="inline-flex items-center gap-2 bg-accent text-accent-foreground text-sm font-semibold px-4 py-2 rounded-full hover:bg-accent/90 transition-colors"
          >
            <UserPlus size={16} />
            {user ? "My Profile" : "Sign In"}
          </Link>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-primary-foreground"
          aria-label="Toggle menu"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-primary overflow-hidden"
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) =>
                link.external ? (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setOpen(false)}
                    className="block text-primary-foreground/80 hover:text-accent transition-colors text-sm font-medium py-2"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.label}
                    to={link.href}
                    onClick={() => setOpen(false)}
                    className="block text-primary-foreground/80 hover:text-accent transition-colors text-sm font-medium py-2"
                  >
                    {link.label}
                  </Link>
                )
              )}
              <Link
                to={user ? "/my-profile" : "/auth"}
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-2 bg-accent text-accent-foreground text-sm font-semibold px-4 py-2 rounded-full"
              >
                <UserPlus size={16} />
                {user ? "My Profile" : "Sign In"}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
