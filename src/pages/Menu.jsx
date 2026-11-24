import { useState, useEffect } from "react";
import { useCategories, useProducts } from "@/hooks/use-cafe";
import { useAuth } from "@/hooks/use-auth";
import { ProductCard } from "@/components/ProductCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Utensils, QrCode } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function Menu() {
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { tableNumber, setTable, clearTable, user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Check if ?table=X is in query string
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tableParam = params.get("table");
      if (tableParam) {
        setTable(tableParam);
      }
    }
  }, [setTable]);

  // In a real app, you might want to fetch products based on selected category ID
  // For now, we'll fetch all and filter client side if the API supports it, or use the hook param
  const categoryIdParam = selectedCategory === "all" ? undefined : selectedCategory;
  const { data: products, isLoading: productsLoading } = useProducts(categoryIdParam);

  const filteredProducts = (Array.isArray(products) ? products : []).filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Table Banner if active */}
        {tableNumber && (
          <div className="max-w-xl mx-auto mb-8 p-3.5 bg-primary/10 border border-primary/25 rounded-2xl flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center font-display text-base">
                #{tableNumber}
              </span>
              <div>
                <p className="font-bold text-foreground">Ordering for Table #{tableNumber}</p>
                <p className="text-muted-foreground text-[11px]">
                  {user?.name ? `Logged in as ${user.name}` : "Log in at checkout to confirm"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearTable}
                className="h-7 text-xs text-muted-foreground hover:text-destructive font-semibold"
              >
                Clear Table
              </Button>
            </div>
          </div>
        )}

        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="font-display text-5xl font-bold mb-4 text-primary">Our Menu</h1>
          <p className="text-muted-foreground text-lg">
            Explore our curated selection of fine coffees, artisanal teas, and delicious bites.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-10">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Search for coffee, snacks..." 
              className="pl-10 h-12 rounded-xl bg-card border-border/60 focus:border-primary/50 focus:ring-primary/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Categories Tabs */}
        {categoriesLoading ? (
          <div className="h-12 w-full bg-muted rounded-xl animate-pulse mb-8" />
        ) : (
          <Tabs 
            defaultValue="all" 
            value={selectedCategory} 
            onValueChange={setSelectedCategory} 
            className="mb-12"
          >
            <TabsList className="w-full flex flex-wrap h-auto bg-transparent gap-2 justify-center p-0">
              <TabsTrigger 
                value="all"
                className="rounded-full px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground bg-secondary/10 hover:bg-secondary/20 transition-all border border-transparent data-[state=active]:shadow-md"
              >
                All Items
              </TabsTrigger>
              {categories?.map((cat) => (
                <TabsTrigger 
                  key={cat.id} 
                  value={String(cat.id)}
                  className="rounded-full px-6 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground bg-secondary/10 hover:bg-secondary/20 transition-all border border-transparent data-[state=active]:shadow-md"
                >
                  {cat.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        )}

        {/* Products Grid */}
        {productsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-80 bg-muted rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {filteredProducts?.length === 0 ? (
              <div className="col-span-full text-center py-20 text-muted-foreground">
                No items found. Try a different search.
              </div>
            ) : (
              filteredProducts?.map((product) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  key={product.id}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}