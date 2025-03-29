import Link from 'next/link';
import { Instagram, Twitter, Facebook, Mail } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-kcalculate-white border-t border-kcalculate-pistachio/20 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div>
                        <h3 className="font-bold text-xl mb-4 text-kcalculate-black">Kcalculate AI</h3>
                        <p className="text-gray-600 mb-4">
                            Smart nutrition tracking powered by AI and computer vision technology.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-kcalculate-asparagus hover:text-kcalculate-pistachio transition-colors">
                                <Instagram size={20} />
                            </a>
                            <a href="#" className="text-kcalculate-asparagus hover:text-kcalculate-pistachio transition-colors">
                                <Twitter size={20} />
                            </a>
                            <a href="#" className="text-kcalculate-asparagus hover:text-kcalculate-pistachio transition-colors">
                                <Facebook size={20} />
                            </a>
                            <a href="#" className="text-kcalculate-asparagus hover:text-kcalculate-pistachio transition-colors">
                                <Mail size={20} />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4 text-kcalculate-black">Product</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/features" className="text-gray-600 hover:text-kcalculate-orange transition-colors">
                                    Features
                                </Link>
                            </li>
                            <li>
                                <Link href="/pricing" className="text-gray-600 hover:text-kcalculate-orange transition-colors">
                                    Pricing
                                </Link>
                            </li>
                            <li>
                                <Link href="/testimonials" className="text-gray-600 hover:text-kcalculate-orange transition-colors">
                                    Testimonials
                                </Link>
                            </li>
                            <li>
                                <Link href="/faq" className="text-gray-600 hover:text-kcalculate-orange transition-colors">
                                    FAQ
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4 text-kcalculate-black">Resources</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/blog" className="text-gray-600 hover:text-kcalculate-orange transition-colors">
                                    Blog
                                </Link>
                            </li>
                            <li>
                                <Link href="/guides" className="text-gray-600 hover:text-kcalculate-orange transition-colors">
                                    Nutrition Guides
                                </Link>
                            </li>
                            <li>
                                <Link href="/api" className="text-gray-600 hover:text-kcalculate-orange transition-colors">
                                    API Documentation
                                </Link>
                            </li>
                            <li>
                                <Link href="/help" className="text-gray-600 hover:text-kcalculate-orange transition-colors">
                                    Help Center
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4 text-kcalculate-black">Company</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/about" className="text-gray-600 hover:text-kcalculate-orange transition-colors">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/careers" className="text-gray-600 hover:text-kcalculate-orange transition-colors">
                                    Careers
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-gray-600 hover:text-kcalculate-orange transition-colors">
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link href="/press" className="text-gray-600 hover:text-kcalculate-orange transition-colors">
                                    Press Kit
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-kcalculate-pistachio/10 flex flex-col md:flex-row justify-between items-center">
                    <div className="text-sm text-gray-500 mb-4 md:mb-0">
                        &copy; {new Date().getFullYear()} Kcalculate AI. All rights reserved.
                    </div>
                    <div className="flex flex-wrap justify-center md:space-x-6">
                        <Link href="/privacy" className="text-gray-500 hover:text-kcalculate-black transition-colors text-sm px-2 py-1">
                            Privacy Policy
                        </Link>
                        <Link href="/terms" className="text-gray-500 hover:text-kcalculate-black transition-colors text-sm px-2 py-1">
                            Terms of Service
                        </Link>
                        <Link href="/cookies" className="text-gray-500 hover:text-kcalculate-black transition-colors text-sm px-2 py-1">
                            Cookie Policy
                        </Link>
                        <Link href="/sitemap" className="text-gray-500 hover:text-kcalculate-black transition-colors text-sm px-2 py-1">
                            Sitemap
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;