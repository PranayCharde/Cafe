import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { Plus, Flame, Leaf } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ProductCard({ product }) {
  const addItem = useCart((state) => state.addItem);
  const { toast } = useToast();

  const handleAddToCart = () => {
    addItem(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
      duration: 2000,
    });
  };

  return (
    <div className="group bg-card rounded-2xl overflow-hidden shadow-sm border border-border/50 hover:shadow-lg hover:border-primary/20 transition-all duration-300 flex flex-col h-full">
      <div className="relative h-48 overflow-hidden bg-muted">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground bg-secondary/10">
            No Image
          </div>
        )}
        
        {/* Badges */}
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
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary transition-colors">
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
          className="w-full rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
          disabled={!product.available}
        >
          {product.available ? (
            <>
              <Plus className="w-4 h-4 mr-2" /> Add to Cart
            </>
          ) : (
            "Sold Out"
          )}
        </Button>
      </div>
    </div>
  );
}