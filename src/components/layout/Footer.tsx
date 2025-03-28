const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-200 py-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                        &copy; {new Date().getFullYear()} NutriTrack. All rights reserved.
                    </div>
                    <div className="flex space-x-6">
                        <a href="#" className="text-gray-500 hover:text-gray-700 text-sm">
                            Privacy Policy
                        </a>
                        <a href="#" className="text-gray-500 hover:text-gray-700 text-sm">
                            Terms of Service
                        </a>
                        <a href="#" className="text-gray-500 hover:text-gray-700 text-sm">
                            Contact
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;