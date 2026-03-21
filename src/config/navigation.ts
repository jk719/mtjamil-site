export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/classes", label: "Classes" },
  { href: "/one-on-one", label: "One-on-One" },
  { href: "/lessons", label: "Lessons" },
  { href: "/whiteboard", label: "Whiteboard" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

// Footer excludes Home and Whiteboard
export const footerLinks = navLinks.filter(
  (link) => link.href !== "/" && link.href !== "/whiteboard"
);
