import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useProducts, useReviews } from "@/hooks/use-cafe";
import { ProductCard } from "@/components/ProductCard";
import { ArrowRight, Clock, MapPin, Star, Wifi, ShieldCheck, DollarSign, QrCode } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { motion } from "framer-motion";

export default function Home() {
  const { data: popularProducts, isLoading: productsLoading } = useProducts(undefined, true);
  const { data: reviews, isLoading: reviewsLoading } = useReviews();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          {/* Unsplash: Coffee shop interior cozy warm lighting */}
          <img 
            src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=2078&auto=format&fit=crop" 
            alt="Cafe Interior" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30" />
        </div>

        <div className="container relative z-10 text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 drop-shadow-lg">
              Bean & Brew
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto font-light leading-relaxed">
              Where every cup tells a story and every bite feels like home.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/menu">
                <Button size="lg" className="text-lg px-8 py-6 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-xl hover:translate-y-[-2px] transition-all">
                  Order Online
                </Button>
              </Link>
              <Link href="/reservation">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-full border-white/30 text-white hover:bg-white/10 backdrop-blur-sm shadow-xl hover:translate-y-[-2px] transition-all">
                  Book a Table
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: QrCode, title: "QR Table Ordering", desc: "Scan your table QR code, log in, and get served." },
              { icon: FaWhatsapp, title: "WhatsApp Updates", desc: "Order confirmation and instant waiter support." },
              { icon: ShieldCheck, title: "Fresh Ingredients", desc: "Locally sourced, organic and artisan produce." },
              { icon: Clock, title: "Fast Table Service", desc: "Served hot and fresh to your seat in minutes." },
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-card p-8 rounded-3xl border border-border/50 shadow-sm hover:shadow-lg transition-all text-center group"
              >
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  <item.icon className="w-8 h-8 text-primary group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-display text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Items */}
      <section className="py-24 bg-secondary/5">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="text-primary font-bold tracking-wider uppercase text-sm">Customer Favorites</span>
              <h2 className="font-display text-4xl font-bold mt-2">Popular Hits</h2>
            </div>
            <Link href="/menu">
              <Button variant="ghost" className="text-primary gap-2">
                View Full Menu <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-80 bg-muted rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularProducts?.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Reviews Preview */}
      <section className="py-24 bg-background overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold mb-4">What People Say</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Don't just take our word for it. Here's what our community thinks about their Bean & Brew experience.
            </p>
          </div>

          <div className="relative">
            <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
              {reviewsLoading ? (
                <div className="w-full text-center py-10">Loading reviews...</div>
              ) : (
                reviews?.slice(0, 5).map((review) => (
                  <div 
                    key={review.id} 
                    className="min-w-[300px] md:min-w-[400px] bg-card p-8 rounded-3xl border border-border shadow-sm snap-center"
                  >
                    <div className="flex gap-1 mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-4 h-4 ${i < review.rating ? "fill-accent text-accent" : "text-muted"}`} 
                        />
                      ))}
                    </div>
                    <p className="text-foreground/80 italic mb-6 leading-relaxed">"{review.message}"</p>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                        {review.name[0]}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">{review.name}</h4>
                        <p className="text-xs text-muted-foreground">{review.city || "Happy Customer"}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Location Preview (Static) */}
      <section className="h-[400px] relative bg-neutral-900 flex items-center justify-center">
         {/* Unsplash: Map flat lay or coffee beans map */}
         <img 
          src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop"
          alt="Map Background"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="relative z-10 bg-card p-10 rounded-3xl shadow-2xl max-w-md w-full mx-4 text-center">
          <MapPin className="w-10 h-10 text-primary mx-auto mb-4" />
          <h2 className="font-display text-3xl font-bold mb-2">Visit Us</h2>
          <p className="text-muted-foreground mb-6">123 Coffee Street, Flavor Town, NY 10012</p>
          <div className="space-y-2 text-sm font-medium">
            <p>Mon - Fri: 8am - 10pm</p>
            <p>Sat - Sun: 9am - 11pm</p>
          </div>
          <Link href="/contact">
            <Button className="mt-8 w-full rounded-xl">Get Directions</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}