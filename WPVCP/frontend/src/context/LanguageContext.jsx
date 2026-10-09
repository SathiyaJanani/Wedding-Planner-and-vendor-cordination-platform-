import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const LANGUAGES = [
  { code: 'en', label: 'English', nativeName: 'English' },
  { code: 'ta', label: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'te', label: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'ml', label: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'kn', label: 'Kannada', nativeName: 'ಕನ್ನಡ' }
];

export const TRANSLATIONS = {
  en: {
    // Brand & Common
    platform_name: 'Wedding Planner & Vendor Coordination',
    get_started: 'Get Started',
    login: 'Sign In',
    register: 'Create Account',
    logout: 'Sign Out',
    save_changes: 'Save Changes',
    cancel: 'Cancel',
    confirm: 'Confirm',
    submit: 'Submit',
    actions: 'Actions',
    status: 'Status',
    search: 'Search...',
    view_details: 'View Details',
    loading: 'Loading data...',
    role_planner: 'Wedding Planner',
    role_vendor: 'Verified Vendor',
    role_customer: 'Wedding Couple',
    role_admin: 'Platform Administrator',
    recently_accessed: 'Recently Accessed',

    // Navigations (Planner)
    nav_dashboard: 'Dashboard',
    nav_my_customers: 'My Customers',
    nav_customer_requests: 'Customer Requests',
    nav_wedding_projects: 'Wedding Projects',
    nav_vendor_directory: 'Vendor Directory',
    nav_vendor_category: 'Vendor Category',
    nav_vendor_availability: 'Vendor Availability',
    nav_vendor_requests: 'Vendor Requests',
    nav_request_tracking: 'Request Tracking',
    nav_selected_vendors: 'Selected Vendors',
    nav_service_management: 'Service Management',
    nav_wedding_schedule: 'Wedding Schedule',
    nav_budget_management: 'Budget Management',
    nav_payments: 'Payments & Milestones',
    nav_invoices: 'Invoices',
    nav_contracts_documents: 'Contracts & Documents',
    nav_messages: 'Messages',
    nav_notifications: 'Notifications',
    nav_reports: 'Reports & Analytics',
    nav_settings: 'Settings',

    // Navigations (Vendor)
    nav_my_profile: 'My Profile',
    nav_my_services: 'My Services',
    nav_service_categories: 'Service Categories',
    nav_availability_calendar: 'Availability Calendar',
    nav_booking_requests: 'Booking Requests',
    nav_pending_requests: 'Pending Requests',
    nav_accepted_bookings: 'Accepted Bookings',
    nav_declined_requests: 'Declined Requests',
    nav_my_schedule: 'My Schedule',
    nav_vendor_customers: 'Customers',
    nav_reviews_ratings: 'Reviews & Ratings',

    // Navigations (Customer)
    nav_my_wedding: 'My Wedding',
    nav_wedding_requirements: 'Wedding Requirements',
    nav_my_planner: 'My Planner',
    nav_vendor_selection: 'Vendor Selection',
    nav_booking_status: 'Booking Status',
    nav_budget_tracker: 'Budget Tracker',
    nav_wishlist: 'Wishlist',
    nav_support: 'Support Desk',

    // Settings
    settings_title: 'Platform Settings',
    settings_appearance: 'Appearance & Theme',
    settings_light_mode: 'Light Mode',
    settings_dark_mode: 'Dark Mode',
    settings_font_size: 'Font Size',
    settings_font_small: 'Small',
    settings_font_medium: 'Medium (Standard)',
    settings_font_large: 'Large',
    settings_font_xlarge: 'Extra Large',
    settings_language: 'Display Language',
    settings_account_security: 'Account & Security'
  },
  ta: {
    platform_name: 'திருமண திட்டமிடுபவர் & விற்பனையாளர் தளம்',
    get_started: 'தொடங்குங்கள்',
    login: 'உள்நுழைக',
    register: 'பதிவு செய்க',
    logout: 'வெளியேறு',
    save_changes: 'மாற்றங்களைச் சேமி',
    cancel: 'ரத்துசெய்',
    confirm: 'உறுதிசெய்',
    submit: 'சமர்ப்பி',
    actions: 'செயல்கள்',
    status: 'நிலை',
    search: 'தேடுக...',
    view_details: 'விவரங்களைக் காண்க',
    loading: 'தரவு ஏற்றப்படுகிறது...',
    role_planner: 'திருமண திட்டமிடுபவர்',
    role_vendor: 'சரிபார்க்கப்பட்ட விற்பனையாளர்',
    role_customer: 'திருமண தம்பதியர்',
    role_admin: 'தள நிர்வாகி',
    recently_accessed: 'சமீபத்தில் பார்த்தவை',

    // Navigations (Planner)
    nav_dashboard: 'டாஷ்போர்டு',
    nav_my_customers: 'என் வாடிக்கையாளர்கள்',
    nav_customer_requests: 'வாடிக்கையாளர் கோரிக்கைகள்',
    nav_wedding_projects: 'திருமண திட்டங்கள்',
    nav_vendor_directory: 'விற்பனையாளர் அடைவு',
    nav_vendor_category: 'விற்பனையாளர் வகை',
    nav_vendor_availability: 'விற்பனையாளர் கிடைக்கும் நிலை',
    nav_vendor_requests: 'விற்பனையாளர் கோரிக்கைகள்',
    nav_request_tracking: 'கோரிக்கை கண்காணிப்பு',
    nav_selected_vendors: 'தேர்ந்தெடுக்கப்பட்ட விற்பனையாளர்கள்',
    nav_service_management: 'சேவை மேலாண்மை',
    nav_wedding_schedule: 'திருமண அட்டவணை',
    nav_budget_management: 'பட்ஜெட் மேலாண்மை',
    nav_payments: 'கொடுப்பனவுகள் & மைல்கற்கள்',
    nav_invoices: 'விலைப்பட்டியல்கள்',
    nav_contracts_documents: 'ஒப்பந்தங்கள் & ஆவணங்கள்',
    nav_messages: 'செய்திகள்',
    nav_notifications: 'அறிவிப்புகள்',
    nav_reports: 'அறிக்கைகள் & பகுப்பாய்வு',
    nav_settings: 'அமைப்புகள்',

    // Navigations (Vendor)
    nav_my_profile: 'என் சுயவிவரம்',
    nav_my_services: 'என் சேவைகள்',
    nav_service_categories: 'சேவை வகைகள்',
    nav_availability_calendar: 'கிடைக்கும் நாள்காட்டி',
    nav_booking_requests: 'முன்பதிவு கோரிக்கைகள்',
    nav_pending_requests: 'நிலுவையில் உள்ள கோரிக்கைகள்',
    nav_accepted_bookings: 'ஏற்றுக்கொள்ளப்பட்ட முன்பதிவுகள்',
    nav_declined_requests: 'நிராகரிக்கப்பட்ட கோரிக்கைகள்',
    nav_my_schedule: 'என் அட்டவணை',
    nav_vendor_customers: 'வாடிக்கையாளர்கள்',
    nav_reviews_ratings: 'மதிப்புரைகள் & தரவரிசை',

    // Navigations (Customer)
    nav_my_wedding: 'என் திருமணம்',
    nav_wedding_requirements: 'திருமண தேவைகள்',
    nav_my_planner: 'என் திட்டமிடுபவர்',
    nav_vendor_selection: 'விற்பனையாளர் தேர்வு',
    nav_booking_status: 'முன்பதிவு நிலை',
    nav_budget_tracker: 'பட்ஜெட் கண்காணிப்பாளர்',
    nav_wishlist: 'விருப்பப்பட்டியல்',
    nav_support: 'உதவி மையம்',

    // Settings
    settings_title: 'தள அமைப்புகள்',
    settings_appearance: 'தோற்றம் & தீம்',
    settings_light_mode: 'வெளிச்சப் பயன்முறை',
    settings_dark_mode: 'இருண்ட பயன்முறை',
    settings_font_size: 'எழுத்துரு அளவு',
    settings_font_small: 'சிறியது',
    settings_font_medium: 'நடுத்தரமானது',
    settings_font_large: 'பெரியது',
    settings_font_xlarge: 'மிகப் பெரியது',
    settings_language: 'காட்சி மொழி',
    settings_account_security: 'கணக்கு & பாதுகாப்பு'
  },
  hi: {
    platform_name: 'वेडिंग प्लानर और वेंडर प्लेटफॉर्म',
    get_started: 'शुरू करें',
    login: 'साइन इन',
    register: 'खाता बनाएं',
    logout: 'साइन आउट',
    save_changes: 'बदलाव सहेजें',
    cancel: 'रद्द करें',
    confirm: 'पुष्टि करें',
    submit: 'सबमिट करें',
    actions: 'कार्रवाई',
    status: 'स्थिति',
    search: 'खोजें...',
    view_details: 'विवरण देखें',
    loading: 'डेटा लोड हो रहा है...',
    role_planner: 'वेडिंग प्लानर',
    role_vendor: 'सत्यापित विक्रेता',
    role_customer: 'शादी का जोड़ा',
    role_admin: 'प्लेटफॉर्म एडमिन',
    recently_accessed: 'हाल ही में देखा गया',

    // Navigations (Planner)
    nav_dashboard: 'डैशबोर्ड',
    nav_my_customers: 'मेरे ग्राहक',
    nav_customer_requests: 'ग्राहक अनुरोध',
    nav_wedding_projects: 'शादी की परियोजनाएं',
    nav_vendor_directory: 'विक्रेता निर्देशिका',
    nav_vendor_category: 'विक्रेता श्रेणी',
    nav_vendor_availability: 'विक्रेता उपलब्धता',
    nav_vendor_requests: 'विक्रेता अनुरोध',
    nav_request_tracking: 'अनुरोध ट्रैकिंग',
    nav_selected_vendors: 'चयनित विक्रेता',
    nav_service_management: 'सेवा प्रबंधन',
    nav_wedding_schedule: 'शादी की समय-सारणी',
    nav_budget_management: 'बजट प्रबंधन',
    nav_payments: 'भुगतान और मील के पत्थर',
    nav_invoices: 'चालान (इनवॉइस)',
    nav_contracts_documents: 'अनुबंध और दस्तावेज़',
    nav_messages: 'संदेश',
    nav_notifications: 'सूचनाएं',
    nav_reports: 'रिपोर्ट और विश्लेषण',
    nav_settings: 'सेटिंग्स',

    // Navigations (Vendor)
    nav_my_profile: 'मेरी प्रोफाइल',
    nav_my_services: 'मेरी सेवाएं',
    nav_service_categories: 'सेवा श्रेणियां',
    nav_availability_calendar: 'उपलब्धता कैलेंडर',
    nav_booking_requests: 'बुकिंग अनुरोध',
    nav_pending_requests: 'लंबित अनुरोध',
    nav_accepted_bookings: 'स्वीकृत बुकिंग',
    nav_declined_requests: 'अस्वीकृत अनुरोध',
    nav_my_schedule: 'मेरा शेड्यूल',
    nav_vendor_customers: 'ग्राहक',
    nav_reviews_ratings: 'समीक्षाएं और रेटिंग',

    // Navigations (Customer)
    nav_my_wedding: 'मेरी शादी',
    nav_wedding_requirements: 'शादी की आवश्यकताएं',
    nav_my_planner: 'मेरे योजनाकार',
    nav_vendor_selection: 'विक्रेता चयन',
    nav_booking_status: 'बुकिंग स्थिति',
    nav_budget_tracker: 'बजट ट्रैकर',
    nav_wishlist: 'इच्छासूची',
    nav_support: 'सहायता केंद्र',

    // Settings
    settings_title: 'प्लेटफ़ॉर्म सेटिंग्स',
    settings_appearance: 'उपस्थिति और थीम',
    settings_light_mode: 'लाइट मोड',
    settings_dark_mode: 'डार्क मोड',
    settings_font_size: 'फ़ॉन्ट का आकार',
    settings_font_small: 'छोटा',
    settings_font_medium: 'मध्यम',
    settings_font_large: 'बड़ा',
    settings_font_xlarge: 'बहुत बड़ा',
    settings_language: 'प्रदर्शन भाषा',
    settings_account_security: 'खाता और सुरक्षा'
  },
  te: {
    platform_name: 'వివాహ ప్లానర్ మరియు విక్రేత వేదిక',
    get_started: 'ప్రారంభించండి',
    login: 'సైన్ ఇన్',
    register: 'ఖాతా సృష్టించండి',
    logout: 'సైన్ అవుట్',
    save_changes: 'మార్పులను సేవ్ చేయండి',
    cancel: 'రద్దు చేయండి',
    confirm: 'నిర్ధారించండి',
    submit: 'సమర్పించండి',
    actions: 'చర్యలు',
    status: 'స్థితి',
    search: 'శోధించండి...',
    view_details: 'వివరాలు చూడండి',
    loading: 'డేటా లోడ్ అవుతోంది...',
    role_planner: 'వివాహ ప్లానర్',
    role_vendor: 'ధృవీకరించబడిన విక్రేత',
    role_customer: 'వివాహ జంట',
    role_admin: 'ప్లాట్‌ఫారమ్ అడ్మిన్',
    recently_accessed: 'ఇటీవల చూసినవి',

    // Navigations (Planner)
    nav_dashboard: 'డాష్‌బోర్డ్',
    nav_my_customers: 'నా కస్టమర్లు',
    nav_customer_requests: 'కస్టమర్ అభ్యర్థనలు',
    nav_wedding_projects: 'వివాహ ప్రాజెక్టులు',
    nav_vendor_directory: 'విక్రేతల డైరెక్టరీ',
    nav_vendor_category: 'విక్రేత వర్గం',
    nav_vendor_availability: 'విక్రేత లభ్యత',
    nav_vendor_requests: 'విక్రేత అభ్యర్థనలు',
    nav_request_tracking: 'అభ్యర్థన ట్రాకింగ్',
    nav_selected_vendors: 'ఎంపిక చేసిన విక్రేతలు',
    nav_service_management: 'సేవా నిర్వహణ',
    nav_wedding_schedule: 'వివాహ షెడ్యూల్',
    nav_budget_management: 'బడ్జెట్ నిర్వహణ',
    nav_payments: 'చెల్లింపులు & మైలురాళ్ళు',
    nav_invoices: 'ఇన్‌వాయిస్‌లు',
    nav_contracts_documents: 'ఒప్పందాలు & పత్రాలు',
    nav_messages: 'సందేశాలు',
    nav_notifications: 'నోటిఫికేషన్‌లు',
    nav_reports: 'నివేదికలు & విశ్లేషణలు',
    nav_settings: 'సెట్టింగ్‌లు',

    // Navigations (Vendor)
    nav_my_profile: 'నా ప్రొఫైల్',
    nav_my_services: 'నా సేవలు',
    nav_service_categories: 'సేవా వర్గాలు',
    nav_availability_calendar: 'లభ్యత క్యాలెండర్',
    nav_booking_requests: 'బుకింగ్ అభ్యర్థనలు',
    nav_pending_requests: 'పెండింగ్ అభ్యర్థనలు',
    nav_accepted_bookings: 'ఆమోదించబడిన బుకింగ్‌లు',
    nav_declined_requests: 'తిరస్కరించబడిన అభ్యర్థనలు',
    nav_my_schedule: 'నా షెడ్యూల్',
    nav_vendor_customers: 'కస్టమర్లు',
    nav_reviews_ratings: 'సమీక్షలు & రేటింగ్‌లు',

    // Navigations (Customer)
    nav_my_wedding: 'నా వివాహం',
    nav_wedding_requirements: 'వివాహ అవసరాలు',
    nav_my_planner: 'నా ప్లానర్',
    nav_vendor_selection: 'విక్రేత ఎంపిక',
    nav_booking_status: 'బుకింగ్ స్థితి',
    nav_budget_tracker: 'బడ్జెట్ ట్రాకర్',
    nav_wishlist: 'కోరికల జాబితా',
    nav_support: 'సహాయ కేంద్రం',

    // Settings
    settings_title: 'ప్లాట్‌ఫారమ్ సెట్టింగ్‌లు',
    settings_appearance: 'రూపం మరియు థీమ్',
    settings_light_mode: 'లైట్ మోడ్',
    settings_dark_mode: 'డార్క్ మోడ్',
    settings_font_size: 'ఫాంట్ పరిమాణం',
    settings_font_small: 'చిన్నది',
    settings_font_medium: 'మధ్యస్థం',
    settings_font_large: 'పెద్దది',
    settings_font_xlarge: 'చాలా పెద్దది',
    settings_language: 'ప్రదర్శన భాష',
    settings_account_security: 'ఖాతా & భద్రత'
  },
  ml: {
    platform_name: 'വിവാഹ പ്ലാനർ & വെണ്ടർ പ്ലാറ്റ്‌ഫോം',
    get_started: 'ആരംഭിക്കുക',
    login: 'സൈൻ ഇൻ',
    register: 'അക്കൗണ്ട് ഉണ്ടാക്കുക',
    logout: 'സൈൻ ഔട്ട്',
    save_changes: 'മാറ്റങ്ങൾ സംരക്ഷിക്കുക',
    cancel: 'റദ്ദാക്കുക',
    confirm: 'സ്ഥിരീകരിക്കുക',
    submit: 'സമർപ്പിക്കുക',
    actions: 'പ്രവർത്തനങ്ങൾ',
    status: 'നില',
    search: 'തിരയുക...',
    view_details: 'വിശദാംശങ്ങൾ കാണുക',
    loading: 'ഡാറ്റ ലോഡ് ചെയ്യുന്നു...',
    role_planner: 'വിവാഹ പ്ലാനർ',
    role_vendor: 'സ്ഥിരീകരിച്ച വെണ്ടർ',
    role_customer: 'വിവാഹ ദമ്പതികൾ',
    role_admin: 'പ്ലാറ്റ്ഫോം അഡ്മിൻ',
    recently_accessed: 'അടുത്തിടെ കണ്ടവ',

    // Navigations (Planner)
    nav_dashboard: 'ഡാഷ്‌ബോർഡ്',
    nav_my_customers: 'എന്റെ ഉപഭോക്താക്കൾ',
    nav_customer_requests: 'ഉപഭോക്തൃ അഭ്യർത്ഥനകൾ',
    nav_wedding_projects: 'വിവാഹ പ്രോജക്ടുകൾ',
    nav_vendor_directory: 'വെണ്ടർ ഡയറക്ടറി',
    nav_vendor_category: 'വെണ്ടർ വിഭാഗം',
    nav_vendor_availability: 'വെണ്ടർ ലഭ്യത',
    nav_vendor_requests: 'വെണ്ടർ അഭ്യർത്ഥനകൾ',
    nav_request_tracking: 'അഭ്യർത്ഥന ട്രാക്കിംഗ്',
    nav_selected_vendors: 'തിരഞ്ഞെടുത്ത വെണ്ടർമാർ',
    nav_service_management: 'സേവന മാനേജ്മെന്റ്',
    nav_wedding_schedule: 'വിവാഹ ഷെഡ്യൂൾ',
    nav_budget_management: 'ബജറ്റ് മാനേജ്മെന്റ്',
    nav_payments: 'പേയ്‌മെന്റുകളും നാഴികക്കല്ലുകളും',
    nav_invoices: 'ഇൻവോയ്സുകൾ',
    nav_contracts_documents: 'കരാറുകളും രേഖകളും',
    nav_messages: 'സന്ദേശങ്ങൾ',
    nav_notifications: 'അറിയിപ്പുകൾ',
    nav_reports: 'റിപ്പോർട്ടുകളും വിശകലനവും',
    nav_settings: 'ക്രമീകരണങ്ങൾ',

    // Navigations (Vendor)
    nav_my_profile: 'എന്റെ പ്രൊഫൈൽ',
    nav_my_services: 'എന്റെ സേവനങ്ങൾ',
    nav_service_categories: 'സേവന വിഭാഗങ്ങൾ',
    nav_availability_calendar: 'ലഭ്യത കലണ്ടർ',
    nav_booking_requests: 'ബുക്കിംഗ് അഭ്യർത്ഥനകൾ',
    nav_pending_requests: 'തീർപ്പുകൽപ്പിക്കാത്ത അഭ്യർത്ഥനകൾ',
    nav_accepted_bookings: 'സ്വീകരിച്ച ബുക്കിംഗുകൾ',
    nav_declined_requests: 'നിരസിച്ച അഭ്യർത്ഥനകൾ',
    nav_my_schedule: 'എന്റെ ഷെഡ്യൂൾ',
    nav_vendor_customers: 'ഉപഭോക്താക്കൾ',
    nav_reviews_ratings: 'അവലോകനങ്ങളും റേറ്റിംഗുകളും',

    // Navigations (Customer)
    nav_my_wedding: 'എന്റെ വിവാഹം',
    nav_wedding_requirements: 'വിവാഹ ആവശ്യകതകൾ',
    nav_my_planner: 'എന്റെ പ്ലാനർ',
    nav_vendor_selection: 'വെണ്ടർ തിരഞ്ഞെടുപ്പ്',
    nav_booking_status: 'ബുക്കിംഗ് നില',
    nav_budget_tracker: 'ബജറ്റ് ട്രാക്കർ',
    nav_wishlist: 'ആഗ്രഹപ്പട്ടിക',
    nav_support: 'സഹായ കേന്ദ്രം',

    // Settings
    settings_title: 'പ്ലാറ്റ്ഫോം ക്രമീകരണങ്ങൾ',
    settings_appearance: 'രൂപവും തീമും',
    settings_light_mode: 'ലൈറ്റ് മോഡ്',
    settings_dark_mode: 'ഡാർക്ക് മോഡ്',
    settings_font_size: 'ഫോണ്ട് വലിപ്പം',
    settings_font_small: 'ചെറുത്',
    settings_font_medium: 'ഇടത്തരം',
    settings_font_large: 'വലുത്',
    settings_font_xlarge: 'വളരെ വലുത്',
    settings_language: 'പ്രദർശന ഭാഷ',
    settings_account_security: 'അക്കൗണ്ടും സുരക്ഷയും'
  },
  kn: {
    platform_name: 'ವಿವಾಹ ಪ್ಲಾನರ್ ಮತ್ತು ಮಾರಾಟಗಾರರ ವೇದಿಕೆ',
    get_started: 'ಪ್ರಾರಂಭಿಸಿ',
    login: 'ಸೈನ್ ಇನ್',
    register: 'ಖಾತೆಯನ್ನು ರಚಿಸಿ',
    logout: 'ಸೈನ್ ಔಟ್',
    save_changes: 'ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ',
    cancel: 'ರದ್ದುಮಾಡಿ',
    confirm: 'ದೃಢೀಕರಿಸಿ',
    submit: 'ಸಲ್ಲಿಸಿ',
    actions: 'ಕ್ರಮಗಳು',
    status: 'ಸ್ಥಿತಿ',
    search: 'ಹುಡುಕಿ...',
    view_details: 'ವಿವರಗಳನ್ನು ವೀಕ್ಷಿಸಿ',
    loading: 'ಡೇಟಾ ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
    role_planner: 'ವೆಡ್ಡಿಂಗ್ ಪ್ಲಾನರ್',
    role_vendor: 'ಪರಿಶೀಲಿಸಿದ ಮಾರಾಟಗಾರ',
    role_customer: 'ಮದುವೆಯ ದಂಪತಿಗಳು',
    role_admin: 'ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ನಿರ್ವಾಹಕ',
    recently_accessed: 'ಇತ್ತೀಚೆಗೆ ವೀಕ್ಷಿಸಿದವು',

    // Navigations (Planner)
    nav_dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    nav_my_customers: 'ನನ್ನ ಗ್ರಾಹಕರು',
    nav_customer_requests: 'ಗ್ರಾಹಕರ ವಿನಂತಿಗಳು',
    nav_wedding_projects: 'ವಿವಾಹ ಪ್ರಾಜೆಕ್ಟ್‌ಗಳು',
    nav_vendor_directory: 'ಮಾರಾಟಗಾರರ ಡೈರೆಕ್ಟರಿ',
    nav_vendor_category: 'ಮಾರಾಟಗಾರರ ವರ್ಗ',
    nav_vendor_availability: 'ಮಾರಾಟಗಾರರ ಲಭ್ಯತೆ',
    nav_vendor_requests: 'ಮಾರಾಟಗಾರರ ವಿನಂತಿಗಳು',
    nav_request_tracking: 'ವಿನಂತಿ ಟ್ರ್ಯಾಕಿಂಗ್',
    nav_selected_vendors: 'ಆಯ್ಕೆಮಾಡಿದ ಮಾರಾಟಗಾರರು',
    nav_service_management: 'ಸೇವಾ ನಿರ್ವಹಣೆ',
    nav_wedding_schedule: 'ಮದುವೆಯ ವೇಳಾಪಟ್ಟಿ',
    nav_budget_management: 'ಬಜೆಟ್ ನಿರ್ವಹಣೆ',
    nav_payments: 'ಪಾವತಿಗಳು & ಮೈಲಿಗಲ್ಲುಗಳು',
    nav_invoices: 'ಇನ್‌ವಾಯ್ಸ್‌ಗಳು',
    nav_contracts_documents: 'ಒಪ್ಪಂದಗಳು & ದಾಖಲೆಗಳು',
    nav_messages: 'ಸಂದೇಶಗಳು',
    nav_notifications: 'ಅಧಿಸೂಚನೆಗಳು',
    nav_reports: 'ವರದಿಗಳು & ವಿಶ್ಲೇಷಣೆ',
    nav_settings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',

    // Navigations (Vendor)
    nav_my_profile: 'ನನ್ನ ಪ್ರೊಫೈಲ್',
    nav_my_services: 'ನನ್ನ ಸೇವೆಗಳು',
    nav_service_categories: 'ಸೇವಾ ವರ್ಗಗಳು',
    nav_availability_calendar: 'ಲಭ್ಯತೆ ಕ್ಯಾಲೆಂಡರ್',
    nav_booking_requests: 'ಬುಕಿಂಗ್ ವಿನಂತಿಗಳು',
    nav_pending_requests: 'ಬಾಕಿ ಇರುವ ವಿನಂತಿಗಳು',
    nav_accepted_bookings: 'ಸ್ವೀಕರಿಸಿದ ಬುಕಿಂಗ್‌ಗಳು',
    nav_declined_requests: 'ನಿರಾಕರಿಸಿದ ವಿನಂತಿಗಳು',
    nav_my_schedule: 'ನನ್ನ ವೇಳಾಪಟ್ಟಿ',
    nav_vendor_customers: 'ಗ್ರಾಹಕರು',
    nav_reviews_ratings: 'ವಿಮರ್ಶೆಗಳು & ರೇಟಿಂಗ್‌ಗಳು',

    // Navigations (Customer)
    nav_my_wedding: 'ನನ್ನ ಮದುವೆ',
    nav_wedding_requirements: 'ಮದುವೆಯ ಅಗತ್ಯತೆಗಳು',
    nav_my_planner: 'ನನ್ನ ಪ್ಲಾನರ್',
    nav_vendor_selection: 'ಮಾರಾಟಗಾರರ ಆಯ್ಕೆ',
    nav_booking_status: 'ಬುಕಿಂಗ್ ಸ್ಥಿತಿ',
    nav_budget_tracker: 'ಬಜೆಟ್ ಟ್ರ್ಯಾಕರ್',
    nav_wishlist: 'ಇಷ್ಟಪಟ್ಟಿ',
    nav_support: 'ಬೆಂಬಲ ಕೇಂದ್ರ',

    // Settings
    settings_title: 'ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
    settings_appearance: 'ಗೋಚರತೆ ಮತ್ತು ಥೀಮ್',
    settings_light_mode: 'ಲೈಟ್ ಮೋಡ್',
    settings_dark_mode: 'ಡಾರ್ಕ್ ಮೋಡ್',
    settings_font_size: 'ಫಾಂಟ್ ಗಾತ್ರ',
    settings_font_small: 'ಸಣ್ಣ',
    settings_font_medium: 'ಮಧ್ಯಮ',
    settings_font_large: 'ದೊಡ್ಡದು',
    settings_font_xlarge: 'ಅತಿದೊಡ್ಡ',
    settings_language: 'ಪ್ರದರ್ಶನ ಭಾಷೆ',
    settings_account_security: 'ಖಾತೆ & ಭದ್ರತೆ'
  }
};

