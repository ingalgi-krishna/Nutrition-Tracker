// src/app/page.tsx
"use client";
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Camera,
  BrainCircuit,
  PieChart,
  Salad,
  ShieldCheck,
  Zap,
  BadgeCheck,
  ChevronRight
} from 'lucide-react';
import Image from 'next/image';
export default function Home() {
  return (
    <div className="bg-[#FEFEFF] font-DM_Sans">
      {/* Hero section - reimagined with overlapping elements */}
      <div className="relative overflow-hidden">
        <div className="absolute top-20 right-[20%] w-64 h-64 rounded-full bg-[#ABD483]/20 blur-3xl"></div>
        <div className="absolute bottom-40 left-[10%] w-96 h-96 rounded-full bg-[#8BAA7C]/10 blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-4 pt-24 pb-20 md:pt-12 md:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-block px-4 py-1.5 bg-[#ABD483]/20 rounded-full text-[#8BAA7C] font-semibold text-sm mb-6">
                NUTRITION REIMAGINED
              </span>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-[#010100] leading-tight mb-6">
                AI-Powered <span className="text-[#FC842D]">Nutrition</span> Intelligence
              </h1>
              <p className="text-xl text-gray-700 mb-8 max-w-xl">
                Kcalculate AI transforms how you track nutrition with computer vision, leveraging edge AI to instantly analyze meals and provide personalized insights.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/register"
                  className="px-8 py-4 bg-[#FC842D] text-white rounded-lg font-bold text-lg shadow-lg shadow-[#FC842D]/20 hover:shadow-xl hover:shadow-[#FC842D]/30 hover:bg-[#FC842D]/90 transition-all duration-300"
                >
                  Start Your Journey
                </Link>
                <Link
                  href="#how-it-works"
                  className="px-8 py-4 border-2 border-[#ABD483] text-[#010100] rounded-lg font-bold text-lg hover:bg-[#ABD483]/10 transition-all duration-300 flex items-center justify-center"
                >
                  See How It Works <ChevronRight className="ml-2 h-5 w-5" />
                </Link>
              </div>

              <div className="mt-12 flex items-center gap-6">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="w-10 h-10 rounded-full border-2 border-white bg-[#8BAA7C]/20"></div>
                  ))}
                </div>
                <div>
                  <div className="font-bold text-[#010100]">5,000+ Happy Users</div>
                  <div className="text-sm text-gray-600">Join our growing community</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative lg:pl-8"
            >
              <div className="relative z-10 bg-white p-3 rounded-2xl shadow-xl overflow-hidden">
                <Image
                  src="/nutrition.jpg"
                  alt="Kcalculate AI in action"
                  width={300}
                  height={200}
                  className="w-full h-auto rounded-xl"
                  priority
                />

                <motion.div
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="absolute -left-6 bottom-16 bg-white p-4 rounded-xl shadow-lg max-w-[200px]"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#ABD483] flex items-center justify-center">
                      <PieChart className="w-4 h-4 text-white" />
                    </div>
                    <div className="font-bold text-sm">Macros Analysis</div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-[#ABD483]/10 p-2 rounded-lg text-center">
                      <div className="font-bold">42g</div>
                      <div>Protein</div>
                    </div>
                    <div className="bg-[#ABD483]/10 p-2 rounded-lg text-center">
                      <div className="font-bold">30g</div>
                      <div>Carbs</div>
                    </div>
                    <div className="bg-[#ABD483]/10 p-2 rounded-lg text-center">
                      <div className="font-bold">18g</div>
                      <div>Fats</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="absolute -right-6 top-16 bg-white p-3 rounded-xl shadow-lg"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 rounded-full bg-[#FC842D] flex items-center justify-center">
                      <Zap className="w-3 h-3 text-white" />
                    </div>
                    <div className="font-bold">512 kcal</div>
                  </div>
                </motion.div>
              </div>

              <div className="absolute -z-10 top-0 right-0 w-full h-full bg-[#ABD483]/30 rounded-2xl translate-x-6 translate-y-6"></div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Technology Highlights Section */}
      <div className="bg-[#010100] text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-extrabold mb-2">99%</div>
              <div className="text-[#ABD483]">Accuracy Rate</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-extrabold mb-2">2s</div>
              <div className="text-[#ABD483]">Analysis Time</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-extrabold mb-2">5,000+</div>
              <div className="text-[#ABD483]">Food Items</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-extrabold mb-2">24/7</div>
              <div className="text-[#ABD483]">AI Support</div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="py-24 bg-[#FEFEFF]">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 bg-[#ABD483]/20 rounded-full text-[#8BAA7C] font-semibold text-sm mb-4">
              THE PROCESS
            </span>
            <h2 className="text-4xl font-extrabold text-[#010100] mb-6">How Kcalculate AI Works</h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Our technology combines advanced computer vision with nutrition science to deliver accurate results in seconds.
            </p>
          </motion.div>

          {/* Enhanced Bento Grid - Process Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="h-48 bg-[#8BAA7C] flex items-center justify-center">
                <Camera className="w-20 h-20 text-white" />
              </div>
              <div className="p-8">
                <div className="inline-block px-3 py-1 bg-[#8BAA7C]/10 rounded-full text-[#8BAA7C] font-bold text-sm mb-4">
                  STEP 01
                </div>
                <h3 className="text-2xl font-bold text-[#010100] mb-4">Capture Your Meal</h3>
                <p className="text-gray-700">
                  Use our ESP32-CAM wearable device to instantly capture high-quality images of your food with a single tap.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden md:mt-12"
            >
              <div className="h-48 bg-[#ABD483] flex items-center justify-center">
                <BrainCircuit className="w-20 h-20 text-white" />
              </div>
              <div className="p-8">
                <div className="inline-block px-3 py-1 bg-[#ABD483]/10 rounded-full text-[#ABD483] font-bold text-sm mb-4">
                  STEP 02
                </div>
                <h3 className="text-2xl font-bold text-[#010100] mb-4">AI Analysis</h3>
                <p className="text-gray-700">
                  Our Gemini 2.0 Vision AI identifies every ingredient, portion size, and calculates precise nutritional content.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="h-48 bg-[#FC842D] flex items-center justify-center">
                <PieChart className="w-20 h-20 text-white" />
              </div>
              <div className="p-8">
                <div className="inline-block px-3 py-1 bg-[#FC842D]/10 rounded-full text-[#FC842D] font-bold text-sm mb-4">
                  STEP 03
                </div>
                <h3 className="text-2xl font-bold text-[#010100] mb-4">Personalized Insights</h3>
                <p className="text-gray-700">
                  View comprehensive nutrition data and receive AI-powered recommendations tailored to your health goals.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Core Features Section - Bento Grid Reimagined */}
      <div className="py-20 bg-[#010100]/[0.02]">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 bg-[#ABD483]/20 rounded-full text-[#8BAA7C] font-semibold text-sm mb-4">
              KEY CAPABILITIES
            </span>
            <h2 className="text-4xl font-extrabold text-[#010100] mb-6">Intelligent Features</h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Explore the advanced capabilities that make Kcalculate AI the smartest nutrition platform available.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Camera />,
                title: "ESP32-CAM Integration",
                desc: "Wearable hardware that seamlessly captures food images and syncs with our platform in real-time."
              },
              {
                icon: <BrainCircuit />,
                title: "Gemini Vision AI",
                desc: "State-of-the-art computer vision that recognizes thousands of food items with 99% accuracy."
              },
              {
                icon: <PieChart />,
                title: "Nutritional Analytics",
                desc: "Comprehensive breakdown of calories, macros, vitamins, and minerals in beautiful visualizations."
              },
              {
                icon: <Salad />,
                title: "Meal Recommendations",
                desc: "AI-generated meal suggestions based on your preferences, dietary restrictions, and nutritional goals."
              },
              {
                icon: <ShieldCheck />,
                title: "Health Goal Tracking",
                desc: "Set personalized health objectives and track your progress with customizable dashboards."
              },
              {
                icon: <Zap />,
                title: "Real-time Feedback",
                desc: "Instant nutritional insights and suggestions to optimize your dietary choices as you eat."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-[#ABD483]/20"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-[#8BAA7C] to-[#ABD483] flex items-center justify-center text-white mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-[#010100] mb-3">{feature.title}</h3>
                <p className="text-gray-700">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonial Section */}
      <div className="py-24 bg-[#FEFEFF]">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 bg-[#ABD483]/20 rounded-full text-[#8BAA7C] font-semibold text-sm mb-4">
              SUCCESS STORIES
            </span>
            <h2 className="text-4xl font-extrabold text-[#010100] mb-6">What Our Users Say</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "Kcalculate AI has completely transformed my approach to nutrition. The wearable camera makes tracking effortless.",
                name: "Emma Thompson",
                title: "Fitness Coach"
              },
              {
                quote: "As a nutritionist, I recommend Kcalculate AI to all my clients. The accuracy and depth of analysis is unmatched.",
                name: "Dr. Michael Chen",
                title: "Clinical Nutritionist"
              },
              {
                quote: "I've lost 30 pounds using Kcalculate AI. The personalized recommendations have been a game-changer for me.",
                name: "Sarah Johnson",
                title: "Software Engineer"
              }
            ].map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white p-8 rounded-xl shadow-md border border-[#ABD483]/20"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-10 h-10">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16 8H8C5.79086 8 4 9.79086 4 12V20C4 22.2091 5.79086 24 8 24H16C18.2091 24 20 22.2091 20 20V12C20 9.79086 18.2091 8 16 8Z" fill="#ABD483" />
                      <path d="M32 8H24C21.7909 8 20 9.79086 20 12V20C20 22.2091 21.7909 24 24 24H32C34.2091 24 36 22.2091 36 20V12C36 9.79086 34.2091 8 32 8Z" fill="#ABD483" />
                    </svg>
                  </div>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map(star => (
                      <svg key={star} width="16" height="16" viewBox="0 0 24 24" fill="#FC842D" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>
                <div>
                  <div className="font-bold text-[#010100]">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.title}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="py-20 bg-gradient-to-r from-[#8BAA7C] to-[#ABD483]"
      >
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Ready to Transform Your Nutrition?</h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Join thousands of users who have simplified their nutrition management with Kcalculate AI's revolutionary technology.
          </p>

          <Link
            href="/register"
            className="px-10 py-5 bg-white text-[#010100] rounded-lg font-bold text-xl shadow-xl shadow-[#010100]/10 hover:shadow-2xl hover:shadow-[#010100]/20 transition-all duration-300 inline-flex items-center"
          >
            Start Your Free Trial <BadgeCheck className="ml-2 h-6 w-6 text-[#FC842D]" />
          </Link>

          <div className="mt-10 flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-white" />
              <span className="text-white font-medium">30-Day Money Back</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-white" />
              <span className="text-white font-medium">No Credit Card Required</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-white" />
              <span className="text-white font-medium">Cancel Anytime</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}