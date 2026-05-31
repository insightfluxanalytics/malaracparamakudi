// Malar A/C Mechanic & Service - Client Scripts

document.addEventListener('DOMContentLoaded', () => {
  
  // 1. Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // --- Leaflet.js GPS Map Integration ---
  let map, marker;
  const defaultLat = 9.9252;
  const defaultLng = 78.1198; // Madurai central

  const addressMapContainer = document.getElementById('addressMap');
  const addressTextarea = document.getElementById('address');
  const coordsDisplay = document.getElementById('coordsDisplay');
  const latInput = document.getElementById('latitude');
  const lngInput = document.getElementById('longitude');
  const detectLocationBtn = document.getElementById('detectLocationBtn');

  if (addressMapContainer && addressTextarea) {
    try {
      // 1. Initialize Map centered on Madurai
      map = L.map('addressMap').setView([defaultLat, defaultLng], 13);

      // 2. Add OpenStreetMap Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // 3. Add Custom Draggable Marker
      marker = L.marker([defaultLat, defaultLng], {
        draggable: true
      }).addTo(map);

      // Set initial values without forcing geocode to prevent blank page load slow
      updateCoordinates(defaultLat, defaultLng, false);

      // 4. Marker Drag-End Listener
      marker.on('dragend', () => {
        const position = marker.getLatLng();
        updateCoordinates(position.lat, position.lng, true);
      });

      // 5. Map Click Listener
      map.on('click', (e) => {
        marker.setLatLng(e.latlng);
        updateCoordinates(e.latlng.lat, e.latlng.lng, true);
      });

      // 6. Detect Current Location Button Listener
      if (detectLocationBtn) {
        detectLocationBtn.addEventListener('click', () => {
          if (navigator.geolocation) {
            detectLocationBtn.disabled = true;
            const originalText = detectLocationBtn.innerHTML;
            detectLocationBtn.innerHTML = `<span>⏳ Locating...</span>`;
            
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                
                // Move map and marker to current location
                map.setView([lat, lng], 16);
                marker.setLatLng([lat, lng]);
                
                updateCoordinates(lat, lng, true);
                
                detectLocationBtn.disabled = false;
                detectLocationBtn.innerHTML = originalText;
              },
              (error) => {
                console.error("Geolocation error:", error);
                alert("Could not detect your automatic GPS location. Please drag the pin on the map to set your address manually!");
                detectLocationBtn.disabled = false;
                detectLocationBtn.innerHTML = originalText;
              },
              { enableHighAccuracy: true, timeout: 8000 }
            );
          } else {
            alert("Geolocation is not supported by your browser. Please drag the pin on the map manually!");
          }
        });
      }
    } catch (err) {
      console.error("Error loading Leaflet map:", err);
    }
  }

  // Helper to reverse geocode and update coordinates fields
  function updateCoordinates(lat, lng, shouldGeocode) {
    if (latInput) latInput.value = lat.toFixed(6);
    if (lngInput) lngInput.value = lng.toFixed(6);
    
    if (coordsDisplay) {
      coordsDisplay.textContent = `GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }

    if (shouldGeocode && addressTextarea) {
      const originalPlaceholder = addressTextarea.placeholder;
      addressTextarea.value = "Fetching address for pinned location...";
      
      // Fetch reverse geocoding from free Nominatim API
      fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`)
        .then(res => res.json())
        .then(data => {
          if (data && data.display_name) {
            addressTextarea.value = data.display_name;
            addressTextarea.placeholder = originalPlaceholder;
          }
        })
        .catch(err => {
          console.warn("Reverse geocoding fetch failed:", err);
          addressTextarea.value = "";
          addressTextarea.placeholder = originalPlaceholder;
        });
    }
  }

  // 2. Set Current Year in Footer
  const yearSpan = document.getElementById('currentYear');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // 3. Mobile Navigation Menu Toggle
  const mobileToggle = document.querySelector('.mobile-menu-toggle');
  const mobileNavPanel = document.querySelector('.mobile-nav-panel');
  const menuIcon = document.querySelector('.menu-icon');
  const closeIcon = document.querySelector('.close-icon');

  if (mobileToggle && mobileNavPanel) {
    mobileToggle.addEventListener('click', () => {
      const isHidden = mobileNavPanel.classList.contains('hidden');
      if (isHidden) {
        mobileNavPanel.classList.remove('hidden');
        menuIcon.classList.add('hidden');
        closeIcon.classList.remove('hidden');
      } else {
        mobileNavPanel.classList.add('hidden');
        menuIcon.classList.remove('hidden');
        closeIcon.classList.add('hidden');
      }
    });

    // Close panel when clicking on a navigation link
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileNavPanel.classList.add('hidden');
        menuIcon.classList.remove('hidden');
        closeIcon.classList.add('hidden');
      });
    });
  }

  // 4. Smooth Scrolling & Active Link Highlighting on Scroll
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section');

  window.addEventListener('scroll', () => {
    let currentSectionId = '';
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      // Use offset of sticky header (~80px) for highlight calculation
      if (window.scrollY >= (sectionTop - 120)) {
        currentSectionId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
  });

  // 5. Gallery Lightbox Modal
  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightboxModal = document.getElementById('galleryLightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.querySelector('.lightbox-close');

  if (galleryItems && lightboxModal && lightboxImg && lightboxCaption) {
    galleryItems.forEach(item => {
      item.addEventListener('click', () => {
        const img = item.querySelector('.gallery-image');
        const caption = item.getAttribute('data-title') || img.getAttribute('alt');
        
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightboxCaption.textContent = caption;
        lightboxModal.classList.remove('hidden');
        
        // Prevent body scrolling when modal is open
        document.body.style.overflow = 'hidden';
      });
    });

    const closeModal = () => {
      lightboxModal.classList.add('hidden');
      lightboxImg.src = '';
      lightboxImg.alt = '';
      lightboxCaption.textContent = '';
      document.body.style.overflow = '';
    };

    lightboxClose.addEventListener('click', closeModal);
    
    // Close when clicking outside the content image
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) {
        closeModal();
      }
    });

    // Close on Escape key press
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !lightboxModal.classList.contains('hidden')) {
        closeModal();
      }
    });
  }

  // 6. WhatsApp Floating Button Actions
  const whatsappFloatingBtn = document.getElementById('whatsappFloatingBtn');
  const contactPhoneNumber = '9750106378';

  if (whatsappFloatingBtn) {
    whatsappFloatingBtn.addEventListener('click', () => {
      const text = "Hello! I'm interested in your A/C, Fridge, or Washing Machine services. Please let me know how I can get assistance.";
      const encodedText = encodeURIComponent(text);
      const whatsappUrl = `https://wa.me/91${contactPhoneNumber}?text=${encodedText}`;
      window.open(whatsappUrl, '_blank');
    });
  }

  // 7. Service Booking Form WhatsApp Redirect
  const bookingForm = document.getElementById('serviceBookingForm');

  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Gather input values
      const customerName = document.getElementById('customerName').value.trim();
      const phoneNumber = document.getElementById('phoneNumber').value.trim();
      const email = document.getElementById('email').value.trim();
      const serviceType = document.getElementById('serviceType').value;
      const preferredDate = document.getElementById('preferredDate').value;
      const preferredTime = document.getElementById('preferredTime').value;
      const address = document.getElementById('address').value.trim();
      const message = document.getElementById('message').value.trim();
      
      // Capturing interactive map GPS coordinates
      const latitude = document.getElementById('latitude').value || "9.9252";
      const longitude = document.getElementById('longitude').value || "78.1198";
      const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

      // Form validation
      if (!customerName || customerName.length > 100) {
        alert("Please enter a valid name (max 100 characters).");
        return;
      }
      if (!phoneNumber || !/^[0-9]{10}$/.test(phoneNumber)) {
        alert("Please enter a valid 10-digit mobile number.");
        return;
      }
      if (!serviceType) {
        alert("Please select a service type.");
        return;
      }
      if (!address || address.length > 500) {
        alert("Please enter a valid service address (max 500 characters).");
        return;
      }

      // Format WhatsApp booking text template
      const formattedMessage = `🔧 *New Service Booking Request*

👤 *Customer:* ${customerName}
📞 *Phone:* ${phoneNumber}
📧 *Email:* ${email || "Not provided"}

🛠️ *Service:* ${serviceType}
📅 *Preferred Date:* ${preferredDate || "Not specified"}
⏰ *Preferred Time:* ${preferredTime || "Not specified"}

📍 *Address:* ${address}
🗺️ *Doorstep GPS Route:* ${googleMapsLink}

💬 *Message:* ${message || "No additional message"}`;

      const newBooking = {
        id: 'booking_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        customerName,
        phoneNumber,
        email,
        serviceType,
        preferredDate,
        preferredTime,
        address,
        message,
        latitude,
        longitude,
        googleMapsLink,
        status: 'Pending',
        timestamp: new Date().toISOString()
      };

      // Save to localStorage for Admin Owner Portal
      try {
        const bookings = JSON.parse(localStorage.getItem('malar_bookings')) || [];
        bookings.push(newBooking);
        localStorage.setItem('malar_bookings', JSON.stringify(bookings));
      } catch (err) {
        console.error("Error saving booking locally:", err);
      }

      // Send to central Cloud Database in background (highly persistent and zero-config)
      const cloudDbUrl = (window.location.hostname === '' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        ? 'https://malaracparamakudi.vercel.app/api/bookings'
        : '/api/bookings';
      fetch(cloudDbUrl)
        .then(res => res.json())
        .then(resData => {
          const currentBookings = Array.isArray(resData.data) ? resData.data : [];
          // Make sure booking isn't already added
          if (!currentBookings.some(b => b.id === newBooking.id)) {
            currentBookings.push(newBooking);
          }
          return fetch(cloudDbUrl, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(currentBookings)
          });
        })
        .then(() => {
          console.log("Booking successfully synced to Admin Cloud Database.");
        })
        .catch(err => {
          console.warn("Cloud Database offline. Booking saved locally in browser.", err);
        });

      // Build and open WhatsApp API link synchronously (to bypass popup blockers)
      const encodedMsg = encodeURIComponent(formattedMessage);
      const whatsappUrl = `https://wa.me/91${contactPhoneNumber}?text=${encodedMsg}`;
      
      try {
        const newWindow = window.open(whatsappUrl, '_blank');
        if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
          // If popup blocker blocked the new tab, redirect the current tab directly
          window.location.href = whatsappUrl;
        }
      } catch (err) {
        console.warn("Popup blocked or failed, redirecting tab directly:", err);
        window.location.href = whatsappUrl;
      }

      // Clear the form instantly
      alert("Success! Your doorstep booking request has been saved. Opening WhatsApp to send your confirmation...");
      bookingForm.reset();
    });
  }
  // 8. AI Chatbot Widget Logic
  const aiChatLauncher = document.getElementById('aiChatLauncher');
  const aiChatWindow = document.getElementById('aiChatWindow');
  const closeChatBtn = document.getElementById('closeChatBtn');
  const chatInputForm = document.getElementById('chatInputForm');
  const chatInputText = document.getElementById('chatInputText');
  const chatMessages = document.getElementById('chatMessages');
  const quickReplyChips = document.querySelectorAll('.quick-reply-chip');

  if (aiChatLauncher && aiChatWindow && closeChatBtn && chatInputForm) {
    // Open chat window
    aiChatLauncher.addEventListener('click', () => {
      aiChatWindow.classList.remove('hidden');
      aiChatLauncher.classList.add('hidden');
      chatInputText.focus();
      scrollChatToBottom();
    });

    // Close chat window
    closeChatBtn.addEventListener('click', () => {
      aiChatWindow.classList.add('hidden');
      aiChatLauncher.classList.remove('hidden');
    });

    // Handle Quick Reply Chips
    quickReplyChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const query = chip.getAttribute('data-query');
        submitUserQuery(query);
      });
    });

    // Handle input form submit
    chatInputForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = chatInputText.value.trim();
      if (!query) return;
      
      chatInputText.value = '';
      submitUserQuery(query);
    });
  }

  function scrollChatToBottom() {
    if (chatMessages) {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }

  function addChatMessage(sender, text, isHtml = false) {
    if (!chatMessages) return;

    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chat-message', sender);

    const bubbleDiv = document.createElement('div');
    bubbleDiv.classList.add('message-bubble');
    if (isHtml) {
      bubbleDiv.innerHTML = text;
    } else {
      bubbleDiv.textContent = text;
    }

    const timeSpan = document.createElement('span');
    timeSpan.classList.add('message-time');
    timeSpan.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    messageDiv.appendChild(bubbleDiv);
    messageDiv.appendChild(timeSpan);
    chatMessages.appendChild(messageDiv);
    scrollChatToBottom();
  }

  function showTypingIndicator() {
    if (!chatMessages) return null;

    const indicatorDiv = document.createElement('div');
    indicatorDiv.classList.add('chat-message', 'bot');

    const bubbleDiv = document.createElement('div');
    bubbleDiv.classList.add('message-bubble', 'typing-indicator');
    bubbleDiv.innerHTML = '<span></span><span></span><span></span>';

    indicatorDiv.appendChild(bubbleDiv);
    chatMessages.appendChild(indicatorDiv);
    scrollChatToBottom();
    
    return indicatorDiv;
  }

  function submitUserQuery(query) {
    // Add user message
    addChatMessage('user', query);

    // Show bot typing indicator
    const indicator = showTypingIndicator();

    // Generate reply with realistic delay
    setTimeout(() => {
      if (indicator) {
        indicator.remove();
      }
      const response = generateAIResponse(query);
      addChatMessage('bot', response, true);
    }, 1000 + Math.random() * 800);
  }

  function generateAIResponse(query) {
    const q = query.toLowerCase();
    
    // 1. Booking related queries
    if (q.includes('book') || q.includes('schedule') || q.includes('appoint') || q.includes('hire') || q.includes('request')) {
      return `To book a doorstep repair or maintenance service, you can fill out our <a href="#booking" style="color:var(--primary-dark); font-weight:700; text-decoration:underline;">Doorstep Service Form</a> directly on this page, or chat with us on <a href="https://wa.me/919750106378" target="_blank" style="color:var(--whatsapp-hover); font-weight:700; text-decoration:underline;">WhatsApp</a> to coordinate immediately!`;
    }

    // 2. Services related queries
    if (q.includes('service') || q.includes('repair') || q.includes('fix') || q.includes('installation') || q.includes('maintain') || q.includes('do you do') || q.includes('what do you')) {
      return `We specialize in <strong>Repair, Installation, and Sales</strong> for three major home appliances:<br/>
      1. ❄️ <strong>Air Conditioners (A/C):</strong> Servicing, gas refilling, coil repairs, split/window AC installation & sales.<br/>
      2. 🧺 <strong>Washing Machines:</strong> Drum, motor, and wiring repairs for top load, front load & semi-automatic models.<br/>
      3. 🧊 <strong>Refrigerators (Fridges):</strong> Compressor charging, gas filling, thermostat changes for single/double door fridges.<br/><br/>
      All services are done at your doorstep.`;
    }

    // 3. Timings/Hours queries
    if (q.includes('time') || q.includes('hour') || q.includes('open') || q.includes('when') || q.includes('day') || q.includes('schedule')) {
      return `Our working hours are:<br/>
      📅 <strong>Monday to Saturday</strong><br/>
      ⏰ <strong>9:00 AM - 9:00 PM</strong><br/><br/>
      We provide doorstep services within these slots, and quick responses for emergency calls.`;
    }

    // 4. Contact/Phone/Owner queries
    if (q.includes('phone') || q.includes('contact') || q.includes('number') || q.includes('call') || q.includes('owner') || q.includes('rajakumar') || q.includes('name')) {
      return `Malar A/C Mechanic & Service is owned and operated by expert technician <strong>B. RAJAKUMAR</strong>.<br/><br/>
      📞 Phone: <a href="tel:9750106378" style="color:var(--primary-dark); font-weight:700; text-decoration:underline;">9750106378</a><br/>
      📍 Service Area: Doorstep service across all local areas.<br/>
      💬 WhatsApp: <a href="https://wa.me/919750106378" target="_blank" style="color:var(--whatsapp-hover); font-weight:700; text-decoration:underline;">Click to Chat</a>`;
    }

    // 5. Pricing queries
    if (q.includes('price') || q.includes('cost') || q.includes('rate') || q.includes('charge') || q.includes('fee') || q.includes('how much')) {
      return `We pride ourselves on offering very <strong>affordable and competitive pricing</strong>. Recharging gas, installing units, or replacing minor parts is quoted upfront so there are no surprises.<br/><br/>
      Please call B. Rajakumar at <a href="tel:9750106378" style="color:var(--primary-dark); font-weight:700; text-decoration:underline;">9750106378</a> or drop a WhatsApp request for a quick, free quote based on your appliance issue!`;
    }

    // 6. Specific brands queries
    if (q.includes('lg') || q.includes('samsung') || q.includes('whirlpool') || q.includes('godrej') || q.includes('panasonic') || q.includes('daikin') || q.includes('carrier') || q.includes('voltas') || q.includes('haier') || q.includes('ifb') || q.includes('brand')) {
      return `Yes! We service and repair <strong>all major brands and models</strong>, including Samsung, LG, Whirlpool, Voltas, Daikin, Godrej, Panasonic, IFB, and Haier. We only use certified spare parts for repairs.`;
    }

    // 7. A/C specific queries
    if (q.includes('ac ') || q.includes(' a/c') || q.includes('air cond') || q.includes('cooling') || q.includes('gas refil')) {
      return `We provide complete A/C solutions: regular maintenance cleaning, leak detection, gas charging/refilling, cooling optimization, capacitor replacements, and installation/sales of split and window A/C units.`;
    }

    // 8. Refrigerator/Fridge queries
    if (q.includes('refrigerator') || q.includes('fridge') || q.includes('double door') || q.includes('single door') || q.includes('cooling issue')) {
      return `Our refrigerator services include compressor repair and replacement, gas charging, door gasket repair, thermostat adjustment, and defrost issues for single door, double door, and smart fridges.`;
    }

    // 9. Washing Machine queries
    if (q.includes('wash') || q.includes('machine') || q.includes('spin') || q.includes('dry') || q.includes('drain')) {
      return `We repair top load, front load, and semi-automatic washing machines. Common issues we resolve: drum vibrations, motor failure, timer/board faults, drainage issues, inlet valve repairs, and wiring.`;
    }

    // 10. Greetings
    if (q.includes('hi') || q.includes('hello') || q.includes('hey') || q.includes('greetings') || q.includes('welcome')) {
      return `Hello! How can I assist you with your appliance service needs today? Feel free to ask about A/C, Fridge, or Washing Machine repairs, sales, or pricing.`;
    }

    // Fallback response
    return `Thank you for asking! I'm trained specifically to help with Malar A/C Mechanic & Service queries (timings, services, booking, owner details).<br/><br/>
    For direct details on this custom query, please dial <a href="tel:9750106378" style="color:var(--primary-dark); font-weight:700; text-decoration:underline;">9750106378</a> to speak with <strong>B. Rajakumar</strong>, or send us a message on <a href="https://wa.me/919750106378" target="_blank" style="color:var(--whatsapp-hover); font-weight:700; text-decoration:underline;">WhatsApp</a>.`;
  }

  // --- 9. Premium 3D Background Graphics Parallax Scrolling Effect ---
  const heroSection = document.getElementById('home');
  const bgRing = document.getElementById('bg3dRing');
  const bgTurbine = document.getElementById('bg3dTurbine');
  const bgCrystal = document.getElementById('bg3dCrystal');

  if (heroSection && (bgRing || bgTurbine || bgCrystal)) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const heroHeight = heroSection.clientHeight || 600;

      // Only calculate transforms when the hero section is visible in/near the viewport
      if (scrollY <= heroHeight + 100) {
        if (bgRing) bgRing.style.setProperty('--scroll-y', `${scrollY * -0.15}px`);
        if (bgTurbine) bgTurbine.style.setProperty('--scroll-y', `${scrollY * -0.25}px`);
        if (bgCrystal) bgCrystal.style.setProperty('--scroll-y', `${scrollY * -0.35}px`);
      }
    }, { passive: true });
  }

});
