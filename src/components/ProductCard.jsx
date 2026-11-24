import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { Plus, Flame, Leaf, Ban, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ProductCard({ product }) {
  const addItem = useCart((state) => state.addItem);
  const { toast } = useToast();
  const isAvailable = product.available !== false;

  const handleAddToCart = () => {
    if (!isAvailable) {
      toast({
        title: "Item Unavailable",
        description: `${product.name} is currently sold out and cannot be made.`,
        variant: "destructive",
      });
      return;
    }

    addItem(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
      duration: 2000,
    });
  };

  return (
    <div className={`group bg-card rounded-2xl overflow-hidden shadow-sm border transition-all duration-300 flex flex-col h-full ${
      isAvailable ? 'border-border/50 hover:shadow-lg hover:border-primary/20' : 'border-destructive/30 bg-muted/30'
    }`}>
      <div className="relative h-48 overflow-hidden bg-muted">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              !isAvailable ? 'grayscale opacity-60' : ''
            }`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-secondary/10">
            No Image
          </div>
        )}

        {/* Dietary & Spicy Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {product.isVeg ? (
            <span className="bg-green-500/90 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <Leaf className="w-3 h-3" /> VEG
            </span>
          ) : (
            <span className="bg-red-500/90 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
              NON-VEG
            </span>
          )}
          {product.isSpicy && (
            <span className="bg-orange-500/90 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <Flame className="w-3 h-3" /> SPICY
            </span>
          )}
        </div>

        {/* Unavailable Banner Overlay */}
        {!isAvailable && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-3 text-center">
            <span className="px-3 py-1 rounded-full bg-rose-600 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-lg animate-pulse">
              <Ban className="w-3.5 h-3.5" />
              Unavailable
            </span>
            <span className="text-[11px] text-rose-200 mt-1.5 font-medium max-w-[85%] leading-tight">
              {product.availabilityNote || "Sold out & cannot be made at this time"}
            </span>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className={`font-display text-lg font-bold transition-colors ${
            isAvailable ? 'text-foreground group-hover:text-primary' : 'text-muted-foreground'
          }`}>
            {product.name}
          </h3>
          <span className="font-bold text-primary text-lg">
            ₹{Number(product.price).toFixed(2)}
          </span>
        </div>
        
        <p className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-2 flex-grow">
          {product.description}
        </p>

        <Button 
          onClick={handleAddToCart}
          className={`w-full rounded-xl shadow-md transition-all ${
            isAvailable
              ? 'bg-secondary text-secondary-foreground hover:bg-secondary/90 hover:shadow-lg active:scale-[0.98]'
              : 'bg-muted text-muted-foreground cursor-not-allowed opacity-75'
          }`}
          disabled={!isAvailable}
        >
          {isAvailable ? (
            <>
              <Plus className="w-4 h-4 mr-2" /> Add to Cart
            </>
          ) : (
            <span className="flex items-center gap-1.5">
              <Ban className="w-4 h-4 text-rose-500" />
              <span>Sold Out / Unavailable</span>
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
