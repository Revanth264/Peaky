'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'
import { FiSearch, FiShoppingCart, FiHeart, FiMenu, FiX, FiUser, FiChevronDown, FiSettings, FiPackage, FiMapPin, FiLogOut } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { SignInModal } from '@/components/auth/SignInModal'
import MegaMenu from '@/components/header/MegaMenu'

export default function Header() {
  const { user, logout } = useAuth()
  const { getTotalItems } = useCart()
  const { getWishlistCount } = useWishlist()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [megaMenuOpen, setMegaMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [signInModalOpen, setSignInModalOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      setIsScrolled(currentScrollY > 20)
      
      if (currentScrollY < 10) {
        setIsVisible(true)
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true)
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false)
      }
      
      setLastScrollY(currentScrollY)
    }

    const handleOpenSignInModal = () => {
      setSignInModalOpen(true)
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('openSignInModal', handleOpenSignInModal)
    document.addEventListener('mousedown', handleClickOutside)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('openSignInModal', handleOpenSignInModal)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [lastScrollY])

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Contact', href: '/contact' },
  ]

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ 
          y: isVisible ? 0 : -100,
          opacity: isVisible ? 1 : 0
        }}
        transition={{ 
          duration: 0.4,
          ease: [0.16, 1, 0.3, 1]
        }}
        className={`
          fixed top-0 left-0 right-0 z-[100] w-full
          border-b backdrop-blur-2xl
          bg-white/80 dark:bg-gray-950/80
          ${isScrolled 
            ? 'border-gray-200/60 dark:border-gray-800/60 shadow-2xl shadow-purple-500/10 dark:shadow-purple-500/5' 
            : 'border-transparent shadow-none'
          }
          transition-all duration-500
        `}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 sm:h-20 items-center justify-between">
            {/* Logo with scroll-responsive animation */}
            <Link 
              href="/" 
              className="flex items-center space-x-2 group relative cursor-pointer"
            >
              <motion.span 
                className="text-xl sm:text-2xl font-bold tracking-tighter relative z-10"
                whileHover={{ scale: 1.05 }}
                animate={{ 
                  scale: isScrolled ? 0.95 : 1,
                  y: isScrolled ? -1 : 0
                }}
                transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <span className="bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                  Peakime
                </span>
                <span className="text-purple-600 transition-all group-hover:text-pink-500">.</span>
              </motion.span>
              
              {/* Brand glow effect on scroll */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-500/20 blur-xl rounded-full"
                animate={{ 
                  opacity: isScrolled ? 0.5 : 0,
                  scale: isScrolled ? 1 : 0.8
                }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8 xl:space-x-10">
              {/* Shop/Categories Button with Mega Menu */}
              <div 
                className="relative"
                onMouseEnter={() => setMegaMenuOpen(true)}
                onMouseLeave={() => setMegaMenuOpen(false)}
              >
                <motion.button
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-center gap-1 text-sm font-semibold transition-colors duration-300 ${
                    pathname === '/products' || pathname.startsWith('/products/') || megaMenuOpen
                      ? 'text-purple-600 dark:text-purple-400'
                      : 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
                  }`}
                >
                  Shop
                  <motion.div
                    animate={{ rotate: megaMenuOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <FiChevronDown className="w-4 h-4" />
                  </motion.div>
                </motion.button>
                {(pathname === '/products' || pathname.startsWith('/products/') || megaMenuOpen) && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <MegaMenu isOpen={megaMenuOpen} onClose={() => setMegaMenuOpen(false)} />
              </div>

              <motion.div 
                whileHover={{ y: -2 }} 
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <Link
                  href="/products"
                  className={`text-sm font-semibold transition-colors duration-300 ${
                    pathname === '/products' || pathname.startsWith('/products/')
                      ? 'text-purple-600 dark:text-purple-400'
                      : 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
                  }`}
                >
                  Explore
                </Link>
                {(pathname === '/products' || pathname.startsWith('/products/')) && (
                  <motion.div
                    layoutId="exploreIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
              </motion.div>
              {user && (
                <motion.div 
                  whileHover={{ y: -2 }} 
                  transition={{ duration: 0.2 }}
                  className="relative"
                >
                  <Link
                    href="/wishlist"
                    className={`text-sm font-semibold transition-colors duration-300 ${
                      pathname === '/wishlist'
                        ? 'text-purple-600 dark:text-purple-400'
                        : 'text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400'
                    }`}
                  >
                    Library
                  </Link>
                  {pathname === '/wishlist' && (
                    <motion.div
                      layoutId="wishlistIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                </motion.div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4">
              <motion.div 
                whileHover={{ scale: 1.1, y: -2 }} 
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchOpen(true)}
                  className="hidden sm:inline-flex hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 transition-all duration-300 rounded-xl"
                >
                  <FiSearch className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </motion.div>

              {/* Cart - Always visible */}
              <motion.div
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="mx-2"
              >
                <Link
                  href="/cart"
                  className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full hover:bg-gray-100/90 dark:hover:bg-gray-800/90 transition-all duration-200 ease-out text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                  aria-label="Shopping cart"
                >
                  <FiShoppingCart className="w-5 h-5 sm:w-[22px] sm:h-[22px]" strokeWidth={2} />
                  {getTotalItems() > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-[10px] sm:text-xs rounded-full flex items-center justify-center font-semibold shadow-md leading-none"
                    >
                      {getTotalItems()}
                    </motion.span>
                  )}
                </Link>
              </motion.div>

                    {/* Wishlist - Always visible */}
                    <motion.div
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="mx-2"
                    >
                      <Link
                        href="/wishlist"
                  className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full hover:bg-gray-100/90 dark:hover:bg-gray-800/90 transition-all duration-200 ease-out text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                        aria-label="Wishlist"
                      >
                  <FiHeart className="w-5 h-5 sm:w-[22px] sm:h-[22px] transition-transform duration-200" strokeWidth={2} />
                        {getWishlistCount() > 0 && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 20 }}
                      className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-[10px] sm:text-xs rounded-full flex items-center justify-center font-semibold shadow-md leading-none"
                          >
                            {getWishlistCount()}
                          </motion.span>
                        )}
                      </Link>
                    </motion.div>

              {user ? (
                <div className="relative" ref={userMenuRef}>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-white/20 flex items-center justify-center text-sm sm:text-base font-semibold">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name || 'User'} className="h-full w-full rounded-full object-cover" />
                      ) : (
                        <span>{user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}</span>
                      )}
                    </div>
                    <span className="hidden md:inline text-sm font-medium">{user.name || user.email?.split('@')[0] || 'Account'}</span>
                    <motion.div
                      animate={{ rotate: userMenuOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <FiChevronDown className="w-4 h-4 hidden md:block" />
                    </motion.div>
                  </motion.button>

                  {/* User Dropdown Menu */}
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-800/50 overflow-hidden z-50"
                      >
                        {/* User Info Header */}
                        <div className="px-4 py-3 border-b border-gray-200/50 dark:border-gray-800/50 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white font-semibold">
                              {user.avatar ? (
                                <img src={user.avatar} alt={user.name || 'User'} className="h-full w-full rounded-full object-cover" />
                              ) : (
                                <span>{user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                {user.name || 'User'}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                            </div>
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="py-2">
                          <Link
                            href="/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-colors"
                          >
                            <FiUser className="w-4 h-4" />
                            <span>My Profile</span>
                          </Link>
                          <Link
                            href="/orders"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-colors"
                          >
                            <FiPackage className="w-4 h-4" />
                            <span>My Orders</span>
                            {user.totalOrders && user.totalOrders > 0 && (
                              <span className="ml-auto text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full">
                                {user.totalOrders}
                              </span>
                            )}
                          </Link>
                          <Link
                            href="/profile?tab=addresses"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-colors"
                          >
                            <FiMapPin className="w-4 h-4" />
                            <span>Addresses</span>
                            {user.addresses && user.addresses.length > 0 && (
                              <span className="ml-auto text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full">
                                {user.addresses.length}
                              </span>
                            )}
                          </Link>
                          <Link
                            href="/wishlist"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-colors"
                          >
                            <FiHeart className="w-4 h-4" />
                            <span>My Library</span>
                            {getWishlistCount() > 0 && (
                              <span className="ml-auto text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full">
                                {getWishlistCount()}
                              </span>
                            )}
                          </Link>
                          <div className="border-t border-gray-200/50 dark:border-gray-800/50 my-1" />
                          <button
                            onClick={() => {
                              setUserMenuOpen(false)
                              logout()
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <FiLogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.div 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="primary"
                    onClick={() => setSignInModalOpen(true)}
                    className="hidden sm:inline-flex text-xs sm:text-sm px-4 sm:px-6"
                  >
                    Sign in
                  </Button>
                </motion.div>
              )}
              
              <SignInModal open={signInModalOpen} onOpenChange={setSignInModalOpen} />

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden"
              >
                {mobileMenuOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950"
            >
              <div className="container mx-auto px-4 py-6 space-y-3">
                {user && (
                  <div className="flex items-center space-x-3 pb-3 border-b border-gray-200 dark:border-gray-800">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center text-white font-bold">
                      {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.name || user.email?.split("@")[0] || "User"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                  </div>
                )}

                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    setSearchOpen(true)
                    setMobileMenuOpen(false)
                  }}
                >
                  <FiSearch className="h-4 w-4 mr-2" />
                  Search
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => { 
                    setMobileMenuOpen(false)
                    router.push('/products')
                  }}
                >
                  Shop All
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => { 
                    setMobileMenuOpen(false)
                    router.push('/products?new=true')
                  }}
                >
                  New Arrivals
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => { 
                    setMobileMenuOpen(false)
                    router.push('/products?limited=true')
                  }}
                >
                  Limited Editions
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  onClick={() => { 
                    setMobileMenuOpen(false)
                    router.push('/products')
                  }}
                >
                  Explore
                </Button>
                {user && (
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => { 
                      setMobileMenuOpen(false)
                      router.push('/wishlist')
                    }}
                  >
                    <FiHeart className="h-4 w-4 mr-2" />
                    Library
                  </Button>
                )}
                
                {user ? (
                  <>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => {
                        router.push('/cart')
                        setMobileMenuOpen(false)
                      }}
                    >
                      <FiShoppingCart className="h-4 w-4 mr-2" />
                      Cart ({getTotalItems()})
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        logout()
                        setMobileMenuOpen(false)
                      }}
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => {
                      setSignInModalOpen(true)
                      setMobileMenuOpen(false)
                    }}
                  >
                    Sign in
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Search Modal - Simple Implementation */}
      {searchOpen && (
        <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-20 px-4" onClick={() => setSearchOpen(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg max-w-2xl w-full p-4 sm:p-6 mt-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <FiSearch className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 text-gray-900 dark:text-white"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const query = (e.target as HTMLInputElement).value
                    if (query.trim()) {
                      router.push(`/products?search=${encodeURIComponent(query)}`)
                      setSearchOpen(false)
                    }
                  }
                  if (e.key === 'Escape') {
                    setSearchOpen(false)
                  }
                }}
              />
            </div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Press Enter to search or Esc to close</p>
          </div>
        </div>
      )}
    </>
  )
}
