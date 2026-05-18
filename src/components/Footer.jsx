import { Link } from "wouter";
import { Coffee, Facebook, Instagram, MapPin, Phone, Twitter } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-foreground text-primary-foreground/90 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-primary/20">
                <Coffee className="w-6 h-6 text-primary" />
              </div>
              <span className="font-display text-2xl font-bold text-white">
                Bean & Brew
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-400">
              Crafting moments of joy, one cup at a time. We source the finest beans and fresh ingredients to serve you happiness on a plate.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="#" className="p-2 rounded-full bg-white/5 hover:bg-primary hover:text-white transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-full bg-white/5 hover:bg-primary hover:text-white transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-full bg-white/5 hover:bg-primary hover:text-white transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display text-xl font-bold text-white mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link href="/menu" className="text-sm text-gray-400 hover:text-primary transition-colors">Full Menu</Link></li>
              <li><Link href="/reservation" className="text-sm text-gray-400 hover:text-primary transition-colors">Book a Table</Link></li>
              <li><Link href="/gallery" className="text-sm text-gray-400 hover:text-primary transition-colors">Gallery</Link></li>
              <li><Link href="/about" className="text-sm text-gray-400 hover:text-primary transition-colors">Our Story</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display text-xl font-bold text-white mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <span>123 Coffee Street, Flavor Town,<br />NY 10012, USA</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h3 className="font-display text-xl font-bold text-white mb-6">Opening Hours</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex justify-between">
                <span>Mon - Fri</span>
                <span className="text-white">8:00 AM - 10:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Saturday</span>
                <span className="text-white">9:00 AM - 11:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Sunday</span>
                <span className="text-white">9:00 AM - 9:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Bean & Brew Cafe. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}