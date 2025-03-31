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
  ChevronRight,
  Users,
  BarChart,
  LineChart,
  Coffee
} from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="bg-[#FEFEFF] font-DM_Sans">
      {/* Hero section with circular green background */}
      <div className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-3/4 h-[600px] bg-[#8BAA7C] rounded-bl-[50%] -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 pt-10 pb-20 md:pt-12 md:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-block px-4 py-1.5 bg-[#ABD483]/20 rounded-full text-[#8BAA7C] font-semibold text-sm mb-6">
                NUTRITION REIMAGINED
              </span>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight font-montserrat">
                <span className="bg-gradient-to-r from-[#8BAA7C] to-[#ABD483] text-transparent bg-clip-text">AI-Powered</span> <br />
                <span className="text-[#010100]">Nutrition Intelligence</span>
              </h1>
              <p className="text-l text-gray-700 mb-8 max-w-xl font-montserrat">
                Kcalculate AI transforms how you track nutrition with computer vision, leveraging edge AI to instantly analyze meals and provide personalized insights.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex justify-center">
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-[#FC842D] text-white rounded-lg font-semibold text-sm sm:text-base shadow-lg hover:shadow-xl hover:bg-[#FC842D]/90 transition-all duration-300"
                  >
                    Start Your Journey
                  </Link>
                </div>
                <div className="flex justify-center">
                  <Link
                    href="#how-it-works"
                    className="inline-flex items-center justify-center w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 border-2 border-[#ABD483] text-[#010100] rounded-lg font-semibold text-sm sm:text-base hover:bg-[#ABD483]/10 transition-all duration-300"
                  >
                    See How It Works <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="mt-12 flex items-center gap-6">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="w-10 h-10 rounded-full border-2 border-white bg-[#8BAA7C]/20"></div>
                  ))}
                </div>
                <div>
                  <div className="font-bold text-[#010100]">Real-time Analysis</div>
                  <div className="text-sm text-gray-600">Powered by Gemini 2.0 Flash</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative lg:pl-8"
            >
              {/* Product display area with circular container */}
              <div className="relative z-10 overflow-hidden">
                <div className="bg-[#8BAA7C] rounded-full w-full max-w-[300px] sm:max-w-[400px] md:max-w-[500px] aspect-square flex items-center justify-center mx-auto">
                  <div className="rounded-full overflow-hidden w-[calc(100%-10px)] h-[calc(100%-10px)] flex items-center justify-center">
                    <Image
                      src="/healthy.png"
                      alt="Kcalculate AI in action"
                      width={350}
                      height={350}
                      className="w-full h-full object-cover"
                      priority
                    />
                  </div>
                </div>

                <motion.div
                  initial={{ x: -30, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="absolute left-0 bottom-16 bg-white p-4 rounded-xl shadow-lg max-w-[200px]"
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
                  className="absolute right-0 top-16 bg-white p-3 rounded-xl shadow-lg"
                >
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-6 h-6 rounded-full bg-[#FC842D] flex items-center justify-center">
                      <Zap className="w-3 h-3 text-white" />
                    </div>
                    <div className="font-bold">512 kcal</div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Technology Highlights Section */}
      <div className="bg-[#010100] text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-bold mb-2">98%</div>
              <div className="text-[#ABD483]">Food Recognition Accuracy</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-bold mb-2">4s</div>
              <div className="text-[#ABD483]">Analysis Time</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-bold mb-2">10K+</div>
              <div className="text-[#ABD483]">Recognizable Food Items</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-bold mb-2">95%</div>
              <div className="text-[#ABD483]">Nutrtional accuracy</div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}

      <div id="how-it-works" className="py-20 bg-[#FEFEFF]">
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
            <h2 className="text-4xl font-extrabold text-[#010100] mb-6 font-montserrat">How Kcalculate AI Works</h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Our technology combines advanced computer vision with nutrition science to deliver accurate results in seconds.
            </p>
          </motion.div>

          {/* Process Steps - Now with consistent height and images */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Capture Your Meal",
                description: "Use our ESP32-CAM wearable device to instantly capture high-quality images of your food with a single tap.",
                image: "/pancakes.jpg",
                step: "STEP 01"
              },
              {
                title: "AI Analysis",
                description: "Our Gemini 2.0 Flash Vision AI identifies every ingredient, portion size, and calculates precise nutritional content.",
                image: "/gemini.png",
                step: "STEP 02"
              },
              {
                title: "Personalized Insights",
                description: "View comprehensive nutrition data and receive AI-powered recommendations tailored to your health goals.",
                image: "/insights.png",
                step: "STEP 03"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`bg-white rounded-2xl shadow-xl overflow-hidden h-full transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${i === 1 ? 'md:mt-12' : ''}`}
              >
                {/* Feature image - same height for all */}
                <div className="h-[240px] relative overflow-hidden">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-105"
                  />
                  {/* Gradient overlay */}
                  <div
                    className="absolute inset-0 opacity-60 transition-opacity duration-300 hover:opacity-40"
                  ></div>
                </div>

                <div className="p-8">
                  <div
                    className="inline-block px-3 py-1 rounded-full font-bold text-sm mb-4"
                  >
                    {feature.step}
                  </div>
                  <h3 className="text-2xl font-bold text-[#010100] mb-4">{feature.title}</h3>
                  <p className="text-gray-700">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* App Features Section */}
      <div className="bg-[#8BAA7C] py-20">
        <div className="max-w-6xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 bg-white/20 rounded-full text-white font-semibold text-sm mb-4">
              APP FEATURES
            </span>
            <h2 className="text-4xl font-extrabold text-white mb-6">Smart Nutrition Tracking</h2>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Our application offers comprehensive tools to help you understand and improve your nutrition.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-[#8BAA7C]/80 p-6 rounded-lg border border-white/20">
                  <div className="w-14 h-14 bg-[#FEFEFF] rounded-full flex items-center justify-center mb-4">
                    <Camera className="w-7 h-7 text-[#8BAA7C]" />
                  </div>
                  <h3 className="text-white font-bold text-xl mb-2">ESP32-CAM Integration</h3>
                  <p className="text-white/80 text-sm">Capture food images directly with our custom ESP32-CAM wearable device for seamless logging</p>
                </div>
                <div className="bg-[#8BAA7C]/80 p-6 rounded-lg border border-white/20">
                  <div className="w-14 h-14 bg-[#FEFEFF] rounded-full flex items-center justify-center mb-4">
                    <BrainCircuit className="w-7 h-7 text-[#8BAA7C]" />
                  </div>
                  <h3 className="text-white font-bold text-xl mb-2">AI Food Recognition</h3>
                  <p className="text-white/80 text-sm">Advanced computer vision identifies foods and ingredients with remarkable accuracy</p>
                </div>
                <div className="bg-[#8BAA7C]/80 p-6 rounded-lg border border-white/20">
                  <div className="w-14 h-14 bg-[#FEFEFF] rounded-full flex items-center justify-center mb-4">
                    <PieChart className="w-7 h-7 text-[#8BAA7C]" />
                  </div>
                  <h3 className="text-white font-bold text-xl mb-2">Nutritional Insights</h3>
                  <p className="text-white/80 text-sm">Complete breakdown of macros, calories, vitamins and minerals for every meal</p>
                </div>
                <div className="bg-[#8BAA7C]/80 p-6 rounded-lg border border-white/20">
                  <div className="w-14 h-14 bg-[#FEFEFF] rounded-full flex items-center justify-center mb-4">
                    <LineChart className="w-7 h-7 text-[#8BAA7C]" />
                  </div>
                  <h3 className="text-white font-bold text-xl mb-2">Progress Tracking</h3>
                  <p className="text-white/80 text-sm">Monitor your nutrition habits over time with intuitive visual graphs and reports</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center py-12">
              <div className="relative max-w-[1000px] mx-auto"> {/* Increased from 720px to 900px */}
                {/* Black polished frame */}
                <div className="bg-black rounded-3xl p-6 shadow-2xl" style={{ /* Increased padding from p-4 to p-6 */
                  background: 'linear-gradient(145deg, #222, #111)',
                  boxShadow: '0 25px 60px rgba(0, 0, 0, 0.3)'
                }}>
                  {/* Screen with subtle inner shadow */}
                  <div className="rounded-2xl overflow-hidden border-2 border-gray-800" style={{
                    boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.5)'
                  }}>
                    <Image
                      src="/dashboard.png"
                      alt="Food Analysis"
                      width={880} /* Increased from 680 */
                      height={750} /* Increased from 580 */
                      className="w-full h-auto object-cover"
                    />
                  </div>

                  {/* Small camera notch */}
                  <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-20 h-1.5 bg-gray-800 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Future Vision Section */}
      <div className="py-20 bg-[#FEFEFF]">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 bg-[#ABD483]/20 rounded-full text-[#8BAA7C] font-semibold text-sm mb-4">
              FUTURE VISION
            </span>
            <h2 className="text-4xl font-extrabold text-[#010100] mb-6">Where We're Heading</h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Our roadmap includes exciting new features to make Kcalculate AI even more powerful and personalized.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white p-8 rounded-xl shadow-lg border border-[#ABD483]/20"
            >
              <div className="w-14 h-14 rounded-xl bg-[#ABD483] flex items-center justify-center text-white mb-6">
                <BarChart className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-[#010100] mb-3">Exercise Tracking</h3>
              <p className="text-gray-700">
                We're adding comprehensive exercise and workout tracking to provide a complete health and fitness solution.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white p-8 rounded-xl shadow-lg border border-[#ABD483]/20"
            >
              <div className="w-14 h-14 rounded-xl bg-[#ABD483] flex items-center justify-center text-white mb-6">
                <Coffee className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-[#010100] mb-3">More Personalized Meal Plans</h3>
              <p className="text-gray-700">
                AI-generated customized meal plans based on your preferences, region and seasons.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white p-8 rounded-xl shadow-lg border border-[#ABD483]/20"
            >
              <div className="w-14 h-14 rounded-xl bg-[#ABD483] flex items-center justify-center text-white mb-6">
                <Zap className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-[#010100] mb-3">Health Integration</h3>
              <p className="text-gray-700">
                Integration with wearables and health platforms to provide a complete picture of your health and wellness.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* About Our Team Section */}
      {/* <div className="py-20 bg-[#010100]/[0.02]">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 bg-[#ABD483]/20 rounded-full text-[#8BAA7C] font-semibold text-sm mb-4">
              ABOUT US
            </span>
            <h2 className="text-4xl font-extrabold text-[#010100] mb-6">The Team Behind Kcalculate AI</h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              We're a team of engineering students passionate about using technology to improve health and nutrition.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-2 flex flex-col justify-center"
            >
              <h3 className="text-2xl font-bold text-[#010100] mb-4">Final Year Engineering Project</h3>
              <p className="text-gray-700 mb-6">
                Kcalculate AI began as our final year engineering project, where we set out to solve the challenge of accurate nutrition tracking. We combined our expertise in computer vision, AI, and IOT hardware to create a comprehensive solution.
              </p>
              <p className="text-gray-700 mb-6">
                Our ESP32-CAM integration offers a unique approach to food logging, making the process simple and accurate. The custom IOT hardware works seamlessly with our software to provide a complete nutrition tracking system.
              </p>
              <p className="text-gray-700">
                We're passionate about making nutrition tracking accessible and accurate for everyone, helping users make informed decisions about their health.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-3"
            >
              <div className="bg-white p-6 rounded-xl shadow-md overflow-hidden">
                <Image
                  src="/team.jpg"
                  alt="The Kcalculate AI Team"
                  width={800}
                  height={500}
                  className="w-full h-auto rounded-lg"
                />
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {['AI & Computer Vision', 'IOT Hardware Integration', 'Nutrition Science', 'User Experience'].map((specialty, i) => (
                    <div key={i} className="bg-[#ABD483]/10 p-3 rounded-lg text-center">
                      <p className="text-[#8BAA7C] font-medium text-sm">{specialty}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div> */}

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
            Join our growing community of users who are taking control of their nutrition with Kcalculate AI.
          </p>

          <div className="flex justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-[#010100] rounded-lg font-bold text-sm sm:text-lg shadow-xl shadow-[#010100]/10 hover:shadow-2xl hover:shadow-[#010100]/20 transition-all duration-300"
            >
              Start Your Journey
              <BadgeCheck className="ml-2 h-4 w-4 sm:h-5 sm:w-5 text-[#FC842D]" />
            </Link>
          </div>

          <div className="mt-10 flex flex-col md:flex-row items-center justify-center gap-8">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-white" />
              <span className="text-white font-medium">Easy to Use</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-white" />
              <span className="text-white font-medium">Accurate Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-white" />
              <span className="text-white font-medium">Personalized Insights</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}