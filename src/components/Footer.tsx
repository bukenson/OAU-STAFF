const footerLinks = [
  {
    title: "University",
    links: [
      { label: "OAU Website", href: "https://oauife.edu.ng/" },
      { label: "E-Portal", href: "https://eportal.oauife.edu.ng/" },
      { label: "Admissions", href: "https://admissions.oauife.edu.ng/" },
      { label: "Student Affairs", href: "#" },
    ],
  },
  {
    title: "Campus Life",
    links: [
      { label: "Academic Life", href: "https://studentlife.oauife.edu.ng/" },
      { label: "Sports Complex", href: "https://sportscomplex.oauife.edu.ng/" },
      { label: "INTECU", href: "https://intecu.oauife.edu.ng/" },
      { label: "Campus Events", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "OAU Library", href: "#" },
      { label: "OAU Alumni", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center font-display font-bold text-accent-foreground text-sm">
                OAU
              </div>
              <span className="font-display text-lg font-semibold tracking-wide">
                Staff Directory
              </span>
            </div>
            <p className="text-primary-foreground/60 text-sm leading-relaxed">
              Obafemi Awolowo University, Ile-Ife, Osun State, Nigeria. 
              Find academic and non-academic staff across all faculties.
            </p>
          </div>

          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="font-display font-semibold text-accent mb-4 text-sm tracking-wide">
                {group.title}
              </h4>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-primary-foreground/60 hover:text-accent transition-colors text-sm"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-primary-foreground/10 mt-12 pt-8 text-center">
          <p className="text-primary-foreground/40 text-sm">
            © {new Date().getFullYear()} Obafemi Awolowo University. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
