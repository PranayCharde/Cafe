import { motion } from "framer-motion";

const IMAGES = [
  { url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2047&auto=format&fit=crop", category: "Interior", caption: "Cozy Corners" },
  { url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2070&auto=format&fit=crop", category: "Food", caption: "Artisanal Coffee" },
  { url: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?q=80&w=2020&auto=format&fit=crop", category: "Food", caption: "Breakfast Platter" },
  { url: "https://images.unsplash.com/photo-1481833761820-0509d3217039?q=80&w=2070&auto=format&fit=crop", category: "Food", caption: "Fresh Croissants" },
  { url: "https://images.unsplash.com/photo-1463797221720-6b07e6426c24?q=80&w=2071&auto=format&fit=crop", category: "Interior", caption: "Outdoor Seating" },
];

export default function Gallery() {
  return (
    <div className="min-h-screen pt-24 pb-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="font-display text-5xl font-bold mb-4 text-primary">Our Gallery</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A glimpse into the ambiance, the food, and the moments we cherish.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {IMAGES.map((img, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group relative h-80 rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition-all"
            >
              <img 
                src={img.url} 
                alt={img.caption} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <span className="text-accent text-sm font-bold tracking-wider uppercase mb-1">{img.category}</span>
                <h3 className="text-white font-display text-2xl font-bold">{img.caption}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}