import { Button } from "../../components/ui/button";
import { Home, FolderOpen, Map, FileText, User, MessageCircle } from "lucide-react";
import { Link, useLocation } from "wouter";

export function MobileNav() {
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: <Home className="h-5 w-5" />, label: "Start" },
    { href: "/projects", icon: <FolderOpen className="h-5 w-5" />, label: "Projekte" },
    { href: "/maps", icon: <Map className="h-5 w-5" />, label: "Karte" },
    { href: "/support", icon: <MessageCircle className="h-5 w-5" />, label: "Support" },
    { href: "/profile", icon: <User className="h-5 w-5" />, label: "Profil" },
  ];

  const isActive = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <Button
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center py-2 px-3 text-xs h-auto ${
                isActive(item.href)
                  ? "text-green-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="mb-1">{item.icon}</div>
              <span>{item.label}</span>
            </Button>
          </Link>
        ))}
      </div>
    </nav>
  );
}
