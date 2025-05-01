import tkinter as tk
from tkinter import ttk, scrolledtext
import threading
import requests
import base64
import json
import webbrowser
import cv2
import numpy as np
import time
from io import BytesIO
from PIL import Image, ImageTk
from urllib.request import urlopen

# Configuration
DEFAULT_CAM_IP = "192.168.1.4"  # Your ESP32-CAM IP - update this!
DEFAULT_API_URL = "https://kcalculateai.vercel.app"  # Base API URL
DEFAULT_USER_EMAIL = "krishnaingalgi10@gmail.com"  # Your email
DEFAULT_USER_PASSWORD = "iaAyjjLHa4psTyQ"  # Your password

class FoodAnalyzerApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Food Analyzer - ESP32-CAM to KCalculateAI")
        self.root.geometry("1000x800")
        
        # Variables
        self.cam_ip_var = tk.StringVar(value=DEFAULT_CAM_IP)
        self.api_url_var = tk.StringVar(value=DEFAULT_API_URL)
        self.email_var = tk.StringVar(value=DEFAULT_USER_EMAIL)
        self.password_var = tk.StringVar(value=DEFAULT_USER_PASSWORD)
        self.status_var = tk.StringVar(value="Ready")
        self.cloudinary_url = None
        self.streaming = False
        self.stream_thread = None
        
        # Authentication state
        self.auth_token = None
        self.user_id = None
        self.user_name = None
        self.session = None
        
        # Create main frame with padding
        main_frame = ttk.Frame(root, padding="10")
        main_frame.pack(fill="both", expand=True)
        
        # Top section - Settings and controls
        top_frame = ttk.Frame(main_frame)
        top_frame.pack(fill="x", pady=5)
        
        # Camera settings
        settings_frame = ttk.LabelFrame(top_frame, text="Settings", padding="10")
        settings_frame.pack(side="left", fill="y", padx=5)
        
        ttk.Label(settings_frame, text="ESP32-CAM IP:").grid(row=0, column=0, sticky="w", padx=5, pady=5)
        ip_entry = ttk.Entry(settings_frame, textvariable=self.cam_ip_var, width=15)
        ip_entry.grid(row=0, column=1, sticky="w", padx=5, pady=5)
        
        ttk.Label(settings_frame, text="API URL:").grid(row=1, column=0, sticky="w", padx=5, pady=5)
        ttk.Entry(settings_frame, textvariable=self.api_url_var, width=30).grid(row=1, column=1, sticky="w", padx=5, pady=5)
        
        ttk.Label(settings_frame, text="Email:").grid(row=2, column=0, sticky="w", padx=5, pady=5)
        ttk.Entry(settings_frame, textvariable=self.email_var, width=30).grid(row=2, column=1, sticky="w", padx=5, pady=5)
        
        ttk.Label(settings_frame, text="Password:").grid(row=3, column=0, sticky="w", padx=5, pady=5)
        password_entry = ttk.Entry(settings_frame, textvariable=self.password_var, width=30, show="*")
        password_entry.grid(row=3, column=1, sticky="w", padx=5, pady=5)
        
        # Connect and Login buttons
        button_frame = ttk.Frame(settings_frame)
        button_frame.grid(row=4, column=0, columnspan=2, pady=10)
        
        self.login_btn = ttk.Button(button_frame, text="Login to API", command=self.login_to_api, width=15)
        self.login_btn.pack(side="left", padx=5)
        
        self.connect_btn = ttk.Button(button_frame, text="Connect Camera", command=self.toggle_stream, width=15)
        self.connect_btn.pack(side="left", padx=5)
        
        # Authentication status
        self.auth_label = ttk.Label(settings_frame, text="Not authenticated", foreground="red")
        self.auth_label.grid(row=5, column=0, columnspan=2, pady=5)
        
        # Action buttons
        button_frame = ttk.Frame(top_frame)
        button_frame.pack(side="right", fill="y", padx=5)
        
        self.stream_btn = ttk.Button(button_frame, text="Start Stream", command=self.toggle_stream, width=20)
        self.stream_btn.pack(pady=5)
        
        self.capture_btn = ttk.Button(button_frame, text="Capture Image", command=self.capture_image, width=20)
        self.capture_btn.pack(pady=5)
        self.capture_btn.config(state="disabled")
        
        self.analyze_btn = ttk.Button(button_frame, text="Analyze Food", command=self.analyze_food, width=20)
        self.analyze_btn.pack(pady=5)
        self.analyze_btn.config(state="disabled")
        
        self.view_url_btn = ttk.Button(button_frame, text="View on Cloudinary", command=self.open_cloudinary_url, width=20)
        self.view_url_btn.pack(pady=5)
        self.view_url_btn.config(state="disabled")
        
        # Open Web App button
        self.open_web_btn = ttk.Button(button_frame, text="Open KCalculateAI", 
                                       command=lambda: webbrowser.open(self.api_url_var.get()), 
                                       width=20)
        self.open_web_btn.pack(pady=5)
        
        # Middle section - Image and details (using PanedWindow for resizable areas)
        middle_pane = ttk.PanedWindow(main_frame, orient=tk.HORIZONTAL)
        middle_pane.pack(fill="both", expand=True, pady=10)
        
        # Left pane for video/image
        left_frame = ttk.Frame(middle_pane)
        middle_pane.add(left_frame, weight=2)
        
        # Video display frame
        self.video_frame = ttk.LabelFrame(left_frame, text="Live Stream / Captured Image")
        self.video_frame.pack(fill="both", expand=True, padx=5, pady=5)
        
        self.video_label = ttk.Label(self.video_frame)
        self.video_label.pack(fill="both", expand=True, padx=5, pady=5)
        
        # Right pane for results
        right_frame = ttk.Frame(middle_pane)
        middle_pane.add(right_frame, weight=1)
        
        # Results display
        self.results_frame = ttk.LabelFrame(right_frame, text="Food Analysis Results")
        self.results_frame.pack(fill="both", expand=True, padx=5, pady=5)
        
        # Create a frame for the food name with larger font
        food_frame = ttk.Frame(self.results_frame)
        food_frame.pack(fill="x", padx=10, pady=5)
        
        ttk.Label(food_frame, text="Food:").pack(side="left", padx=5)
        self.food_name_var = tk.StringVar(value="--")
        self.food_name_label = ttk.Label(food_frame, textvariable=self.food_name_var, font=("Arial", 12, "bold"))
        self.food_name_label.pack(side="left", padx=5)
        
        # Nutrition information with progress bars
        nutrition_frame = ttk.Frame(self.results_frame)
        nutrition_frame.pack(fill="both", expand=True, padx=10, pady=5)
        
        # Calories
        ttk.Label(nutrition_frame, text="Calories:").grid(row=0, column=0, sticky="w", padx=5, pady=5)
        self.calories_var = tk.StringVar(value="-- kcal")
        ttk.Label(nutrition_frame, textvariable=self.calories_var, width=10).grid(row=0, column=1, sticky="w", padx=5, pady=5)
        self.calories_progress = ttk.Progressbar(nutrition_frame, orient="horizontal", length=150, mode="determinate")
        self.calories_progress.grid(row=0, column=2, sticky="w", padx=5, pady=5)
        
        # Proteins
        ttk.Label(nutrition_frame, text="Proteins:").grid(row=1, column=0, sticky="w", padx=5, pady=5)
        self.proteins_var = tk.StringVar(value="-- g")
        ttk.Label(nutrition_frame, textvariable=self.proteins_var, width=10).grid(row=1, column=1, sticky="w", padx=5, pady=5)
        self.proteins_progress = ttk.Progressbar(nutrition_frame, orient="horizontal", length=150, mode="determinate", style="Protein.Horizontal.TProgressbar")
        self.proteins_progress.grid(row=1, column=2, sticky="w", padx=5, pady=5)
        
        # Carbs
        ttk.Label(nutrition_frame, text="Carbs:").grid(row=2, column=0, sticky="w", padx=5, pady=5)
        self.carbs_var = tk.StringVar(value="-- g")
        ttk.Label(nutrition_frame, textvariable=self.carbs_var, width=10).grid(row=2, column=1, sticky="w", padx=5, pady=5)
        self.carbs_progress = ttk.Progressbar(nutrition_frame, orient="horizontal", length=150, mode="determinate", style="Carb.Horizontal.TProgressbar")
        self.carbs_progress.grid(row=2, column=2, sticky="w", padx=5, pady=5)
        
        # Fats
        ttk.Label(nutrition_frame, text="Fats:").grid(row=3, column=0, sticky="w", padx=5, pady=5)
        self.fats_var = tk.StringVar(value="-- g")
        ttk.Label(nutrition_frame, textvariable=self.fats_var, width=10).grid(row=3, column=1, sticky="w", padx=5, pady=5)
        self.fats_progress = ttk.Progressbar(nutrition_frame, orient="horizontal", length=150, mode="determinate", style="Fat.Horizontal.TProgressbar")
        self.fats_progress.grid(row=3, column=2, sticky="w", padx=5, pady=5)
        
        # Cloudinary URL
        url_frame = ttk.Frame(self.results_frame)
        url_frame.pack(fill="x", padx=10, pady=5)
        
        ttk.Label(url_frame, text="Image URL:").pack(side="left", padx=5)
        self.url_var = tk.StringVar(value="--")
        ttk.Label(url_frame, textvariable=self.url_var, width=30, font=("Arial", 8), foreground="blue").pack(side="left", padx=5)
        
        # Log section
        log_frame = ttk.LabelFrame(main_frame, text="Activity Log")
        log_frame.pack(fill="x", pady=10)
        
        self.log_text = scrolledtext.ScrolledText(log_frame, height=6, wrap=tk.WORD)
        self.log_text.pack(fill="both", expand=True, padx=5, pady=5)
        
        # Status bar
        status_frame = ttk.Frame(root)
        status_frame.pack(fill="x", side="bottom", pady=5)
        
        ttk.Label(status_frame, text="Status:").pack(side="left", padx=5)
        ttk.Label(status_frame, textvariable=self.status_var, font=("Arial", 9, "bold")).pack(side="left", padx=5)
        
        # Configure progress bar styles
        style = ttk.Style()
        style.configure("Protein.Horizontal.TProgressbar", background='#4CAF50')  # Green
        style.configure("Carb.Horizontal.TProgressbar", background='#FFC107')     # Yellow
        style.configure("Fat.Horizontal.TProgressbar", background='#F44336')      # Red
        
        # Initialize
        self.current_image = None
        self.log("Application started. Login to API and connect to ESP32-CAM to begin.")
        
        # Set up window close event
        self.root.protocol("WM_DELETE_WINDOW", self.on_closing)
    
    def log(self, message):
        """Add a message to the log"""
        self.log_text.insert(tk.END, f"[{self.get_time_stamp()}] {message}\n")
        self.log_text.see(tk.END)
        print(message)
    
    def get_time_stamp(self):
        """Return a formatted timestamp"""
        from datetime import datetime
        return datetime.now().strftime("%H:%M:%S")
    
    def set_status(self, message):
        """Update status message"""
        self.status_var.set(message)
        self.root.update_idletasks()
    
    def login_to_api(self):
        """Login to the API to get auth token"""
        self.set_status("Logging in...")
        self.login_btn.config(state="disabled")
        
        # Run in a thread to keep UI responsive
        threading.Thread(target=self._login_thread, daemon=True).start()
    
    def _login_thread(self):
        try:
            api_base = self.api_url_var.get()
            login_url = f"{api_base}/auth/login"
            
            # Prepare login payload
            payload = {
                "email": self.email_var.get(),
                "password": self.password_var.get()
            }
            
            self.log(f"Logging in as {payload['email']}...")
            
            # Create session to handle cookies
            session = requests.Session()
            
            # Send login request
            response = session.post(
                login_url,
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            # Check response
            if response.status_code == 200:
                result = response.json()
                if result.get("success"):
                    # Store user info
                    user_data = result.get("user", {})
                    self.user_id = user_data.get("id")
                    self.user_name = user_data.get("name")
                    
                    # Get auth token from cookies
                    cookies = session.cookies
                    for cookie in cookies:
                        if cookie.name == "nutritrack_auth_token":
                            self.auth_token = cookie.value
                            self.log("Authentication token retrieved from cookies")
                            break
                    
                    # Log all cookies for debugging
                    self.log(f"All cookies: {[c.name for c in cookies]}")
                    
                    if self.auth_token:
                        self.log(f"Login successful! Welcome, {self.user_name}")
                        self.root.after(0, lambda: self.auth_label.config(
                            text=f"Authenticated as {self.user_name}", 
                            foreground="green"
                        ))
                        self.set_status("Logged in successfully")
                    else:
                        # If we couldn't get the token from cookies, try response body
                        # This depends on how your API returns the token
                        self.log("Token not found in cookies, checking response body...")
                        self.log(f"API response: {json.dumps(result)}")
                        
                        # Store the session for future use (even without explicit token)
                        self.session = session
                        
                        self.log("Using session-based authentication instead of token")
                        self.root.after(0, lambda: self.auth_label.config(
                            text=f"Authenticated as {self.user_name} (session)", 
                            foreground="green"
                        ))
                        self.set_status("Logged in with session")
                else:
                    self.log(f"Login failed: {result.get('message', 'Unknown error')}")
                    self.set_status("Login failed")
            else:
                self.log(f"Login failed with status code: {response.status_code}")
                self.log(f"Response: {response.text}")
                self.set_status("Login failed")
        
        except Exception as e:
            self.log(f"Login error: {str(e)}")
            self.set_status(f"Login error: {str(e)}")
        finally:
            self.root.after(0, lambda: self.login_btn.config(state="normal"))
    
    def toggle_stream(self):
        """Start or stop the video stream"""
        if not self.streaming:
            self.start_stream()
        else:
            self.stop_stream()
    
    def start_stream(self):
        """Start the video stream"""
        if self.streaming:
            return
        
        self.streaming = True
        self.stream_btn.config(text="Stop Stream")
        self.capture_btn.config(state="normal")
        self.set_status(f"Connecting to stream at {self.cam_ip_var.get()}...")
        
        # Start stream in a new thread
        self.stream_thread = threading.Thread(target=self._stream_thread, daemon=True)
        self.stream_thread.start()
    
    def stop_stream(self):
        """Stop the video stream"""
        self.streaming = False
        self.stream_btn.config(text="Start Stream")
        self.set_status("Stream stopped")
        self.log("Stream stopped")
    
    def _stream_thread(self):
        """Thread function for video streaming"""
        # Stream URL for ESP32-CAM
        stream_url = f"http://{self.cam_ip_var.get()}:81/stream"
        
        try:
            # Use OpenCV to capture stream
            cap = cv2.VideoCapture(stream_url)
            
            if not cap.isOpened():
                self.log(f"Error: Couldn't open stream at {stream_url}")
                self.root.after(0, lambda: self.set_status(f"Error: Couldn't open stream"))
                self.root.after(0, lambda: self.stream_btn.config(text="Start Stream"))
                self.streaming = False
                return
            
            self.log(f"Stream started from {stream_url}")
            self.root.after(0, lambda: self.set_status("Streaming"))
            
            # Read frames in a loop
            while self.streaming:
                ret, frame = cap.read()
                if not ret:
                    time.sleep(0.1)  # Short delay before retry
                    continue
                
                # Convert frame to format tkinter can display
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                img = Image.fromarray(frame_rgb)
                
                # Scale the image to fit the display area
                width, height = 640, 480  # Default size
                try:
                    # Try to get the actual widget size
                    widget_width = self.video_label.winfo_width()
                    widget_height = self.video_label.winfo_height()
                    
                    if widget_width > 50 and widget_height > 50:  # Ensure valid dimensions
                        width, height = widget_width, widget_height
                except:
                    pass
                
                # Resize while maintaining aspect ratio
                img_width, img_height = img.size
                ratio = min(width/img_width, height/img_height)
                new_size = (int(img_width * ratio), int(img_height * ratio))
                img = img.resize(new_size, Image.LANCZOS)
                
                # Convert to PhotoImage
                photo = ImageTk.PhotoImage(image=img)
                
                # Update the label with the new image
                self.root.after(0, lambda p=photo: self._update_video_label(p))
                
                # Small delay to not overwhelm the CPU
                time.sleep(0.03)
            
            # Cleanup
            cap.release()
            
        except Exception as e:
            self.log(f"Streaming error: {str(e)}")
            self.root.after(0, lambda: self.set_status(f"Streaming error: {str(e)}"))
            self.root.after(0, lambda: self.stream_btn.config(text="Start Stream"))
            self.streaming = False
    
    def _update_video_label(self, photo):
        """Update the video label with a new image"""
        if self.streaming:  # Only update if still streaming
            self.video_label.config(image=photo)
            self.video_label.image = photo  # Keep a reference
    
    def capture_image(self):
        """Capture an image from the ESP32-CAM"""
        self.set_status("Capturing image...")
        self.capture_btn.config(state="disabled")
        self.view_url_btn.config(state="disabled")
        self.cloudinary_url = None
        self.url_var.set("--")
        
        # Reset nutrition displays
        self.food_name_var.set("--")
        self.calories_var.set("-- kcal")
        self.proteins_var.set("-- g")
        self.carbs_var.set("-- g")
        self.fats_var.set("-- g")
        
        self.calories_progress["value"] = 0
        self.proteins_progress["value"] = 0
        self.carbs_progress["value"] = 0
        self.fats_progress["value"] = 0
        
        # Run in a thread to keep the UI responsive
        threading.Thread(target=self._capture_image_thread, daemon=True).start()
    
    def _capture_image_thread(self):
        try:
            # Get the image from the capture endpoint
            self.log(f"Requesting image from ESP32-CAM at {self.cam_ip_var.get()}")
            response = requests.get(f"http://{self.cam_ip_var.get()}/capture", timeout=10)
            response.raise_for_status()  # Raise exception for HTTP errors
            
            # Store the image data
            self.current_image = response.content
            self.log(f"Image captured successfully ({len(self.current_image)/1024:.1f} KB)")
            
            # Display the captured image
            self._update_captured_image(self.current_image)
            
            self.set_status("Image captured successfully")
            self.root.after(0, lambda: self.analyze_btn.config(state="normal"))
            
            # Save the image locally for debugging if needed
            with open("last_captured.jpg", "wb") as f:
                f.write(self.current_image)
            
        except Exception as e:
            self.log(f"Error capturing image: {str(e)}")
            self.set_status(f"Error: {str(e)}")
        finally:
            self.root.after(0, lambda: self.capture_btn.config(state="normal"))
    
    def _update_captured_image(self, image_data):
        """Update the display with the captured image"""
        try:
            # Convert to PIL Image
            img = Image.open(BytesIO(image_data))
            
            # Scale the image to fit the display area
            width, height = 640, 480  # Default size
            try:
                # Try to get the actual widget size
                widget_width = self.video_label.winfo_width()
                widget_height = self.video_label.winfo_height()
                
                if widget_width > 50 and widget_height > 50:  # Ensure valid dimensions
                    width, height = widget_width, widget_height
            except:
                pass
            
            # Resize while maintaining aspect ratio
            img_width, img_height = img.size
            ratio = min(width/img_width, height/img_height)
            new_size = (int(img_width * ratio), int(img_height * ratio))
            img = img.resize(new_size, Image.LANCZOS)
            
            # Convert to PhotoImage
            photo = ImageTk.PhotoImage(image=img)
            
            # Update the label
            self.video_label.config(image=photo)
            self.video_label.image = photo  # Keep a reference
        except Exception as e:
            self.log(f"Error displaying captured image: {str(e)}")
    
    def analyze_food(self):
        """Send the image to the API for analysis"""
        if not self.current_image:
            self.set_status("No image captured")
            return
        
        if (not self.user_id) and (not hasattr(self, 'session')):
            self.log("Authentication required. Please login first.")
            self.set_status("Authentication required")
            return
        
        self.set_status("Analyzing food...")
        self.analyze_btn.config(state="disabled")
        
        # Run in a thread to keep the UI responsive
        threading.Thread(target=self._analyze_food_thread, daemon=True).start()
    
    def _analyze_food_thread(self):
        try:
            # Convert image data to base64
            base64_data = base64.b64encode(self.current_image).decode('utf-8')
            image_base64 = f"data:image/jpeg;base64,{base64_data}"
            
            # Prepare the payload
            payload = {
                "userId": self.user_id,
                "image": image_base64
            }
            
            # API URL
            api_base = self.api_url_var.get()
            api_url = f"{api_base}/api/analyze-food"
            
            # Send the request to the API with authentication
            self.log(f"Sending image to API: {api_url}")
            
            # Headers
            headers = {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
            
            # Show payload size for debugging
            payload_size = len(json.dumps(payload))
            self.log(f"Payload size: {payload_size/1024:.1f} KB")
            
            # Determine which authentication method to use
            if hasattr(self, 'session') and self.session:
                # Use the stored session with cookies
                self.log("Using session-based authentication")
                response = self.session.post(
                    api_url, 
                    json=payload,
                    headers=headers,
                    timeout=90  # Extended timeout for Gemini API
                )
            elif self.auth_token:
                # Use explicit token authentication
                self.log("Using token-based authentication")
                
                # Create a new session with the auth token
                session = requests.Session()
                
                # Extract domain for cookie
                domain = api_base.split("//")[-1].split("/")[0]
                
                # Set cookie with the token
                session.cookies.set("nutritrack_auth_token", self.auth_token, domain=domain)
                
                # Make the request
                response = session.post(
                    api_url, 
                    json=payload,
                    headers=headers,
                    timeout=90
                )
            else:
                # No authentication available
                self.log("No authentication method available")
                self.set_status("Authentication required")
                return
            
            # Log response status
            self.log(f"API response status: {response.status_code}")
            
            # Check if the request was successful
            if response.status_code == 200:
                try:
                    result = response.json()
                    
                    if result.get("success"):
                        food_data = result.get("data", {})
                        food_name = food_data.get("foodName", "Unknown")
                        nutrition = food_data.get("nutrition", {})
                        
                        # Store Cloudinary URL
                        self.cloudinary_url = food_data.get("imageUrl")
                        if self.cloudinary_url:
                            self.url_var.set(self.cloudinary_url)
                            self.root.after(0, lambda: self.view_url_btn.config(state="normal"))
                        
                        # Update UI with the results
                        self.log(f"Analysis complete: {food_name}")
                        
                        # Update food name
                        self.root.after(0, lambda: self.food_name_var.set(food_name))
                        
                        # Update nutrition values and progress bars
                        calories = nutrition.get("calories", 0)
                        proteins = nutrition.get("proteins", 0)
                        carbs = nutrition.get("carbs", 0)
                        fats = nutrition.get("fats", 0)
                        
                        self.root.after(0, lambda: self.calories_var.set(f"{calories} kcal"))
                        self.root.after(0, lambda: self.proteins_var.set(f"{proteins} g"))
                        self.root.after(0, lambda: self.carbs_var.set(f"{carbs} g"))
                        self.root.after(0, lambda: self.fats_var.set(f"{fats} g"))
                        
                        # Set progress bars (relative to typical values)
                        # Typical values: 2000 calories, 50g protein, 300g carbs, 70g fat
                        self.root.after(0, lambda: self.calories_progress.configure(value=min(calories/20, 100)))
                        self.root.after(0, lambda: self.proteins_progress.configure(value=min(proteins*2, 100)))
                        self.root.after(0, lambda: self.carbs_progress.configure(value=min(carbs/3, 100)))
                        self.root.after(0, lambda: self.fats_progress.configure(value=min(fats*1.4, 100)))
                        
                        self.set_status(f"Food analyzed: {food_name}")
                    else:
                        error_msg = result.get('error', 'Unknown error')
                        self.log(f"API error: {error_msg}")
                        self.set_status(f"API error: {error_msg}")
                except json.JSONDecodeError as je:
                    self.log(f"JSON decode error: {str(je)}")
                    # Try to show some of the response text for debugging
                    self.log(f"Response text (truncated): {response.text[:200]}")
                    self.set_status("Invalid JSON response")
            elif response.status_code == 401 or response.status_code == 403:
                self.log("Authentication failed. Please login again.")
                self.set_status("Authentication failed")
                # Reset auth state
                self.auth_token = None
                self.user_id = None
                self.session = None
                self.root.after(0, lambda: self.auth_label.config(
                    text="Not authenticated", 
                    foreground="red"
                ))
            else:
                self.log(f"API request failed with status code: {response.status_code}")
                self.log(f"Response: {response.text[:200]}...")
                self.set_status(f"API request failed: {response.status_code}")
        
        except Exception as e:
            self.log(f"Error: {str(e)}")
            self.set_status(f"Error: {str(e)}")
        finally:
            self.root.after(0, lambda: self.analyze_btn.config(state="normal"))
    
    def open_cloudinary_url(self):
        """Open the Cloudinary URL in a web browser"""
        if self.cloudinary_url:
            self.log(f"Opening image URL in browser")
            webbrowser.open(self.cloudinary_url)
        else:
            self.log("No image URL available")
    
    def on_closing(self):
        """Handle window close event"""
        self.streaming = False
        if self.stream_thread and self.stream_thread.is_alive():
            self.stream_thread.join(1.0)  # Wait for thread to finish, with timeout
        self.root.destroy()

if __name__ == "__main__":
    root = tk.Tk()
    app = FoodAnalyzerApp(root)
    root.mainloop()