'use client';

import { MapPin, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-muted/50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* About Section */}
          <div>
            <h3 className="mb-3 text-lg font-semibold">About Us</h3>
            <p className="text-sm text-muted-foreground">
              Discover the best local clothing shops in Abu Hommos, Egypt. Support local businesses and find quality fashion near you.
            </p>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="mb-3 text-lg font-semibold">Contact</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Abu Hommos, Egypt</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>info@abuhommos-marketplace.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+20 123 456 7890</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-3 text-lg font-semibold">Quick Links</h3>
            <div className="space-y-2 text-sm">
              <Button variant="link" className="h-auto p-0">
                Browse Shops
              </Button>
              <Button variant="link" className="h-auto p-0">
                Categories
              </Button>
              <Button variant="link" className="h-auto p-0">
                Contact Us
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-6 border-t pt-6 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Abu Hommos Marketplace. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