// Comprehensive Universal Vocabulary and Phrases for Full-App UI Translation
export const GLOBAL_PHRASES = {
  // Navigation & Header
  'Dashboard': { ta: 'டாஷ்போர்டு', hi: 'डैशबोर्ड', te: 'డాష్‌బోర్డ్', ml: 'ഡാഷ്‌ബോർഡ്', kn: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್' },
  'My Customers': { ta: 'என் வாடிக்கையாளர்கள்', hi: 'मेरे ग्राहक', te: 'నా కస్టమర్లు', ml: 'എന്റെ ഉപഭോക്താക്കൾ', kn: 'ನನ್ನ ಗ್ರಾಹಕರು' },
  'Customers': { ta: 'வாடிக்கையாளர்கள்', hi: 'ग्राहक', te: 'కస్టమర్లు', ml: 'ഉപഭോക്താക്കൾ', kn: 'ಗ್ರಾಹಕರು' },
  'Customer Requests': { ta: 'வாடிக்கையாளர் கோரிக்கைகள்', hi: 'ग्राहक अनुरोध', te: 'కస్టమర్ అభ్యర్థనలు', ml: 'ഉപഭോക്തൃ അഭ്യർത്ഥനകൾ', kn: 'ಗ್ರಾಹಕರ ವಿನಂತಿಗಳು' },
  'Wedding Projects': { ta: 'திருமண திட்டங்கள்', hi: 'शादी की परियोजनाएं', te: 'వివాహ ప్రాజెక్టులు', ml: 'വിവാഹ പ്രോജക്ടുകൾ', kn: 'ವಿವಾಹ ಪ್ರಾಜೆಕ್ಟ್‌ಗಳು' },
  'Projects': { ta: 'திட்டங்கள்', hi: 'परियोजनाएं', te: 'ప్రాజెక్టులు', ml: 'പ്രോജക്ടുകൾ', kn: 'ಪ್ರಾಜೆಕ್ಟ್‌ಗಳು' },
  'Vendor Category': { ta: 'விற்பனையாளர் வகை', hi: 'विक्रेता श्रेणी', te: 'విక్రేత వర్గం', ml: 'വെണ്ടർ വിഭാഗം', kn: 'ಮಾರಾಟಗಾರರ ವರ್ಗ' },
  'Vendor Categories': { ta: 'விற்பனையாளர் வகைகள்', hi: 'विक्रेता श्रेणियां', te: 'విక్రేత వర్గాలు', ml: 'വെണ്ടർ വിഭാഗങ്ങൾ', kn: 'ಮಾರಾಟಗಾರರ ವರ್ಗಗಳು' },
  'Service Categories': { ta: 'சேவை வகைகள்', hi: 'सेवा श्रेणियां', te: 'సేవా వర్గాలు', ml: 'സേവന വിഭാഗങ്ങൾ', kn: 'ಸೇವಾ ವರ್ಗಗಳು' },
  'Vendor Directory': { ta: 'விற்பனையாளர் அடைவு', hi: 'विक्रेता निर्देशिका', te: 'విక్రేతల డైరెక్టరీ', ml: 'വെണ്ടർ ഡയറക്ടറി', kn: 'ಮಾರಾಟಗಾರರ ಡೈರೆಕ್ಟರಿ' },
  'Vendors': { ta: 'விற்பனையாளர்கள்', hi: 'विक्रेता', te: 'విక్రేతలు', ml: 'വെണ്ടർമാർ', kn: 'ಮಾರಾಟಗಾರರು' },
  'Vendor Requests': { ta: 'விற்பனையாளர் கோரிக்கைகள்', hi: 'विक्रेता अनुरोध', te: 'విక్రేత అభ్యర్థనలు', ml: 'വെണ്ടർ അഭ്യർത്ഥനകൾ', kn: 'ಮಾರಾಟಗಾರರ ವಿನಂತಿಗಳು' },
  'Request Tracking': { ta: 'கோரிக்கை கண்காணிப்பு', hi: 'अनुरोध ट्रैकिंग', te: 'అభ్యర్థన ట్రాకింగ్', ml: 'അഭ്യർത്ഥന ട്രാക്കിംഗ്', kn: 'ವಿನಂತಿ ಟ್ರ್ಯಾಕಿಂಗ್' },
  'Selected Vendors': { ta: 'தேர்ந்தெடுக்கப்பட்ட விற்பனையாளர்கள்', hi: 'चयनित विक्रेता', te: 'ఎంపిక చేసిన విక్రేతలు', ml: 'തിരഞ്ഞെടുത്ത വെണ്ടർമാർ', kn: 'ಆಯ್ಕೆಮಾಡಿದ ಮಾರಾಟಗಾರರು' },
  'Service Management': { ta: 'சேவை மேலாண்மை', hi: 'सेवा प्रबंधन', te: 'సేవా నిర్వహణ', ml: 'സേവന മാനേജ്മെന്റ്', kn: 'ಸೇವಾ ನಿರ್ವಹಣೆ' },
  'My Services': { ta: 'என் சேவைகள்', hi: 'मेरी सेवाएं', te: 'నా సేవలు', ml: 'എന്റെ സേവനങ്ങൾ', kn: 'ನನ್ನ ಸೇವೆಗಳು' },
  'Wedding Schedule': { ta: 'திருமண அட்டவணை', hi: 'शादी की समय-सारणी', te: 'వివాహ షెడ్యూల్', ml: 'വിവാഹ ഷെഡ്യൂൾ', kn: 'ಮದುವೆಯ ವೇಳಾಪಟ್ಟಿ' },
  'Schedule': { ta: 'அட்டவணை', hi: 'समय-सारणी', te: 'షెడ్యూల్', ml: 'ഷെഡ്യൂൾ', kn: 'ವೇಳಾಪಟ್ಟಿ' },
  'My Schedule': { ta: 'என் அட்டவணை', hi: 'मेरा शेड्यूल', te: 'నా షెడ్యూల్', ml: 'എന്റെ ഷെഡ്യൂൾ', kn: 'ನನ್ನ ವೇಳಾಪಟ್ಟಿ' },
  'Budget Management': { ta: 'பட்ஜெட் மேலாண்மை', hi: 'बजट प्रबंधन', te: 'బడ్జెట్ నిర్వహణ', ml: 'ബജറ്റ് മാനേജ്മെന്റ്', kn: 'ಬಜೆಟ್ ನಿರ್ವಹಣೆ' },
  'Budget Tracker': { ta: 'பட்ஜெட் கண்காணிப்பாளர்', hi: 'बजट ट्रैकर', te: 'బడ్జెట్ ట్రాకర్', ml: 'ബജറ്റ് ട്രാക്കർ', kn: 'ಬಜೆಟ್ ಟ್ರ್ಯಾಕರ್' },
  'Budget': { ta: 'பட்ஜெட்', hi: 'बजट', te: 'బడ్జెట్', ml: 'ബജറ്റ്', kn: 'ಬಜೆಟ್' },
  'Payments & Milestones': { ta: 'கொடுப்பனவுகள் & மைல்கற்கள்', hi: 'भुगतान और मील के पत्थर', te: 'చెల్లింపులు & మైలురాళ్ళు', ml: 'പേയ്‌മെന്റുകളും നാഴികക്കല്ലുകളും', kn: 'ಪಾವತಿಗಳು & ಮೈಲಿಗಲ್ಲುಗಳು' },
  'Payments': { ta: 'கொடுப்பனவுகள்', hi: 'भुगतान', te: 'చెల్లింపులు', ml: 'പേയ്‌മെന്റുകൾ', kn: 'ಪಾವತಿಗಳು' },
  'Invoices': { ta: 'விலைப்பட்டியல்கள்', hi: 'चालान (इनवॉइस)', te: 'ఇన్‌వాయిస్‌లు', ml: 'ഇൻവോയ്സുകൾ', kn: 'ಇನ್‌ವಾಯ್ಸ್‌ಗಳು' },
  'My Invoices': { ta: 'என் விலைப்பட்டியல்கள்', hi: 'मेरे इनवॉइस', te: 'నా ఇన్‌వాయిస్‌లు', ml: 'എന്റെ ഇൻവോയ്സുകൾ', kn: 'ನನ್ನ ಇನ್‌ವಾಯ್ಸ್‌ಗಳು' },
  'Contracts & Documents': { ta: 'ஒப்பந்தங்கள் & ஆவணங்கள்', hi: 'अनुबंध और दस्तावेज़', te: 'ఒప్పందాలు & పత్రాలు', ml: 'കരാറുകളും രേഖകളും', kn: 'ಒಪ್ಪಂದಗಳು & ದಾಖಲೆಗಳು' },
  'Documents': { ta: 'ஆவணங்கள்', hi: 'दस्तावेज़', te: 'పత్రాలు', ml: 'രേഖകൾ', kn: 'ದಾಖಲೆಗಳು' },
  'Messages': { ta: 'செய்திகள்', hi: 'संदेश', te: 'సందేశాలు', ml: 'സന്ദേശങ്ങൾ', kn: 'ಸಂದೇಶಗಳು' },
  'Support Desk': { ta: 'உதவி மையம்', hi: 'सहायता केंद्र', te: 'సహాయ కేంద్రం', ml: 'സഹായ കേന്ദ്രം', kn: 'ಬೆಂಬಲ ಕೇಂದ್ರ' },
  'Customer Support': { ta: 'வாடிக்கையாளர் ஆதரவு', hi: 'ग्राहक सहायता', te: 'కస్టమర్ సపోర్ట్', ml: 'ഉപഭോക്തൃ പിന്തുണ', kn: 'ಗ್ರಾಹಕ ಬೆಂಬಲ' },
  'Support': { ta: 'ஆதரவு', hi: 'सहायता', te: 'సహాయం', ml: 'പിന്തുണ', kn: 'ಬೆಂಬಲ' },
  'Notifications': { ta: 'அறிவிப்புகள்', hi: 'सूचनाएं', te: 'నోటిఫికేషన్‌లు', ml: 'അറിയിപ്പുകൾ', kn: 'ಅಧಿಸೂಚನೆಗಳು' },
  'Reports & Analytics': { ta: 'அறிக்கைகள் & பகுப்பாய்வு', hi: 'रिपोर्ट और विश्लेषण', te: 'నివేదికలు & విశ్లేషణలు', ml: 'റിപ്പോർട്ടുകളും വിശകലനവും', kn: 'ವರದಿಗಳು & ವಿಶ್ಲೇಷಣೆ' },
  'Reports': { ta: 'அறிக்கைகள்', hi: 'रिपोर्ट', te: 'నివేదికలు', ml: 'റിപ്പോർട്ടുകൾ', kn: 'ವರದಿಗಳು' },
  'Settings': { ta: 'அமைப்புகள்', hi: 'सेटिंग्स', te: 'సెట్టింగ్‌లు', ml: 'ക്രമീകരണങ്ങൾ', kn: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು' },
  'Platform Settings': { ta: 'தள அமைப்புகள்', hi: 'प्लेटफ़ॉर्म सेटिंग्स', te: 'ప్లాట్‌ఫారమ్ సెట్టింగ్‌లు', ml: 'പ്ലാറ്റ്ഫോം ക്രമീകരണങ്ങൾ', kn: 'ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳು' },
  'My Profile': { ta: 'என் சுயவிவரம்', hi: 'मेरी प्रोफाइल', te: 'నా ప్రొఫైల్', ml: 'എന്റെ പ്രൊഫൈൽ', kn: 'ನನ್ನ ಪ್ರೊಫೈಲ್' },
  'Profile': { ta: 'சுயவிவரம்', hi: 'प्रोफाइल', te: 'ప్రొఫైల్', ml: 'പ്രൊഫൈൽ', kn: 'ಪ್ರೊಫೈಲ್' },
  'Availability Calendar': { ta: 'கிடைக்கும் நாள்காட்டி', hi: 'उपलब्धता कैलेंडर', te: 'లభ్యత క్యాలెండర్', ml: 'ലഭ്യത കലണ്ടർ', kn: 'ಲಭ್ಯತೆ ಕ್ಯಾಲೆಂಡರ್' },
  'Availability': { ta: 'கிடைக்கும் நிலை', hi: 'उपलब्धता', te: 'లభ్యత', ml: 'ലഭ്യത', kn: 'ಲಭ್ಯತೆ' },
  'Booking Requests': { ta: 'முன்பதிவு கோரிக்கைகள்', hi: 'बुकिंग अनुरोध', te: 'బుకింగ్ అభ్యర్థనలు', ml: 'ബുക്കിംഗ് അഭ്യർത്ഥനകൾ', kn: 'ಬುಕಿಂಗ್ ವಿನಂತಿಗಳು' },
  'Pending Requests': { ta: 'நிலுவையில் உள்ள கோரிக்கைகள்', hi: 'लंबित अनुरोध', te: 'పెండింగ్ అభ్యర్థనలు', ml: 'തീർപ്പുകൽപ്പിക്കാത്ത അഭ്യർത്ഥനകൾ', kn: 'ಬಾಕಿ ಇರುವ ವಿನಂತಿಗಳು' },
  'Accepted Bookings': { ta: 'ஏற்றுக்கொள்ளப்பட்ட முன்பதிவுகள்', hi: 'स्वीकृत बुकिंग', te: 'ఆమోదించబడిన బుకింగ్‌లు', ml: 'സ്വീകരിച്ച ബുക്കിംഗുകൾ', kn: 'ಸ್ವೀಕರಿಸಿದ ಬುಕಿಂಗ್‌ಗಳು' },
  'Declined Requests': { ta: 'நிராகரிக்கப்பட்ட கோரிக்கைகள்', hi: 'अस्वीकृत अनुरोध', te: 'తిరస్కరించబడిన అభ్యర్థనలు', ml: 'നിരസിച്ച അഭ്യർത്ഥനകൾ', kn: 'ನಿರಾಕರಿಸಿದ ವಿನಂತಿಗಳು' },
  'Reviews & Ratings': { ta: 'மதிப்புரைகள் & தரவரிசை', hi: 'समीक्षाएं और रेटिंग', te: 'సమీక్షలు & రేటింగ్‌లు', ml: 'അവലോകനങ്ങളും റേറ്റിംഗുകളും', kn: 'ವಿಮರ್ಶೆಗಳು & ರೇಟಿಂಗ್‌ಗಳು' },
  'Reviews': { ta: 'மதிப்புரைகள்', hi: 'समीक्षाएं', te: 'సమీక్షలు', ml: 'അവലോകനങ്ങൾ', kn: 'ವಿಮರ್ಶೆಗಳು' },
  'My Wedding': { ta: 'என் திருமணம்', hi: 'मेरी शादी', te: 'నా వివాహం', ml: 'എന്റെ വിവാഹം', kn: 'ನನ್ನ ಮದುವೆ' },
  'Wedding Requirements': { ta: 'திருமண தேவைகள்', hi: 'शादी की आवश्यकताएं', te: 'వివాహ అవసరాలు', ml: 'വിവാഹ ആവശ്യകതകൾ', kn: 'ಮದುವೆಯ ಅಗತ್ಯತೆಗಳು' },
  'My Planner': { ta: 'என் திட்டமிடுபவர்', hi: 'मेरे योजनाकार', te: 'నా ప్లానర్', ml: 'എന്റെ പ്ലാനർ', kn: 'ನನ್ನ ಪ್ಲಾನರ್' },
  'Vendor Selection': { ta: 'விற்பனையாளர் தேர்வு', hi: 'विक्रेता चयन', te: 'విక్రేత ఎంపిక', ml: 'വെണ്ടർ തിരഞ്ഞെടുപ്പ്', kn: 'ಮಾರಾಟಗಾರರ ಆಯ್ಕೆ' },
  'Booking Status': { ta: 'முன்பதிவு நிலை', hi: 'बुकिंग स्थिति', te: 'బుకింగ్ స్థితి', ml: 'ബുക്കിംഗ് നില', kn: 'ಬುಕಿಂಗ್ ಸ್ಥಿತಿ' },
  'Wishlist': { ta: 'விருப்பப்பட்டியல்', hi: 'इच्छासूची', te: 'కోరికల జాబಿತా', ml: 'ആഗ്രഹപ്പട്ടിക', kn: 'ಇಷ್ಟಪಟ್ಟಿ' },
  'Recently Accessed': { ta: 'சமீபத்தில் பார்த்தவை', hi: 'हाल ही में देखा गया', te: 'ఇటీవల చూసినవి', ml: 'അടുത്തിടെ കണ്ടവ', kn: 'ಇತ್ತೀಚೆಗೆ ವೀಕ್ಷಿಸಿದವು' },
  'Planner Portal': { ta: 'திட்டமிடுபவர் தளம்', hi: 'प्लानर पोर्टल', te: 'ప్లానర్ పోర్టల్', ml: 'പ്ലാനർ പോർട്ടൽ', kn: 'ಪ್ಲಾನರ್ ಪೋರ್ಟಲ್' },
  'Artisan Vendor Portal': { ta: 'கைவினை விற்பனையாளர் தளம்', hi: 'कारीगर विक्रेता पोर्टल', te: 'ఆర్టిసన్ వెండర్ పోర్టల్', ml: 'വെണ്ടർ പോർട്ടൽ', kn: 'ಮಾರಾಟಗಾರರ ಪೋರ್ಟಲ್' },
  'Vendor Partner': { ta: 'விற்பனையாளர் கூட்டாளர்', hi: 'विक्रेता भागीदार', te: 'విక్రేత భాగస్వామి', ml: 'വെണ്ടർ പങ്കാളി', kn: 'ಮಾರಾಟಗಾರ ಪಾಲುದಾರ' },
  'Couples Wedding Suite': { ta: 'தம்பதியர் திருமண தொகுப்பு', hi: 'विवाह सुइट', te: 'వివాహ సూట్', ml: 'വിവാഹ സ്യൂട്ട്', kn: 'ವಿವಾಹ ಸೂಟ್' },
  'Wedding Suite': { ta: 'திருமண தொகுப்பு', hi: 'विवाह सुइट', te: 'వివాహ సూట్', ml: 'വിവാഹ സ്യൂട്ട്', kn: 'ವಿವಾಹ ಸೂಟ್' },

  // Buttons & Actions
  'Sign In': { ta: 'உள்நுழைக', hi: 'साइन इन करें', te: 'సైన్ ఇన్', ml: 'സൈൻ ഇൻ', kn: 'ಸೈನ್ ಇನ್' },
  'Sign Out': { ta: 'வெளியேறு', hi: 'साइन आउट', te: 'సైన్ అవుట్', ml: 'സൈൻ ഔട്ട്', kn: 'ಸೈನ್ ಔಟ್' },
  'Create Account': { ta: 'கணக்கை உருவாக்கு', hi: 'खाता बनाएं', te: 'ఖాతా సృష్టించండి', ml: 'അക്കൗണ്ട് ഉണ്ടാക്കുക', kn: 'ಖಾತೆಯನ್ನು ರಚಿಸಿ' },
  'Get Started': { ta: 'தொடங்குங்கள்', hi: 'शुरू करें', te: 'ప్రారంభించండి', ml: 'ആരംഭിക്കുക', kn: 'ಪ್ರಾರಂಭಿಸಿ' },
  'Welcome Back': { ta: 'மீண்டும் வருக', hi: 'वापसी पर स्वागत है', te: 'తిరిగి స్వాగతం', ml: 'വീണ്ടും സ്വാഗതം', kn: 'ಮತ್ತೆ ಸುಸ್ವಾಗತ' },
  'Save Changes': { ta: 'மாற்றங்களைச் சேமி', hi: 'बदलाव सहेजें', te: 'మార్పులను సేవ్ చేయండి', ml: 'മാറ്റങ്ങൾ സംരക്ഷിക്കുക', kn: 'ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ' },
  'Save': { ta: 'சேமி', hi: 'सहेजें', te: 'సేవ్ చేయండి', ml: 'സംരക്ഷിക്കുക', kn: 'ಉಳಿಸಿ' },
  'Cancel': { ta: 'ரத்துசெய்', hi: 'रद्द करें', te: 'రద్దు చేయండి', ml: 'റദ്ദാക്കുക', kn: 'ರದ್ದುಮಾಡಿ' },
  'Confirm': { ta: 'உறுதிசெய்', hi: 'पुष्टि करें', te: 'నిర్ధారించండి', ml: 'സ്ഥിരീകരിക്കുക', kn: 'ದೃಢೀಕರಿಸಿ' },
  'Submit': { ta: 'சமர்ப்பி', hi: 'सबमिट करें', te: 'సమర్పించండి', ml: 'സമർപ്പിക്കുക', kn: 'ಸಲ್ಲಿಸಿ' },
  'Submit Request': { ta: 'கோரிக்கையைச் சமர்ப்பி', hi: 'अनुरोध सबमिट करें', te: 'అభ్యర్థనను సమర్పించండి', ml: 'അഭ്യർത്ഥന സമർപ്പിക്കുക', kn: 'ವಿನಂತಿಯನ್ನು ಸಲ್ಲಿಸಿ' },
  'Submit Requirements': { ta: 'தேவைகளைச் சமர்ப்பி', hi: 'आवश्यकताएं सबमिट करें', te: 'అవసరాలను సమర్పించండి', ml: 'ആവശ്യങ്ങൾ സമർപ്പിക്കുക', kn: 'ಅಗತ್ಯತೆಗಳನ್ನು ಸಲ್ಲಿಸಿ' },
  'Actions': { ta: 'செயல்கள்', hi: 'कार्रवाई', te: 'చర్యలు', ml: 'പ്രവർത്തനങ്ങൾ', kn: 'ಕ್ರಮಗಳು' },
  'Action': { ta: 'செயல்', hi: 'कार्रवाई', te: 'చర్య', ml: 'പ്രവർത്തനം', kn: 'ಕ್ರಮ' },
  'Status': { ta: 'நிலை', hi: 'स्थिति', te: 'స్థితి', ml: 'നില', kn: 'ಸ್ಥಿತಿ' },
  'Search...': { ta: 'தேடுக...', hi: 'खोजें...', te: 'శోధించండి...', ml: 'തിരയുക...', kn: 'ಹುಡುಕಿ...' },
  'Search': { ta: 'தேடுக', hi: 'खोजें', te: 'శోధించండి', ml: 'തിരയുക', kn: 'ಹುಡುಕಿ' },
  'View Details': { ta: 'விவரங்களைக் காண்க', hi: 'विवरण देखें', te: 'వివరాలు చూడండి', ml: 'വിശദാംശങ്ങൾ കാണുക', kn: 'ವಿವರಗಳನ್ನು ವೀಕ್ಷಿಸಿ' },
  'Details': { ta: 'விவரங்கள்', hi: 'विवरण', te: 'వివరాలు', ml: 'വിശദാംശങ്ങൾ', kn: 'ವಿವರಗಳು' },
  'Edit': { ta: 'திருத்து', hi: 'संपादित करें', te: 'సవరించండి', ml: 'എഡിറ്റ് ചെയ്യുക', kn: 'ಸಂಪಾದಿಸಿ' },
  'Delete': { ta: 'நீக்கு', hi: 'हटाएं', te: 'తొలగించండి', ml: 'ഇല്ലാതാക്കുക', kn: 'ಅಳಿಸಿ' },
  'Add New': { ta: 'புதிதாகச் சேர்', hi: 'नया जोड़ें', te: 'కొత్తది జోడించండి', ml: 'പുതിയത് ചേർക്കുക', kn: 'ಹೊಸದನ್ನು ಸೇರಿಸಿ' },
  'Add': { ta: 'சேர்', hi: 'जोड़ें', te: 'జోడించండి', ml: 'ചേർക്കുക', kn: 'ಸೇರಿಸಿ' },
  'Send': { ta: 'அனுப்பு', hi: 'भेजें', te: 'పంపండి', ml: 'അയയ്ക്കുക', kn: 'ಕಳುಹಿಸಿ' },
  'Send Message': { ta: 'செய்தி அனுப்பு', hi: 'संदेश भेजें', te: 'సందేశం పంపండి', ml: 'സന്ദേശം അയക്കുക', kn: 'ಸಂದೇಶ ಕಳುಹಿಸಿ' },
  'Accept': { ta: 'ஏற்றுக்கொள்', hi: 'स्वीकार करें', te: 'ఆమోదించండి', ml: 'സ്വീകരിക്കുക', kn: 'ಸ್ವೀಕರಿಸಿ' },
  'Accept Booking': { ta: 'முன்பதிவை ஏற்றுக்கொள்', hi: 'बुकिंग स्वीकार करें', te: 'బుకింగ్‌ను ఆమోదించండి', ml: 'ബുക്കിംഗ് സ്വീകരിക്കുക', kn: 'ಬುಕಿಂಗ್ ಸ್ವೀಕರಿಸಿ' },
  'Decline': { ta: 'நிராகரி', hi: 'अस्वीकार करें', te: 'తిరస్కరించండి', ml: 'നിരസിക്കുക', kn: 'ನಿರಾಕರಿಸಿ' },
  'Decline Request': { ta: 'கோரிக்கையை நிராகரி', hi: 'अनुरोध अस्वीकार करें', te: 'అభ్యర్థనను తిరస్కరించండి', ml: 'അഭ്യർത്ഥന നിരസിക്കുക', kn: 'ವಿನಂತಿಯನ್ನು ನಿರಾಕರಿಸಿ' },
  'Download': { ta: 'பதிவிறக்கு', hi: 'डाउनलोड करें', te: 'డౌన్‌లోడ్ చేయండి', ml: 'ഡൗൺലോഡ് ചെയ്യുക', kn: 'ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ' },
  'Download Invoice': { ta: 'விலைப்பட்டியலை பதிவிறக்கு', hi: 'इनवॉइस डाउनलोड करें', te: 'ఇన్‌వాయిస్‌ని డౌన్‌లోడ్ చేయండి', ml: 'ഇൻവോയ്സ് ഡൗൺലോഡ് ചെയ്യുക', kn: 'ಇನ್‌ವಾಯ್ಸ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ' },
  'Upload': { ta: 'பதிவேற்று', hi: 'अपलोड करें', te: 'అప్‌లోడ్ చేయండి', ml: 'അപ്‌ലോഡ് ചെയ്യുക', kn: 'ಅಪ್‌ಲೋಡ್ ಮಾಡಿ' },
  'Pay Now': { ta: 'இப்போது செலுத்தவும்', hi: 'अभी भुगतान करें', te: 'ఇప్పుడే చెల్లించండి', ml: 'ഇപ്പോൾ പണമടയ്ക്കുക', kn: 'ಈಗಲೇ ಪಾವತಿಸಿ' },
  'Continue with Google': { ta: 'Google மூலம் தொடரவும்', hi: 'Google के साथ जारी रखें', te: 'Google తో కొనసాగించండి', ml: 'Google വഴി തുടരുക', kn: 'Google ನೊಂದಿಗೆ ಮುಂದುವರಿಯಿರಿ' },
  'Clear': { ta: 'அழி', hi: 'साफ़ करें', te: 'క్లియర్ చేయండి', ml: 'മായ്ക്കുക', kn: 'ತೆರವುಗೊಳಿಸಿ' },
  'Filter': { ta: 'வடிகட்டு', hi: 'फ़िल्टर करें', te: 'ఫిల్టర్ చేయండి', ml: 'ഫിൽട്ടർ ചെയ്യുക', kn: 'ಫಿಲ್ಟರ್ ಮಾಡಿ' },
  'All': { ta: 'அனைத்தும்', hi: 'सभी', te: 'అన్నీ', ml: 'എല്ലാം', kn: 'ಎಲ್ಲಾ' },
  'Back': { ta: 'பின்செல்', hi: 'वापस जाएं', te: 'వెనుకకు', ml: 'പിന്നോട്ട്', kn: 'ಹಿಂದೆ' },
  'Next': { ta: 'அடுத்து', hi: 'अगला', te: 'తరువాత', ml: 'അടുത്തത്', kn: 'ಮುಂದೆ' },
  'Close': { ta: 'மூடு', hi: 'बंद करें', te: 'మూసివేయండి', ml: 'അടയ്ക്കുക', kn: 'ಮುಚ್ಚಿ' },
  'Refresh': { ta: 'புதுப்பி', hi: 'ताज़ा करें', te: 'రిఫ్రెష్ చేయండి', ml: 'പുതുക്കുക', kn: 'ರಿಫ್ರೆಶ್ ಮಾಡಿ' },
  'Book Now': { ta: 'இப்போதே முன்பதிவு செய்க', hi: 'अभी बुक करें', te: 'ఇప్పుడే బుక్ చేయండి', ml: 'ഇപ്പോൾ ബുക്ക് ചെയ്യുക', kn: 'ಈಗಲೇ ಬುಕ್ ಮಾಡಿ' },
  'Forgot Password?': { ta: 'கடவுச்சொல் மறந்துவிட்டதா?', hi: 'पासवर्ड भूल गए?', te: 'పాస్‌వర్డ్ మర్చిపోయారా?', ml: 'പാസ്‌വേഡ് മറന്നോ?', kn: 'ಪಾಸ್‌ವರ್ಡ್ ಮರೆತಿರಾ?' },

  // Statuses
  'PENDING': { ta: 'நிலுவையில் உள்ளது', hi: 'लंबित', te: 'పెండింగ్‌లో ఉంది', ml: 'തീർപ്പുകൽപ്പിക്കാത്തത്', kn: 'ಬಾಕಿ ಇದೆ' },
  'Pending': { ta: 'நிலுவையில்', hi: 'लंबित', te: 'పెండింగ్', ml: 'തീർപ്പുകൽപ്പിക്കാത്തത്', kn: 'ಬಾಕಿ' },
  'ACCEPTED': { ta: 'ஏற்றுக்கொள்ளப்பட்டது', hi: 'स्वीकृत', te: 'ఆమోదించబడింది', ml: 'സ്വീകരിച്ചു', kn: 'ಸ್ವೀಕರಿಸಲಾಗಿದೆ' },
  'Accepted': { ta: 'ஏற்றுக்கொள்ளப்பட்டது', hi: 'स्वीकृत', te: 'ఆమోదించబడింది', ml: 'സ്വീകരിച്ചു', kn: 'ಸ್ವೀಕರಿಸಲಾಗಿದೆ' },
  'CONFIRMED': { ta: 'உறுதிசெய்யப்பட்டது', hi: 'पुष्ट (कन्फर्म)', te: 'నిర్ధారించబడింది', ml: 'സ്ഥിരീകരിച്ചു', kn: 'ದೃಢೀಕರಿಸಲಾಗಿದೆ' },
  'Confirmed': { ta: 'உறுதிசெய்யப்பட்டது', hi: 'पुष्ट', te: 'నిర్ధారించబడింది', ml: 'സ്ഥിരീകരിച്ചു', kn: 'ದೃಢೀಕರಿಸಲಾಗಿದೆ' },
  'COMPLETED': { ta: 'முடிவடைந்தது', hi: 'पूर्ण', te: 'పూర్తయింది', ml: 'പൂർത്തിയായി', kn: 'ಪೂರ್ಣಗೊಂಡಿದೆ' },
  'Completed': { ta: 'முடிந்தது', hi: 'पूर्ण', te: 'పూర్తయింది', ml: 'പൂർത്തിയായി', kn: 'ಪೂರ್ಣಗೊಂಡಿದೆ' },
  'DECLINED': { ta: 'நிராகரிக்கப்பட்டது', hi: 'अस्वीकृत', te: 'తిరస్కరించబడింది', ml: 'നിരസിച്ചു', kn: 'ನಿರಾಕರಿಸಲಾಗಿದೆ' },
  'Declined': { ta: 'நிராகரிக்கப்பட்டது', hi: 'अस्वीकृत', te: 'తిరస్కరించబడింది', ml: 'നിരസിച്ചു', kn: 'ನಿರಾಕರಿಸಲಾಗಿದೆ' },
  'CANCELLED': { ta: 'ரத்துசெய்யப்பட்டது', hi: 'रद्द', te: 'రద్దు చేయబడింది', ml: 'റദ്ദാക്കി', kn: 'ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ' },
  'Cancelled': { ta: 'ரத்துசெய்யப்பட்டது', hi: 'रद्द', te: 'రద్దు చేయబడింది', ml: 'റദ്ദാക്കി', kn: 'ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ' },
  'ACTIVE': { ta: 'செயலில் உள்ளது', hi: 'सक्रिय', te: 'క్రియాశీలకంగా ఉంది', ml: 'സജീവം', kn: 'ಸಕ್ರಿಯವಾಗಿದೆ' },
  'Active': { ta: 'செயலில்', hi: 'सक्रिय', te: 'క్రియాశీలం', ml: 'സജീവം', kn: 'ಸಕ್ರಿಯ' },
  'IN PROGRESS': { ta: 'நடைபெறுகிறது', hi: 'प्रगति पर है', te: 'పురోగతిలో ఉంది', ml: 'പുരോഗമിക്കുന്നു', kn: 'ಪ್ರಗತಿಯಲ್ಲಿದೆ' },
  'In Progress': { ta: 'நடைபெறுகிறது', hi: 'प्रगति पर', te: 'పురోగతిలో ఉంది', ml: 'പുരോഗമിക്കുന്നു', kn: 'ಪ್ರಗತಿಯಲ್ಲಿದೆ' },
  'PAID': { ta: 'செலுத்தப்பட்டது', hi: 'भुगतान किया गया', te: 'చెల్లించబడింది', ml: 'പണമടച്ചു', kn: 'ಪಾವತಿಸಲಾಗಿದೆ' },
  'Paid': { ta: 'செலுத்தப்பட்டது', hi: 'भुगतान किया', te: 'చెల్లించబడింది', ml: 'പണമടച്ചു', kn: 'ಪಾವತಿಸಲಾಗಿದೆ' },
  'UNPAID': { ta: 'செலுத்தப்படாதது', hi: 'अदत्त (अनपेઇડ)', te: 'చెల్లించలేదు', ml: 'പണമടച്ചില്ല', kn: 'ಪಾವತಿಸಿಲ್ಲ' },
  'Unpaid': { ta: 'செலுத்தப்படாதது', hi: 'अदत्त', te: 'చెల్లించలేదు', ml: 'പണമടച്ചില്ല', kn: 'ಪಾವತಿಸಿಲ್ಲ' },
  'BOOKED': { ta: 'முன்பதிவு செய்யப்பட்டது', hi: 'बुक किया गया', te: 'బుక్ చేయబడింది', ml: 'ബുക്ക് ചെയ്തു', kn: 'ಬುಕ್ ಮಾಡಲಾಗಿದೆ' },
  'Booked': { ta: 'முன்பதிவானது', hi: 'बुक किया गया', te: 'బుక్ చేయబడింది', ml: 'ബുക്ക് ചെയ്തു', kn: 'ಬುಕ್ ಮಾಡಲಾಗಿದೆ' },
  'AVAILABLE': { ta: 'கிடைக்கிறது', hi: 'उपलब्ध', te: 'అందుబాటులో ఉంది', ml: 'ലഭ്യമാണ്', kn: 'ಲಭ್ಯವಿದೆ' },
  'Available': { ta: 'கிடைக்கிறது', hi: 'उपलब्ध', te: 'అందుబాటులో ఉంది', ml: 'ലഭ്യമാണ്', kn: 'ಲಭ್ಯವಿದೆ' },

  // Form Fields & Table Headers
  'Email Address': { ta: 'மின்னஞ்சல் முகவரி', hi: 'ईमेल पता', te: 'ఇమెయిల్ చిరునామా', ml: 'ഇമെയിൽ വിലാസം', kn: 'ಇಮೇಲ್ ವಿಳಾಸ' },
  'Email': { ta: 'மின்னஞ்சல்', hi: 'ईमेल', te: 'ఇమెయిల్', ml: 'ഇമെയിൽ', kn: 'ಇಮೇಲ್' },
  'Password': { ta: 'கடவுச்சொல்', hi: 'पासवर्ड', te: 'పాస్‌వర్డ్', ml: 'പാസ്‌വേഡ്', kn: 'ಪಾಸ್‌ವರ್ಡ್' },
  'Full Name': { ta: 'முழுப் பெயர்', hi: 'पूरा नाम', te: 'పూర్తి పేరు', ml: 'മുഴുവൻ പേര്', kn: 'ಪೂರ್ಣ ಹೆಸರು' },
  'Name': { ta: 'பெயர்', hi: 'नाम', te: 'పేరు', ml: 'പേര്', kn: 'ಹೆಸರು' },
  'Phone Number': { ta: 'தொலைபேசி எண்', hi: 'फ़ोन नंबर', te: 'ఫోన్ నంబర్', ml: 'ഫോൺ നമ്പർ', kn: 'ಫೋನ್ ಸಂಖ್ಯೆ' },
  'Phone': { ta: 'தொலைபேசி', hi: 'फ़ोन', te: 'ఫోన్', ml: 'ഫോൺ', kn: 'ಫೋನ್' },
  'Partner Name': { ta: 'துணைவர் பெயர்', hi: 'जीवनसाथी का नाम', te: 'భాగస్వామి పేరు', ml: 'പങ്കാളിയുടെ പേര്', kn: 'ಸಂಗಾತಿಯ ಹೆಸರು' },
  'Wedding Date': { ta: 'திருமண தேதி', hi: 'शादी की तारीख', te: 'వివాహ తేదీ', ml: 'വിവാഹ തീയതി', kn: 'ಮದುವೆಯ ದಿನಾಂಕ' },
  'Date': { ta: 'தேதி', hi: 'तारीख', te: 'తేదీ', ml: 'തീയതി', kn: 'ದಿನಾಂಕ' },
  'City': { ta: 'நகரம்', hi: 'शहर', te: 'నగరం', ml: 'നഗരം', kn: 'ನಗರ' },
  'State': { ta: 'மாநிலம்', hi: 'राज्य', te: 'రాష్ట్రం', ml: 'സംസ്ഥാനം', kn: 'ರಾಜ್ಯ' },
  'Address': { ta: 'முகவரி', hi: 'पता', te: 'చిరునామా', ml: 'വിലാസം', kn: 'ವಿಳಾಸ' },
  'Venue': { ta: 'திருமண மண்டபம் / இடம்', hi: 'स्थल (वेन्यू)', te: 'వేదిక', ml: 'വേദി', kn: 'ಸ್ಥಳ' },
  'Estimated Budget': { ta: 'மதிப்பிடப்பட்ட பட்ஜெட்', hi: 'अनुमानित बजट', te: 'అంచనా బడ్జెట్', ml: 'കണക്കാക്കിയ ബജറ്റ്', kn: 'ಅಂದಾಜು ಬಜೆಟ್' },
  'Total Budget': { ta: 'மொத்த பட்ஜெட்', hi: 'कुल बजट', te: 'మొత్తం బడ్జెట్', ml: 'ആകെ ബജറ്റ്', kn: 'ಒಟ್ಟು ಬಜೆಟ್' },
  'Remaining Budget': { ta: 'மீதமுள்ள பட்ஜெட்', hi: 'शेष बजट', te: 'మిగిలిన బడ్జెట్', ml: 'ബാക്കി ബജറ്റ്', kn: 'ಉಳಿದ ಬಜೆಟ್' },
  'Guest Count': { ta: 'விருந்தினர் எண்ணிக்கை', hi: 'मेहमानों की संख्या', te: 'అతిథుల సంఖ్య', ml: 'അതിഥികളുടെ എണ്ണം', kn: 'ಅತಿಥಿಗಳ ಸಂಖ್ಯೆ' },
  'Guests': { ta: 'விருந்தினர்கள்', hi: 'मेहमान', te: 'అతిథులు', ml: 'അതിഥികൾ', kn: 'ಅತಿಥಿಗಳು' },
  'Wedding Theme': { ta: 'திருமண தீம்', hi: 'शादी की थीम', te: 'వివాహ థీమ్', ml: 'വിവാഹ തീം', kn: 'ಮದುವೆಯ ಥೀಮ್' },
  'Category': { ta: 'வகை', hi: 'श्रेणी', te: 'వర్గం', ml: 'വിഭാഗം', kn: 'ವರ್ಗ' },
  'Business Name': { ta: 'வணிகப் பெயர்', hi: 'व्यवसाय का नाम', te: 'వ్యాపార పేరు', ml: 'ബിസിനസ്സ് പേര്', kn: 'ವ್ಯವಹಾರದ ಹೆಸರು' },
  'Agency Name': { ta: 'நிறுவனத்தின் பெயர்', hi: 'एजेंसी का नाम', te: 'ఏజెన్సీ పేరు', ml: 'ഏജൻസി പേര്', kn: 'ಏಜೆನ್ಸಿ ಹೆಸರು' },
  'Price': { ta: 'விலை', hi: 'मूल्य', te: 'ధర', ml: 'വില', kn: 'ಬೆಲೆ' },
  'Base Price': { ta: 'அடிப்படை விலை', hi: 'आधार मूल्य', te: 'ప్రాథమిక ధర', ml: 'അടിസ്ഥാന വില', kn: 'ಮೂಲ ಬೆಲೆ' },
  'Amount': { ta: 'தொகை', hi: 'राशि', te: 'మొత్తం', ml: 'തുക', kn: 'ಮೊತ್ತ' },
  'Total Amount': { ta: 'மொத்த தொகை', hi: 'कुल राशि', te: 'మొత్తం సొమ్ము', ml: 'ആകെ തുക', kn: 'ಒಟ್ಟು ಮೊತ್ತ' },
  'Advance Amount': { ta: 'முன்பணம்', hi: 'अग्रिम राशि', te: 'ముందస్తు మొత్తం', ml: 'മുൻകൂർ തുക', kn: 'ಮುಂಗಡ ಮೊತ್ತ' },
  'Paid Amount': { ta: 'செலுத்தப்பட்ட தொகை', hi: 'भुगतान की गई राशि', te: 'చెల్లించిన మొత్తం', ml: 'നൽകിയ തുക', kn: 'ಪಾವತಿಸಿದ ಮೊತ್ತ' },
  'Balance Due': { ta: 'மீதமுள்ள நிலுவை', hi: 'बकाया राशि', te: 'మిగిలిన బకాయి', ml: 'ബാക്കി തുക', kn: 'ಬಾಕಿ ಮೊತ್ತ' },
  'Due': { ta: 'நிலுவை', hi: 'बकाया', te: 'బకాయి', ml: 'ബാക്കി', kn: 'ಬಾಕಿ' },
  'Experience': { ta: 'அனுபவம்', hi: 'अनुभव', te: 'అనుభవం', ml: 'പരിചയം', kn: 'ಅನುಭವ' },
  'Rating': { ta: 'தரமதிப்பீடு', hi: 'रेटिंग', te: 'రేటింగ్', ml: 'റേറ്റിംഗ്', kn: 'ರೇಟಿಂಗ್' },
  'Feedback': { ta: 'கருத்து', hi: 'प्रतिक्रिया', te: 'అభిప్రాయం', ml: 'അഭിപ്രായം', kn: 'ಪ್ರತಿಕ್ರಿಯೆ' },
  'Timeline': { ta: 'காலவரிசை', hi: 'समयरेखा', te: 'టైమ్‌లైన్', ml: 'സമയരേഖ', kn: 'ಸಮಯಾವಧಿ' },
  'Tasks': { ta: 'பணிகள்', hi: 'कार्य', te: 'పనులు', ml: 'ജോലികൾ', kn: 'ಕಾರ್ಯಗಳು' },
  'Task': { ta: 'பணி', hi: 'कार्य', te: 'పని', ml: 'ജോലി', kn: 'ಕಾರ್ಯ' },
  'Invoice Number': { ta: 'விலைப்பட்டியல் எண்', hi: 'चालान संख्या', te: 'ఇన్‌వాయిస్ సంఖ్య', ml: 'ഇൻവോയ്സ് നമ്പർ', kn: 'ಇನ್‌ವಾಯ್ಸ್ ಸಂಖ್ಯೆ' },
  'Booking Code': { ta: 'முன்பதிவு குறியீடு', hi: 'बुकिंग कोड', te: 'బుకింగ్ కోడ్', ml: 'ബുക്കിംഗ് കോഡ്', kn: 'ಬುಕಿಂಗ್ ಕೋಡ್' },
  'Project Code': { ta: 'திட்டக் குறியீடு', hi: 'प्रोजेक्ट कोड', te: 'ప్రాజెక్ట్ కోడ్', ml: 'പ്രോജക്റ്റ് കോഡ്', kn: 'ಪ್ರಾಜೆಕ್ಟ್ ಕೋಡ್' },

  // Stats & Dashboard Cards
  'Overview': { ta: 'மேலோட்டம்', hi: 'अवलोकन', te: 'అవలోకనం', ml: 'അവലോകനം', kn: 'ಅವಲೋಕನ' },
  'Total Projects': { ta: 'மொத்த திட்டங்கள்', hi: 'कुल परियोजनाएं', te: 'మొత్తం ప్రాజెక్టులు', ml: 'ആകെ പ്രോജക്ടുകൾ', kn: 'ಒಟ್ಟು ಪ್ರಾಜೆಕ್ಟ್‌ಗಳು' },
  'Active Projects': { ta: 'செயலில் உள்ள திட்டங்கள்', hi: 'सक्रिय परियोजनाएं', te: 'క్రియాశీల ప్రాజెక్టులు', ml: 'സജീവ പ്രോജക്ടുകൾ', kn: 'ಸಕ್ರಿಯ ಪ್ರಾಜೆಕ್ಟ್‌ಗಳು' },
  'Active Weddings': { ta: 'நடப்பு திருமணங்கள்', hi: 'सक्रिय शादियां', te: 'క్రియాశీల వివాహాలు', ml: 'സജീവ വിവാഹങ്ങൾ', kn: 'ಸಕ್ರಿಯ ಮದುವೆಗಳು' },
  'Total Revenue': { ta: 'மொத்த வருவாய்', hi: 'कुल राजस्व', te: 'మొత్తం రాబడి', ml: 'ആകെ വരുമാനം', kn: 'ಒಟ್ಟು ಆದಾಯ' },
  'Total Spent': { ta: 'மொத்த செலவு', hi: 'कुल खर्च', te: 'మొత్తం ఖర్చు', ml: 'ആകെ ചെലവ്', kn: 'ಒಟ್ಟು ವೆಚ್ಚ' },
  'Total Bookings': { ta: 'மொத்த முன்பதிவுகள்', hi: 'कुल बुकिंग', te: 'మొత్తం బుకింగ్‌లు', ml: 'ആകെ ബുക്കിംഗുകൾ', kn: 'ಒಟ್ಟು ಬುಕಿಂಗ್‌ಗಳು' },
  'Recent Activity': { ta: 'சமீபத்திய செயல்பாடுகள்', hi: 'हाल की गतिविधि', te: 'ఇటీవలి కార్యాచరణ', ml: 'സമീപകാല പ്രവർത്തനം', kn: 'ಇತ್ತೀಚಿನ ಚಟುವಟಿಕೆ' },
  'Upcoming Events': { ta: 'வரவிருக்கும் நிகழ்வுகள்', hi: 'आगामी कार्यक्रम', te: 'రాబోయే ఈవెంట్‌లు', ml: 'വരാനിരിക്കുന്ന ഇവന്റുകൾ', kn: 'ಮುಂಬರುವ ಈವೆಂಟ್‌ಗಳು' },
  'Wedding Countdown': { ta: 'திருமண கவுண்ட்டவுன்', hi: 'शादी की उलटी गिनती', te: 'వివాహ కౌంట్‌డౌన్', ml: 'വിവാഹ കൗണ്ട്ഡൗൺ', kn: 'ಮದುವೆಯ ಕೌಂಟ್‌ಡೌನ್' },
  'Days Left': { ta: 'மீதமுள்ள நாட்கள்', hi: 'शेष दिन', te: 'మిగిలిన రోజులు', ml: 'ബാക്കിയുള്ള ദിവസങ്ങൾ', kn: 'ಉಳಿದ ದಿನಗಳು' },
  'Quick Actions': { ta: 'விரைவுச் செயல்கள்', hi: 'त्वरित कार्रवाइयां', te: 'త్వరిత చర్యలు', ml: 'ദ്രുത പ്രവർത്തനങ്ങൾ', kn: 'ತ್ವರಿತ ಕ್ರಮಗಳು' },
  'Quick Sample Logins': { ta: 'மாதிரி விரைவு உள்நுழைவு', hi: 'त्वरित नमूना लॉगिन', te: 'త్వరిత నమూనా లాగిన్లు', ml: 'ദ്രുത സാമ്പിൾ ലോഗിനുകൾ', kn: 'ತ್ವರಿತ ಮಾದರಿ ಲಾಗಿನ್‌ಗಳು' },

  // Settings & Theme
  'Appearance & Theme': { ta: 'தோற்றம் & தீம்', hi: 'उपस्थिति और थीम', te: 'రూపం మరియు థీమ్', ml: 'രൂപവും തീമും', kn: 'ಗೋಚರತೆ ಮತ್ತು ಥೀಮ್' },
  'Light Mode': { ta: 'வெளிச்சப் பயன்முறை', hi: 'लाइट मोड', te: 'లైట్ మోడ్', ml: 'ലൈറ്റ് മോഡ്', kn: 'ಲೈಟ್ ಮೋಡ್' },
  'Dark Mode': { ta: 'இருண்ட பயன்முறை', hi: 'डार्क मोड', te: 'డార్క్ మోడ్', ml: 'ഡാർക്ക് മോഡ്', kn: 'ಡಾರ್ಕ್ ಮೋಡ್' },
  'Font Size': { ta: 'எழுத்துரு அளவு', hi: 'फ़ॉन्ट का आकार', te: 'ఫాంట్ పరిమాణం', ml: 'ഫോണ്ട് വലിപ്പം', kn: 'ಫಾಂಟ್ ಗಾತ್ರ' },
  'Small': { ta: 'சிறியது', hi: 'छोटा', te: 'చిన్నది', ml: 'ചെറുത്', kn: 'ಸಣ್ಣ' },
  'Medium': { ta: 'நடுத்தரமானது', hi: 'मध्यम', te: 'మధ్యస్థం', ml: 'ഇടത്തരം', kn: 'ಮಧ್ಯಮ' },
  'Large': { ta: 'பெரியது', hi: 'बड़ा', te: 'పెద్దది', ml: 'വലുത്', kn: 'ದೊಡ್ಡದು' },
  'Extra Large': { ta: 'மிகப் பெரியது', hi: 'बहुत बड़ा', te: 'చాలా పెద్దది', ml: 'വളരെ വലുത്', kn: 'ಅತಿದೊಡ್ಡ' },
  'Display Language': { ta: 'காட்சி மொழி', hi: 'प्रदर्शन भाषा', te: 'ప్రదర్శన భాష', ml: 'പ്രദർശന ഭാഷ', kn: 'ಪ್ರದರ್ಶನ ಭಾಷೆ' },
  'Account & Security': { ta: 'கணக்கு & பாதுகாப்பு', hi: 'खाता और सुरक्षा', te: 'ఖాతా & భద్రత', ml: 'അക്കൗണ്ടും സുരക്ഷയും', kn: 'ಖಾತೆ & ಭದ್ರತೆ' },
  'Change Password': { ta: 'கடவுச்சொல்லை மாற்றவும்', hi: 'पासवर्ड बदलें', te: 'పాస్‌వర్డ్ మార్చండి', ml: 'പാസ്‌വേഡ് മാറ്റുക', kn: 'ಪಾಸ್‌ವರ್ಡ್ ಬದಲಾಯಿಸಿ' },
  'Current Password': { ta: 'தற்போதைய கடவுச்சொல்', hi: 'वर्तमान पासवर्ड', te: 'ప్రస్తుత పాస్‌వర్డ్', ml: 'നിലവിലെ പാസ്‌വേഡ്', kn: 'ಪ್ರಸ್ತುತ ಪಾಸ್‌ವರ್ಡ್' },
  'New Password': { ta: 'புதிய கடவுச்சொல்', hi: 'नया पासवर्ड', te: 'కొత్త పాస్‌వర్డ్', ml: 'പുതിയ പാസ്‌വേഡ്', kn: 'ಹೊಸ ಪಾಸ್‌ವರ್ಡ್' },
  'Confirm Password': { ta: 'கடவுச்சொல்லை உறுதிசெய்', hi: 'पासवर्ड की पुष्टि करें', te: 'పాస్‌వర్డ్‌ను నిర్ధారించండి', ml: 'പാസ്‌വേഡ് സ്ഥിരീകരിക്കുക', kn: 'ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ' },

  // Chatbot
  'AI Wedding Concierge': { ta: 'AI திருமண உதவியாளர்', hi: 'एआई वेडिंग सहायक', te: 'AI వివాహ సహాయకుడు', ml: 'AI വിവാഹ സഹായി', kn: 'AI ಮದುವೆ ಸಹಾಯಕ' },
  'Ask me anything about your wedding planning...': { ta: 'உங்கள் திருமணத் திட்டமிடல் பற்றி எதுவும் கேளுங்கள்...', hi: 'अपनी शादी की योजना के बारे में कुछ भी पूछें...', te: 'మీ వివాహ ప్రణాళిక గురించి ఏదైనా అడగండి...', ml: 'നിങ്ങളുടെ വിവാഹ ആസൂത്രണത്തെക്കുറിച്ച് എന്തും ചോദിക്കൂ...', kn: 'ನಿಮ್ಮ ಮದುವೆಯ ಯೋಜನೆ ಬಗ್ಗೆ ಏನನ್ನಾದರೂ ಕೇಳಿ...' },
  'Type a message...': { ta: 'செய்தியை உள்ளிடவும்...', hi: 'एक संदेश लिखें...', te: 'సందేశాన్ని టైప్ చేయండి...', ml: 'സന്ദേശം ടൈപ്പ് ചെയ്യുക...', kn: 'ಸಂದೇಶವನ್ನು ಟೈಪ್ ಮಾಡಿ...' },
  'What is my booking status?': { ta: 'என் முன்பதிவு நிலை என்ன?', hi: 'मेरी बुकिंग स्थिति क्या है?', te: 'నా బుకింగ్ స్థితి ఏమిటి?', ml: 'എന്റെ ബുക്കിംഗ് നില എന്താണ്?', kn: 'ನನ್ನ ಬುಕಿಂಗ್ ಸ್ಥಿತಿ ಏನು?' },
  'How much have I paid?': { ta: 'நான் எவ்வளவு செலுத்தியுள்ளேன்?', hi: 'मैंने कितना भुगतान किया है?', te: 'నేను ఎంత చెల్లించాను?', ml: 'ഞാൻ എത്ര പണം നൽകി?', kn: 'ನಾನು ಎಷ್ಟು ಪಾವತಿಸಿದ್ದೇನೆ?' },
  'What vendors have been selected?': { ta: 'எந்த விற்பனையாளர்கள் தேர்ந்தெடுக்கப்பட்டுள்ளனர்?', hi: 'कौन से विक्रेता चुने गए हैं?', te: 'ఏ విక్రేతలు ఎంపికయ్యారు?', ml: 'ഏതൊക്കെ വെണ്ടർമാരെ തിരഞ്ഞെടുത്തു?', kn: 'ಯಾವ ಮಾರಾಟಗಾರರನ್ನು ಆಯ್ಕೆ ಮಾಡಲಾಗಿದೆ?' },
  'When is my wedding?': { ta: 'என் திருமணம் எப்போது?', hi: 'मेरी शादी कब है?', te: 'నా వివాహం ఎప్పుడు?', ml: 'എന്റെ വിവാഹം എപ്പോഴാണ്?', kn: 'ನನ್ನ ಮದುವೆ ಯಾವಾಗ?' },
  'How do I submit wedding requirements?': { ta: 'திருமண தேவைகளை எவ்வாறு சமர்ப்பிப்பது?', hi: 'शादी की आवश्यकताएं कैसे सबमिट करें?', te: 'వివాహ అవసరాలను ఎలా సమర్పించాలి?', ml: 'വിവാഹ ആവശ്യകതകൾ എങ്ങനെ സമർപ്പിക്കാം?', kn: 'ಮದುವೆಯ ಅಗತ್ಯತೆಗಳನ್ನು ಹೇಗೆ ಸಲ್ಲಿಸುವುದು?' },

  // Vendor Categories
  'Photography & Videography': { ta: 'புகைப்படம் & வீடியோகிராபி', hi: 'फोटोग्राफी और वीडियोग्राफी', te: 'ఫోటోగ్రఫీ & వీడియోగ్రఫీ', ml: 'ഫോട്ടോഗ്രാഫിയും വീഡിയോഗ്രാഫിയും', kn: 'ಫೋಟೋಗ್ರಫಿ & ವೀಡಿಯೋಗ್ರಫಿ' },
  'Photography': { ta: 'புகைப்படம்', hi: 'फोटोग्राफी', te: 'ఫోటోగ్రఫీ', ml: 'ഫോട്ടോഗ്രാഫി', kn: 'ಫೋಟೋಗ್ರಫಿ' },
  'Catering & Banquets': { ta: 'உணவு & விருந்து', hi: 'खानपान और बैंक्वेट', te: 'కేటరింగ్ & విందులు', ml: 'കേറ്ററിംഗും വിരുന്നുകളും', kn: 'ಕೇಟರಿಂಗ್ & ಔತಣಕೂಟಗಳು' },
  'Catering': { ta: 'உணவு வழங்கல்', hi: 'खानपान (कैटरिंग)', te: 'కేటరింగ్', ml: 'കേറ്ററിംഗ്', kn: 'ಕೇಟರಿಂಗ್' },
  'Decoration & Florals': { ta: 'அலங்காரம் & மலர்கள்', hi: 'सजावट और पुष्प', te: 'డెకరేషన్ & పూలు', ml: 'അലങ്കാരവും പൂക്കളും', kn: 'ಅಲಂಕಾರ & ಹೂಗಳು' },
  'Decoration': { ta: 'அலங்காரம்', hi: 'सजावट', te: 'అలంకరణ', ml: 'അലങ്കാരം', kn: 'ಅಲಂಕಾರ' },
  'Bridal Makeup & Hair': { ta: 'மணப்பெண் ஒப்பனை & சிகை அலங்காரம்', hi: 'दुल्हन का मेकअप और बाल', te: 'బ్రైడల్ మేకప్ & హెయిర్', ml: 'ബ്രൈഡൽ മേക്കപ്പും മുടിയും', kn: 'ವಧುವಿನ ಮೇಕಪ್ & ಕೇಶವಿನ್ಯಾಸ' },
  'Mehendi Art': { ta: 'மருதாணி கலை', hi: 'मेहंदी कला', te: 'మెహందీ కళ', ml: 'മെഹന്ദി കല', kn: 'ಮೆಹಂದಿ ಕಲೆ' },
  'Bridal Wear & Styling': { ta: 'மணப்பெண் ஆடை & வடிவமைப்பு', hi: 'दुल्हन के कपड़े और स्टाइलिंग', te: 'బ్రైడల్ వేర్ & స్టైలింగ్', ml: 'ബ്രൈഡൽ വെയർ & സ്റ്റൈലിംഗ്', kn: 'ವಧುವಿನ ಉಡುಪು & ವಿನ್ಯಾಸ' },
  'Wedding Stationery': { ta: 'திருமண அழைப்பிதழ்கள்', hi: 'शादी के निमंत्रण पत्र', te: 'వివాహ ఆహ్వానాలు', ml: 'വിവാഹ ക്ഷണക്കത്തുകൾ', kn: 'ಮದುವೆಯ ಆಮಂತ್ರಣಗಳು' },
  'Jewellery': { ta: 'நகை மற்றும் ஆபரணங்கள்', hi: 'आभूषण', te: 'ఆభరణాలు', ml: 'ആഭരണങ്ങൾ', kn: 'ಆಭರಣಗಳು' },
  'Wedding Cakes': { ta: 'திருமண கேக்குகள்', hi: 'शादी के केक', te: 'వివాహ కేకులు', ml: 'വിവാഹ കേക്കുകൾ', kn: 'ಮದುವೆಯ ಕೇಕ್‌ಗಳು' },
  'Music & Entertainment': { ta: 'இசை & பொழுதுபோக்கு', hi: 'संगीत और मनोरंजन', te: 'సంగీతం & వినోదం', ml: 'സംഗീതവും വിനോദവും', kn: 'ಸಂಗೀತ & ಮನರಂಜನೆ' },
  'Luxury Transportation': { ta: 'சொகுசு போக்குவரத்து', hi: 'लक्जरी परिवहन', te: 'లగ్జరీ రవాణా', ml: 'ആഡംബര ഗതാഗതം', kn: 'ಐಷಾರಾಮಿ ಸಾರಿಗೆ' }
};

// Build high-performance lookup indexes for fast real-time DOM translation
const LOWERCASE_LOOKUPS = { ta: {}, hi: {}, te: {}, ml: {}, kn: {} };
const PHRASE_LIST = Object.keys(GLOBAL_PHRASES).sort((a, b) => b.length - a.length);

['ta', 'hi', 'te', 'ml', 'kn'].forEach(lang => {
  PHRASE_LIST.forEach(phrase => {
    const val = GLOBAL_PHRASES[phrase][lang];
    if (val) {
      LOWERCASE_LOOKUPS[lang][phrase.toLowerCase()] = val;
    }
  });

  // Also include base translation dictionary keys
  if (TRANSLATIONS[lang]) {
    Object.keys(TRANSLATIONS[lang]).forEach(k => {
      const enVal = TRANSLATIONS.en[k];
      if (enVal) {
        LOWERCASE_LOOKUPS[lang][enVal.toLowerCase()] = TRANSLATIONS[lang][k];
      }
    });
  }
});

// Translation algorithm: translates full text or phrases smoothly
export function translateText(text, lang) {
  if (!text || typeof text !== 'string' || lang === 'en') return text;

  const trimmed = text.trim();
  if (!trimmed) return text;

  const lookup = LOWERCASE_LOOKUPS[lang];
  if (!lookup) return text;

  const lower = trimmed.toLowerCase();

  // 1. Direct exact trimmed match
  if (lookup[lower]) {
    const matched = lookup[lower];
    const leadingSpaces = text.match(/^\s*/)[0];
    const trailingSpaces = text.match(/\s*$/)[0];
    return leadingSpaces + matched + trailingSpaces;
  }

  // 2. Multi-word phrase replacement
  let result = text;
  let hasReplaced = false;

  for (let i = 0; i < PHRASE_LIST.length; i++) {
    const phrase = PHRASE_LIST[i];
    if (phrase.length < 3) continue;

    const phraseLower = phrase.toLowerCase();
    if (result.toLowerCase().includes(phraseLower)) {
      const trans = lookup[phraseLower];
      if (trans) {
        const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
        if (regex.test(result)) {
          result = result.replace(regex, trans);
          hasReplaced = true;
        } else {
          const generalRegex = new RegExp(escaped, 'gi');
          result = result.replace(generalRegex, trans);
          hasReplaced = true;
        }
      }
    }
  }

  return hasReplaced ? result : text;
}

// Elements that must never be modified by translation
const IGNORED_TAGS = new Set([
  'SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE', 'SVG', 'PATH', 'IFRAME', 'CANVAS'
]);

function isIgnored(element) {
  if (!element || element.nodeType !== Node.ELEMENT_NODE) return false;
  if (IGNORED_TAGS.has(element.tagName)) return true;
  if (element.classList && (element.classList.contains('notranslate') || element.classList.contains('gm-style'))) return true;
  if (element.closest && element.closest('.notranslate, .gm-style')) return true;
  return false;
}

// Recursively walks and translates text nodes and placeholders in the DOM
export function translateDOM(rootNode, lang) {
  if (!rootNode) return;

  function walk(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (!node.parentElement || isIgnored(node.parentElement)) return;

      const parentTag = node.parentElement.tagName;
      if (parentTag === 'INPUT' || parentTag === 'TEXTAREA' || parentTag === 'SELECT') return;

      const raw = node.nodeValue;
      if (!raw || !raw.trim()) return;

      if (node._wpvcpOrigText === undefined) {
        node._wpvcpOrigText = raw;
      }

      if (lang === 'en') {
        if (node._wpvcpOrigText !== undefined && node.nodeValue !== node._wpvcpOrigText) {
          node.nodeValue = node._wpvcpOrigText;
        }
      } else {
        const source = node._wpvcpOrigText || raw;
        const translated = translateText(source, lang);
        if (translated && translated !== node.nodeValue) {
          node.nodeValue = translated;
        }
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (isIgnored(node)) return;

      // Translate input / textarea placeholders
      if (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA') {
        if (node.placeholder) {
          if (node._wpvcpOrigPlaceholder === undefined) {
            node._wpvcpOrigPlaceholder = node.placeholder;
          }
          if (lang === 'en') {
            if (node._wpvcpOrigPlaceholder !== undefined) {
              node.placeholder = node._wpvcpOrigPlaceholder;
            }
          } else {
            node.placeholder = translateText(node._wpvcpOrigPlaceholder, lang);
          }
        }
      }

      const children = Array.from(node.childNodes);
      for (let i = 0; i < children.length; i++) {
        walk(children[i]);
      }
    }
  }

  walk(rootNode);
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('wpvcp_lang') || 'en';
  });

  const setLanguage = (langCode) => {
    if (LANGUAGES.some(l => l.code === langCode)) {
      setLanguageState(langCode);
      localStorage.setItem('wpvcp_lang', langCode);
    }
  };

  // Translation function for programmatic use in components
  const t = (keyOrPhrase) => {
    if (!keyOrPhrase) return '';
    if (language === 'en') {
      return TRANSLATIONS.en[keyOrPhrase] || keyOrPhrase;
    }
    const currentDict = TRANSLATIONS[language];
    if (currentDict && currentDict[keyOrPhrase]) {
      return currentDict[keyOrPhrase];
    }
    return translateText(keyOrPhrase, language);
  };

  // Real-time automatic translation across the entire DOM tree
  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem('wpvcp_lang', language);

    let observer = null;
    let timeoutId = null;

    const applyTranslation = () => {
      if (observer) observer.disconnect();
      try {
        if (document.body) {
          translateDOM(document.body, language);
        }
      } catch (err) {
        console.warn('[Language Translation]:', err);
      } finally {
        if (observer && document.body) {
          observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
          });
        }
      }
    };

    // Run translation immediately
    applyTranslation();

    // Setup MutationObserver to automatically translate dynamic React components, modals, and route transitions
    observer = new MutationObserver(() => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        applyTranslation();
      }, 40);
    });

    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
      });
    }

    const handleRouteChange = () => {
      setTimeout(applyTranslation, 60);
    };

    window.addEventListener('popstate', handleRouteChange);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (observer) observer.disconnect();
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
}
