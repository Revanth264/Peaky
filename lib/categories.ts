export const NAV_CATEGORIES = [
  {
    key: "apparel",
    label: "Apparel",
    children: ["tees", "hoodies", "jackets", "oversized", "seasonal"]
  },
  {
    key: "accessories",
    label: "Accessories",
    children: ["keychains", "phone-cases", "badges", "caps", "tote-bags"]
  },
  {
    key: "collectibles",
    label: "Collectibles",
    children: ["figures", "model-kits", "posters", "metal-art", "plushies"]
  },
  {
    key: "home",
    label: "Home & Desk",
    children: ["mugs", "lamps", "mousepads", "stickers"]
  },
  { key: "new", label: "New Arrivals" },
  { key: "best", label: "Best Sellers" },
  { key: "sale", label: "Sale / Offers" }
] as const;

export type CategoryKey = typeof NAV_CATEGORIES[number]["key"];

