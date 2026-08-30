"use client";

import { useState, useEffect } from "react";
import { PRODUCTS } from "@/data/products";
import { useCart } from "@/context/CartContext";

const BANNERS = [
  "/images/banner1.jpg",
  "/images/banner2.jpg",
  "/images/banner3.jpg",
];

export default function Home() {
  const {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    subtotal,
    tax,
    shipping,
    total,
  } = useCart();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  // Checkout Form State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zip: "",
    paymentMethod: "cod",
  });

  // Auto-slide banner carousel every 4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BANNERS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % BANNERS.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + BANNERS.length) % BANNERS.length);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePaymentMethodChange = (method: "cod" | "online") => {
    setFormData({ ...formData, paymentMethod: method });
  };

  // Submit billing & complete order via Backend API
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart,
          customer: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: `${formData.address}, ${formData.city} ${formData.zip}`,
          },
          payment: {
            method: formData.paymentMethod,
          },
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setOrderSuccess(data);
        clearCart();
      } else {
        alert(data.error || "Payment failed. Please try again.");
      }
    } catch (err) {
      alert("Failed to connect to the backend server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter products dynamically based on search query
  const filteredProducts = PRODUCTS.filter((product) => {
    const query = searchQuery.toLowerCase();
    const matchesName = product.name.toLowerCase().includes(query);
    const matchesTagline = product.tagline.toLowerCase().includes(query);
    const matchesIngredients = product.ingredients.some((ing) =>
      ing.toLowerCase().includes(query)
    );
    return matchesName || matchesTagline || matchesIngredients;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] text-slate-800 font-sans">
      {/* Top Announcement Bar */}
      <div className="bg-emerald-950 text-emerald-100 text-xs py-2 px-4 text-center font-medium tracking-wide">
        🌿 Complimentary shipping on all botanical bundle orders over Rs. 2000
      </div>

      {/* Main Navbar */}
      <header className="border-b border-stone-200 bg-white/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <a href="#" className="text-2xl font-serif font-bold text-emerald-900 tracking-wide hover:opacity-90 transition-opacity">
              EcoGleam
            </a>
            
            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
              <button 
                onClick={() => {
                  setSearchQuery("");
                  document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="hover:text-emerald-800 transition-colors"
              >
                Shop All
              </button>
              <a href="#ingredients" className="hover:text-emerald-800 transition-colors">
                Ingredients
              </a>
              <a href="#contact" className="hover:text-emerald-800 transition-colors">
                Contact
              </a>
            </nav>
          </div>

          {/* Right Utilities (Search & Cart) */}
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="flex items-center bg-stone-100 rounded-full px-3 py-1.5 border border-stone-200 text-xs w-44 sm:w-56 focus-within:border-emerald-700 transition-all">
              <svg className="w-4 h-4 text-stone-400 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search soaps or ingredients..." 
                className="bg-transparent outline-none w-full text-stone-700 placeholder-stone-400"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-stone-400 hover:text-stone-600 ml-1 font-bold">
                  ✕
                </button>
              )}
            </div>

            {/* Shopping Cart Drawer Toggle Button */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-stone-600 hover:text-emerald-800 hover:bg-stone-100 rounded-full transition-colors"
              aria-label="Open Cart"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-emerald-800 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Banner Carousel */}
        <section className="max-w-6xl mx-auto px-6 pt-6">
          <div className="relative w-full aspect-[2/1] sm:aspect-[2.4/1] rounded-2xl overflow-hidden shadow-md border border-stone-200 bg-[#faf8f5] group">
            {BANNERS.map((banner, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              >
                <img
                  src={banner}
                  alt={`EcoGleam Banner ${index + 1}`}
                  className="w-full h-full object-cover object-center"
                />
              </div>
            ))}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
            >
              ❮
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white p-3 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
            >
              ❯
            </button>
          </div>
        </section>

        {/* Header Title */}
        <section className="max-w-6xl mx-auto px-6 py-10 text-center">
          <h2 className="text-3xl sm:text-4xl font-serif text-stone-900 font-bold mb-3">
            Handcrafted Natural Soaps
          </h2>
          <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto">
            Sustainably sourced ingredients wrapped in earth-friendly, rustic kraft packaging.
          </p>
        </section>

        {/* Product Catalog Grid */}
        <section id="products" className="max-w-6xl mx-auto px-6 pb-20 scroll-mt-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col"
              >
                <div className="relative aspect-[4/3] w-full bg-stone-100 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover object-center"
                  />
                  {product.badge && (
                    <span className="absolute top-3 right-3 bg-emerald-800 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                      {product.badge}
                    </span>
                  )}
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-serif font-semibold text-stone-900 mb-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-stone-500 mb-3">{product.tagline}</p>
                    <p className="text-xs text-stone-400 mb-3">Net Weight: {product.weight}</p>
                    <div id="ingredients" className="flex flex-wrap gap-1.5 mb-4">
                      {product.ingredients.map((ing, idx) => (
                        <span key={idx} className="text-[11px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md">
                          {ing}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                    <span className="text-lg font-bold text-stone-900">Rs. {product.price.toFixed(0)}</span>
                    <button
                      onClick={() => {
                        addToCart(product);
                        setIsCartOpen(true);
                      }}
                      className="bg-emerald-900 hover:bg-emerald-800 active:scale-95 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Slide-out Shopping Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 p-6 overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-stone-200">
              <h3 className="text-xl font-serif font-bold text-stone-900">Your Shopping Cart ({totalItems})</h3>
              <button onClick={() => setIsCartOpen(false)} className="text-stone-400 hover:text-stone-700 text-xl font-bold">✕</button>
            </div>

            {cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <p className="text-stone-500 mb-4">Your cart is currently empty.</p>
                <button onClick={() => setIsCartOpen(false)} className="bg-emerald-900 text-white px-5 py-2 rounded-lg text-sm">Start Shopping</button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto py-4 space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4 items-center border-b border-stone-100 pb-4">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg border" />
                      <div className="flex-1">
                        <h4 className="font-serif font-semibold text-stone-900">{item.name}</h4>
                        <p className="text-sm font-bold text-stone-700">Rs. {item.price.toFixed(0)}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 bg-stone-100 rounded text-stone-700 font-bold">-</button>
                          <span className="text-sm px-2">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 bg-stone-100 rounded text-stone-700 font-bold">+</button>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-red-500 text-xs hover:underline">Remove</button>
                    </div>
                  ))}
                </div>

                <div className="border-t border-stone-200 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-stone-600"><span>Subtotal:</span><span>Rs. {subtotal.toFixed(0)}</span></div>
                  <div className="flex justify-between text-stone-600"><span>Estimated Shipping:</span><span>{shipping === 0 ? "FREE" : `Rs. ${shipping.toFixed(0)}`}</span></div>
                  <div className="flex justify-between text-stone-600"><span>Tax (8%):</span><span>Rs. {tax.toFixed(0)}</span></div>
                  <div className="flex justify-between font-bold text-lg text-stone-900 pt-2 border-t"><span>Total:</span><span>Rs. {total.toFixed(0)}</span></div>
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setIsCheckoutOpen(true);
                    }}
                    className="w-full mt-4 bg-emerald-900 hover:bg-emerald-800 text-white font-medium py-3 rounded-xl transition-all shadow-md"
                  >
                    Proceed to Billing & Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Checkout / Billing Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsCheckoutOpen(false)} />
          <div className="relative bg-white rounded-2xl max-w-lg w-full p-6 z-10 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h3 className="text-xl font-serif font-bold text-stone-900">Checkout & Billing Payment</h3>
              <button onClick={() => setIsCheckoutOpen(false)} className="text-stone-400 hover:text-stone-700 font-bold">✕</button>
            </div>

            {orderSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">✓</div>
                <h4 className="text-2xl font-serif font-bold text-stone-900">Thank You for Your Order!</h4>
                <p className="text-sm text-stone-600">Order Reference ID: <span className="font-mono font-bold text-emerald-900">{orderSuccess.orderId}</span></p>
                <p className="text-xs text-stone-500">
                  {orderSuccess.paymentMethod === "cod"
                    ? "Pay in cash when your order is delivered."
                    : "Our team will contact you shortly to complete your online payment."}
                </p>
                <p className="text-xs text-stone-500">We&apos;ll contact you on <strong>{orderSuccess.customerPhone}</strong> with delivery updates.</p>
                <button
                  onClick={() => {
                    setOrderSuccess(null);
                    setIsCheckoutOpen(false);
                  }}
                  className="bg-emerald-900 text-white px-6 py-2 rounded-lg text-sm font-medium mt-4"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <form onSubmit={handleCheckoutSubmit} className="space-y-4 text-sm">
                <div className="space-y-2">
                  <h4 className="font-bold text-stone-800">1. Shipping & Customer Info</h4>
                  <input type="text" name="name" required placeholder="Full Name" value={formData.name} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg bg-stone-50" />
                  <input type="tel" name="phone" required placeholder="Phone Number" value={formData.phone} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg bg-stone-50" />
                  <input type="email" name="email" placeholder="Email Address (optional)" value={formData.email} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg bg-stone-50" />
                  <input type="text" name="address" required placeholder="Street Address" value={formData.address} onChange={handleInputChange} className="w-full p-2.5 border rounded-lg bg-stone-50" />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" name="city" required placeholder="City" value={formData.city} onChange={handleInputChange} className="p-2.5 border rounded-lg bg-stone-50" />
                    <input type="text" name="zip" required placeholder="Postal / ZIP Code" value={formData.zip} onChange={handleInputChange} className="p-2.5 border rounded-lg bg-stone-50" />
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t">
                  <h4 className="font-bold text-stone-800">2. Payment Method</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handlePaymentMethodChange("cod")}
                      className={`p-3 border rounded-lg text-sm font-medium text-left transition-all ${
                        formData.paymentMethod === "cod"
                          ? "border-emerald-800 bg-emerald-50 text-emerald-900"
                          : "border-stone-200 bg-stone-50 text-stone-600"
                      }`}
                    >
                      Cash on Delivery
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePaymentMethodChange("online")}
                      className={`p-3 border rounded-lg text-sm font-medium text-left transition-all ${
                        formData.paymentMethod === "online"
                          ? "border-emerald-800 bg-emerald-50 text-emerald-900"
                          : "border-stone-200 bg-stone-50 text-stone-600"
                      }`}
                    >
                      Online Payment
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t flex justify-between font-bold text-stone-900 text-base">
                  <span>Grand Total:</span>
                  <span>Rs. {total.toFixed(0)}</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-900 hover:bg-emerald-800 text-white py-3 rounded-xl font-bold shadow-md transition-all disabled:opacity-50"
                >
                  {isSubmitting ? "Placing Order..." : `Place Order — Rs. ${total.toFixed(0)}`}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer id="contact" className="bg-stone-900 text-stone-300 border-t border-stone-800 pt-12 pb-8 scroll-mt-24">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-2">
            <h3 className="text-2xl font-serif font-bold text-white mb-3">EcoGleam</h3>
            <p className="text-stone-400 text-sm max-w-sm mb-4 leading-relaxed">
              Purifying your daily routine with eco-friendly, cold-processed botanical soaps crafted from pure essential oils and natural clays.
            </p>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-3">Navigation</h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li><button onClick={() => setSearchQuery("")} className="hover:text-white transition-colors">Shop Catalog</button></li>
              <li><a href="#ingredients" className="hover:text-white transition-colors">Botanical Ingredients</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-sm font-semibold uppercase tracking-wider mb-3">Get in Touch</h4>
            <div className="space-y-2 text-sm text-stone-400">
              <p className="flex items-center gap-2">
                <a href="mailto:ecogleam1221@gmail.com" className="hover:text-emerald-400 transition-colors underline">ecogleam1221@gmail.com</a>
              </p>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-6 pt-6 border-t border-stone-800 text-center text-xs text-stone-500">
          © {new Date().getFullYear()} EcoGleam Soap Co. All rights reserved.
        </div>
      </footer>
    </div>
  );
}