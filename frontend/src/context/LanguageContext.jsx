import React, { createContext, useContext, useState, useEffect } from 'react';

const TRANSLATIONS = {
  EN: {
    // Top Bar & Header
    deliverTo: 'Deliver to',
    noAddress: 'No address added',
    selectLocation: 'Select Job Site Location',
    changeAddress: 'Change Address',
    addAddress: 'Add Address',
    searchPlaceholder: 'Search for Plywood, Fevicol, CPVC, Cement...',
    profile: 'Profile',
    cart: 'Cart',
    materialList: 'Material List',
    snapList: 'Snap List',
    bookLabour: 'Book Labour',
    categories: 'Categories',
    home: 'Home',
    account: 'Account',
    adminConsole: 'Admin Console',
    logout: 'Logout',
    signIn: 'Sign In',
    
    // Feature Strip
    freeDelivery: 'FREE DELIVERY',
    deliverySub: 'IN 30 MINS*',
    cashback: '5% CASHBACK*',
    cashbackSub: 'ON ORDERS',
    spendPromo: '₹2,500',
    spendPromoSub: 'ON ₹50K SPENT',
    genuineProducts: 'GENUINE',
    genuineSub: 'PRODUCTS',
    
    // Construction Stages
    stagesHeading: 'Shop by Construction Category',
    snapPaperList: 'Have a paper list? Snap & Send to Admin',
    
    // Banners & Deals
    flatCashback: 'FLAT 5% CASHBACK',
    cashbackOrders: 'on orders above ₹50,000. No limits.',
    useCoupon: 'USE COUPON',
    shopNow: 'SHOP NOW',
    todaysDeals: "Today's Deals",
    dealsSubtitle: '⚡ Limited-time factory price drops on high-demand site essentials',
    endsIn: 'Ends in',
    viewAll: 'View All',
    exploreAll: 'Explore All',
    bestselling: 'Bestselling Materials',
    contractorFavorites: 'CONTRACTOR FAVORITES',
    shopByBrand: 'Shop by brand',
    
    // Actions & Buttons
    add: '+ ADD',
    inList: '✓ IN LIST',
    addToList: '+ List',
    select: 'SELECT',
    options: 'Options',
    tapToAddList: '👆 TAP IMAGE TO ADD TO MATERIAL LIST',
    inMaterialList: '✓ IN MATERIAL LIST',
    
    // WhatsApp Banner
    whatsappHeading: 'Shop Smarter, get support instantly.',
    whatsappSub: 'Everything you need, right on Whatsapp',
    orderViaWhatsApp: 'Order via Whatsapp',
    helpSupport: 'Help & Support',
    orderStatus: 'Order Status',
    productDiscovery: 'Product Discovery',
    
    // Footer & Callouts
    materialsInMinutes: 'Materials In Minutes',
    directPlant: 'Direct Plant Procurement'
  },
  HI: {
    // Hindi (हिन्दी)
    deliverTo: 'डिलीवरी पता',
    noAddress: 'कोई पता नहीं जोड़ा',
    selectLocation: 'साइट का स्थान चुनें',
    changeAddress: 'पता बदलें',
    addAddress: 'पता जोड़ें',
    searchPlaceholder: 'सीमेंट, सरिया, पाइप, टाइल्स, फेविकोल खोजें...',
    profile: 'प्रोफाइल',
    cart: 'कार्ट',
    materialList: 'सामग्री सूची',
    snapList: 'पर्ची फोटो भेजें',
    bookLabour: 'मजदूर बुक करें',
    categories: 'श्रेणियां',
    home: 'होम',
    account: 'खाता',
    adminConsole: 'व्यवस्थापक कंसोल',
    logout: 'लॉगआउट',
    signIn: 'साइन इन',
    
    // Feature Strip
    freeDelivery: 'मुफ्त डिलीवरी',
    deliverySub: '30 मिनट में*',
    cashback: '5% कैशबैक*',
    cashbackSub: 'सभी ऑर्डर पर',
    spendPromo: '₹2,500 छूट',
    spendPromoSub: '₹50,000 खर्च पर',
    genuineProducts: '100% असली',
    genuineSub: 'प्रमाणित सामग्री',
    
    // Construction Stages
    stagesHeading: 'निर्माण श्रेणी अनुसार खरीदें',
    snapPaperList: 'हाथ से लिखी पर्ची है? फोटो खींचकर एडमिन को भेजें',
    
    // Banners & Deals
    flatCashback: 'फ्लैट 5% कैशबैक',
    cashbackOrders: '₹50,000 से अधिक के ऑर्डर पर। असीमित।',
    useCoupon: 'कूपन कोड',
    shopNow: 'अभी खरीदें',
    todaysDeals: 'आज के धमाकेदार ऑफर्स',
    dealsSubtitle: '⚡ निर्माण सामग्री पर सीधे फैक्ट्री डिस्काउंट',
    endsIn: 'समाप्त होगा',
    viewAll: 'सभी देखें',
    exploreAll: 'सभी खोजें',
    bestselling: 'सर्वाधिक बिकने वाली सामग्री',
    contractorFavorites: 'ठेकेदारों की पसंद',
    shopByBrand: 'ब्रांड अनुसार खरीदें',
    
    // Actions & Buttons
    add: '+ जोड़ें',
    inList: '✓ सूची में है',
    addToList: '+ लिस्ट',
    select: 'विकल्प चुनें',
    options: 'विकल्प',
    tapToAddList: '👆 लिस्ट में जोड़ने के लिए फोटो पर टैप करें',
    inMaterialList: '✓ मटेरियल लिस्ट में शामिल',
    
    // WhatsApp Banner
    whatsappHeading: 'व्हाट्सएप पर तुरंत ऑर्डर और सहायता पाएं।',
    whatsappSub: 'आपकी निर्माण साइट की हर जरूरत व्हाट्सएप पर',
    orderViaWhatsApp: 'व्हाट्सएप से ऑर्डर करें',
    helpSupport: 'हेल्प और सपोर्ट',
    orderStatus: 'ऑर्डर स्टेटस',
    productDiscovery: 'सामग्री खोजें',
    
    // Footer & Callouts
    materialsInMinutes: 'मिनटों में साइट पर डिलीवरी',
    directPlant: 'सीधे फैक्ट्री से खरीद'
  },
  KN: {
    // Kannada (ಕನ್ನಡ)
    deliverTo: 'ವಿತರಣಾ ಸ್ಥಳ',
    noAddress: 'ವಿಳಾಸ ಸೇರಿಸಲಾಗಿಲ್ಲ',
    selectLocation: 'ಸೈಟ್ ಸ್ಥಳವನ್ನು ಆಯ್ಕೆಮಾಡಿ',
    changeAddress: 'ವಿಳಾಸ ಬದಲಾಯಿಸಿ',
    addAddress: 'ವಿಳಾಸ ಸೇರಿಸಿ',
    searchPlaceholder: 'ಸಿಮೆಂಟ್, ಉಕ್ಕು, ಪೈಪ್‌ಗಳು, ಟೈಲ್ಸ್ ಹುಡುಕಿ...',
    profile: 'ಪ್ರೊಫೈಲ್',
    cart: 'ಕಾರ್ಟ್',
    materialList: 'ಸಾಮಗ್ರಿ ಪಟ್ಟಿ',
    snapList: 'ಪಟ್ಟಿ ಫೋಟೋ ಕಳುಹಿಸಿ',
    bookLabour: 'ಕಾರ್ಮಿಕರ ಬುಕಿಂಗ್',
    categories: 'ವರ್ಗಗಳು',
    home: 'ಮುಖಪುಟ',
    account: 'ಖಾತೆ',
    adminConsole: 'ನಿರ್ವಾಹಕ ಕನ್ಸೋಲ್',
    logout: 'ನಿರ್ಗಮಿಸಿ',
    signIn: 'ಸೈನ್ ಇನ್',
    
    freeDelivery: 'ಉಚಿತ ವಿತರಣೆ',
    deliverySub: '30 ನಿಮಿಷಗಳಲ್ಲಿ*',
    cashback: '5% ಕ್ಯಾಶ್‌ಬ್ಯಾಕ್*',
    cashbackSub: 'ಪ್ರತಿ ಆರ್ಡರ್‌ನಲ್ಲಿ',
    spendPromo: '₹2,500 ಉಳಿತಾಯ',
    spendPromoSub: '₹50,000 ಖರ್ಚಿನಲ್ಲಿ',
    genuineProducts: 'ಅಸಲಿ ಸಾಮಗ್ರಿ',
    genuineSub: 'ಪ್ರಮಾಣೀಕೃತ',
    
    stagesHeading: 'ನಿರ್ಮಾಣ ವರ್ಗಗಳ ಪ್ರಕಾರ ಖರೀದಿಸಿ',
    snapPaperList: 'ಬರೆದ ಪಟ್ಟಿ ಇದೆಯೇ? ಫೋಟೋ ತೆಗೆದು ಕಳುಹಿಸಿ',
    
    flatCashback: 'ಫ್ಲಾಟ್ 5% ಕ್ಯಾಶ್‌ಬ್ಯಾಕ್',
    cashbackOrders: '₹50,000 ಕ್ಕಿಂತ ಹೆಚ್ಚಿನ ಆರ್ಡರ್‌ಗಳಿಗೆ.',
    useCoupon: 'ಕೂಪನ್ ಬಳಸಿ',
    shopNow: 'ಈಗಲೇ ಖರೀದಿಸಿ',
    todaysDeals: 'ಇಂದಿನ ಡೀಲ್‌ಗಳು',
    dealsSubtitle: '⚡ ಫ್ಯಾಕ್ಟರಿ ರಿಯಾಯಿತಿ ದರಗಳು',
    endsIn: 'ಮುಕ್ತಾಯಗೊಳ್ಳುತ್ತದೆ',
    viewAll: 'ಎಲ್ಲವನ್ನೂ ವೀಕ್ಷಿಸಿ',
    exploreAll: 'ಎಲ್ಲವನ್ನೂ ಅನ್ವೇಷಿಸಿ',
    bestselling: 'ಹೆಚ್ಚು ಮಾರಾಟವಾಗುವ ಸಾಮಗ್ರಿಗಳು',
    contractorFavorites: 'ಗುತ್ತಿಗೆದಾರರ ಮೆಚ್ಚಿನವುಗಳು',
    shopByBrand: 'ಬ್ರಾಂಡ್ ಮೂಲಕ ಖರೀದಿಸಿ',
    
    add: '+ ಸೇರಿಸಿ',
    inList: '✓ ಪಟ್ಟಿಯಲ್ಲಿದೆ',
    addToList: '+ ಪಟ್ಟಿ',
    select: 'ಆಯ್ಕೆಮಾಡಿ',
    options: 'ಆಯ್ಕೆಗಳು',
    tapToAddList: '👆 ಪಟ್ಟಿಗೆ ಸೇರಿಸಲು ಟ್ಯಾಪ್ ಮಾಡಿ',
    inMaterialList: '✓ ಸಾಮಗ್ರಿ ಪಟ್ಟಿಯಲ್ಲಿದೆ',
    
    whatsappHeading: 'ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ತಕ್ಷಣದ ಸಹಾಯ ಪಡೆಯಿರಿ.',
    whatsappSub: 'ನಿಮ್ಮ ಸೈಟ್ ಅಗತ್ಯಗಳು ವಾಟ್ಸಾಪ್‌ನಲ್ಲೇ ಲಭ್ಯ',
    orderViaWhatsApp: 'ವಾಟ್ಸಾಪ್ ಮೂಲಕ ಆರ್ಡರ್',
    helpSupport: 'ಸಹಾಯ ಮತ್ತು ಬೆಂಬಲ',
    orderStatus: 'ಆರ್ಡರ್ ಸ್ಥಿತಿ',
    productDiscovery: 'ಉತ್ಪನ್ನಗಳ ಪರಿಶೀಲನೆ',
    materialsInMinutes: 'ನಿಮಿಷಗಳಲ್ಲಿ ವಿತರಣೆ',
    directPlant: 'ನೇರ ಸಸ್ಯದಿಂದ'
  },
  TE: {
    // Telugu (తెలుగు)
    deliverTo: 'డెలివరీ చిరునామా',
    noAddress: 'చిరునామా జోడించబడలేదు',
    selectLocation: 'సైట్ స్థానాన్ని ఎంచుకోండి',
    changeAddress: 'చిరునామా మార్చండి',
    addAddress: 'చిరునామా జోడించండి',
    searchPlaceholder: 'సిమెంట్, ఐరన్ రాడ్స్, పైపులు, టైల్స్ శోధించండి...',
    profile: 'ప్రొఫైల్',
    cart: 'కార్ట్',
    materialList: 'మెటీరియల్ జాబితా',
    snapList: 'పేపర్ లిస్ట్ ఫోటో',
    bookLabour: 'కూలీల బుకింగ్',
    categories: 'కేటగిరీలు',
    home: 'హోమ్',
    account: 'ఖాతా',
    adminConsole: 'అడ్మిన్ కన్సోల్',
    logout: 'లాగౌట్',
    signIn: 'సైన్ ఇన్',
    
    freeDelivery: 'ఉచిత డెలివరీ',
    deliverySub: '30 నిమిషాల్లో*',
    cashback: '5% క్యాష్‌బ్యాక్*',
    cashbackSub: 'ఆర్డర్లపై',
    spendPromo: '₹2,500 రాయితీ',
    spendPromoSub: '₹50,000 ఖర్చుపై',
    genuineProducts: 'నిజమైన వస్తువులు',
    genuineSub: 'ధృవీకరించబడినవి',
    
    stagesHeading: 'నిర్మాణ కేటగిరీల ప్రకారం కొనండి',
    snapPaperList: 'చేతితో రాసిన లిస్ట్ ఉందా? ఫోటో తీసి పంపండి',
    
    flatCashback: 'ఫ్లాట్ 5% క్యాష్‌బ్యాక్',
    cashbackOrders: '₹50,000 పైబడిన ఆర్డర్లపై.',
    useCoupon: 'కూపన్ కోడ్',
    shopNow: 'ఇప్పుడే కొనండి',
    todaysDeals: 'నేటి డీల్స్',
    dealsSubtitle: '⚡ ఫ్యాక్టరీ ధరలకే హోల్‌సేల్ సరుకులు',
    endsIn: 'ముగుస్తుంది',
    viewAll: 'అన్నీ చూడండి',
    exploreAll: 'అన్వేషించండి',
    bestselling: 'హాట్ సెల్లింగ్ మెటీరియల్స్',
    contractorFavorites: 'కాంట్రాక్టర్ల ఛాయిస్',
    shopByBrand: 'బ్రాండ్ల వారీగా షాపింగ్',
    
    add: '+ జోడించు',
    inList: '✓ లిస్ట్‌లో ఉంది',
    addToList: '+ లిస్ట్',
    select: 'ఎంచుకోండి',
    options: 'ఆప్షన్స్',
    tapToAddList: '👆 లిస్ట్‌లోకి చేర్చడానికి ఫోటోపై నొక్కండి',
    inMaterialList: '✓ మెటీరియల్ లిస్ట్‌లో ఉంది',
    
    whatsappHeading: 'వాట్సాప్‌లో సులభంగా ఆర్డర్ చేయండి.',
    whatsappSub: 'మీ సైట్‌కు కావలసినవన్నీ వాట్సాప్‌లోనే',
    orderViaWhatsApp: 'వాట్సాప్ ద్వారా ఆర్డర్',
    helpSupport: 'సహాయం & మద్దతు',
    orderStatus: 'ఆర్డర్ స్థితి',
    productDiscovery: 'మెటీరియల్స్ వెతకండి',
    materialsInMinutes: 'నిమిషాల్లో డెలివరీ',
    directPlant: 'ఫ్యాక్టరీ నుండి నేరుగా'
  },
  TA: {
    // Tamil (தமிழ்)
    deliverTo: 'டெலிவரி இடம்',
    noAddress: 'முகவரி இல்லை',
    selectLocation: 'தள இடத்தை தேர்வு செய்யவும்',
    changeAddress: 'முகவரியை மாற்றவும்',
    addAddress: 'முகவரி சேர்க்கவும்',
    searchPlaceholder: 'சிமெண்ட், கம்பி, குழாய்கள், டைல்ஸ் தேடுங்கள்...',
    profile: 'சுயவிவரம்',
    cart: 'கார்ட்',
    materialList: 'பொருட்கள் பட்டியல்',
    snapList: 'சீட்டு புகைப்படம்',
    bookLabour: 'தொழிலாளர்கள்',
    categories: 'வகைகள்',
    home: 'முகப்பு',
    account: 'கணக்கு',
    adminConsole: 'நிர்வாக பலகை',
    logout: 'வெளியேறு',
    signIn: 'உள்நுழைக',
    
    freeDelivery: 'இலவச டெலிவரி',
    deliverySub: '30 நிமிடங்களில்*',
    cashback: '5% கேஷ்பேக்*',
    cashbackSub: 'ஆர்டர்களுக்கு',
    spendPromo: '₹2,500 சேமிப்பு',
    spendPromoSub: '₹50,000 செலவில்',
    genuineProducts: 'அசல் பொருட்கள்',
    genuineSub: 'சான்றளிக்கப்பட்டது',
    
    stagesHeading: 'கட்டுமான பிரிவுகளின்படி வாங்கவும்',
    snapPaperList: 'எழுதிய பட்டியல் உள்ளதா? படம் எடுத்து அனுப்பவும்',
    
    flatCashback: 'பிளாட் 5% கேஷ்பேக்',
    cashbackOrders: '₹50,000க்கு மேற்பட்ட ஆர்டர்களுக்கு.',
    useCoupon: 'கூப்பனைப் பயன்படுத்துக',
    shopNow: 'இப்போதே வாங்கவும்',
    todaysDeals: 'இன்றைய ஆஃபர்கள்',
    dealsSubtitle: '⚡ நேரடி தொழிற்சாலை விலை தள்ளுபடி',
    endsIn: 'முடிவடைகிறது',
    viewAll: 'அனைத்தையும் காண்க',
    exploreAll: 'தேடுங்கள்',
    bestselling: 'அதிகம் விற்பனையாகும் பொருட்கள்',
    contractorFavorites: 'கான்ட்ராக்டர்களின் விருப்பம்',
    shopByBrand: 'பிராண்ட் வாரியாக வாங்கவும்',
    
    add: '+ சேர்',
    inList: '✓ பட்டியலில் உள்ளது',
    addToList: '+ பட்டியல்',
    select: 'தேர்வு செய்க',
    options: 'விருப்பங்கள்',
    tapToAddList: '👆 பட்டியலில் சேர்க்க தட்டவும்',
    inMaterialList: '✓ பொருட்கள் பட்டியலில் உள்ளது',
    
    whatsappHeading: 'வாட்ஸ்அப்பில் உடனடி உதவி பெறலாம்.',
    whatsappSub: 'உங்கள் தளத்திற்கு தேவையான அனைத்தும் வாட்ஸ்அப்பில்',
    orderViaWhatsApp: 'வாட்ஸ்அப் மூலம் ஆர்டர்',
    helpSupport: 'உதவி மற்றும் ஆதரவு',
    orderStatus: 'ஆர்டர் நிலை',
    productDiscovery: 'பொருட்களை கண்டறியுங்கள்',
    materialsInMinutes: 'நிமிடங்களில் டெலிவரி',
    directPlant: 'தொழிற்சாலையிலிருந்து நேரடியாக'
  },
  GU: {
    // Gujarati (ગુજરાતી)
    deliverTo: 'ડિલિવરી સરનામું',
    noAddress: 'કોઈ સરનામું નથી',
    selectLocation: 'સાઇટ સ્થાન પસંદ કરો',
    changeAddress: 'સરનામું બદલો',
    addAddress: 'સરનામું ઉમેરો',
    searchPlaceholder: 'સિમેન્ટ, સળિયા, પાઈપ, ટાઇલ્સ, ફેવિકોલ શોધો...',
    profile: 'પ્રોફાઇલ',
    cart: 'કાર્ટ',
    materialList: 'મટિરિયલ લિસ્ટ',
    snapList: 'કાપલી ફોટો મોકલો',
    bookLabour: 'મજૂર બુક કરો',
    categories: 'કેટેગરીઝ',
    home: 'હોમ',
    account: 'ખાતું',
    adminConsole: 'એડમિન કન્સોલ',
    logout: 'લૉગઆઉટ',
    signIn: 'સાઇન ઇન',
    
    freeDelivery: 'મફત ડિલિવરી',
    deliverySub: '30 મિનિટમાં*',
    cashback: '5% કેશબેક*',
    cashbackSub: 'તમામ ઓર્ડર પર',
    spendPromo: '₹2,500 બચત',
    spendPromoSub: '₹50,000 ખર્ચ પર',
    genuineProducts: 'અસલ પ્રોડક્ટ્સ',
    genuineSub: 'પ્રમાણિત',
    
    stagesHeading: 'બાંધકામ કેટેગરી મુજબ ખરીદો',
    snapPaperList: 'કાગળ પર લખેલી યાદી છે? ફોટો પાડીને એડમિનને મોકલો',
    
    flatCashback: 'ફ્લેટ 5% કેશબેક',
    cashbackOrders: '₹50,000 થી વધુના ઓર્ડર પર.',
    useCoupon: 'કૂપન વાપરો',
    shopNow: 'હમણાં ખરીદો',
    todaysDeals: 'આજના ખાસ સોદા',
    dealsSubtitle: '⚡ ફેક્ટરી ભાવે મટીરીયલ મેળવો',
    endsIn: 'સમાપ્ત થશે',
    viewAll: 'બધું જુઓ',
    exploreAll: 'શોધો',
    bestselling: 'સૌથી વધુ વેચાતી સામગ્રી',
    contractorFavorites: 'કોન્ટ્રાક્ટર્સની પહેલી પસંદ',
    shopByBrand: 'બ્રાન્ડ મુજબ ખરીદો',
    
    add: '+ ઉમેરો',
    inList: '✓ લિસ્ટમાં છે',
    addToList: '+ લિસ્ટ',
    select: 'પસંદ કરો',
    options: 'વિકલ્પો',
    tapToAddList: '👆 લિસ્ટમાં ઉમેરવા ટેપ કરો',
    inMaterialList: '✓ મટીરીયલ લિસ્ટમાં છે',
    
    whatsappHeading: 'વોટ્સએપ પર ઝડપી ઓર્ડર અને સપોર્ટ મેળવો.',
    whatsappSub: 'તમારી સાઇટની દરેક જરૂરિયાત વોટ્સએપ પર',
    orderViaWhatsApp: 'વોટ્સએપ દ્વારા ઓર્ડર',
    helpSupport: 'સહાય અને સપોર્ટ',
    orderStatus: 'ઓર્ડર સ્થિતિ',
    productDiscovery: 'મટિરિયલ્સ શોધો',
    materialsInMinutes: 'મિનિટોમાં ડિલિવરી',
    directPlant: 'સીધા પ્લાન્ટમાંથી'
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [currentLang, setCurrentLang] = useState(() => {
    return localStorage.getItem('bm_lang') || 'EN';
  });

  const changeLanguage = (langCode) => {
    if (TRANSLATIONS[langCode]) {
      setCurrentLang(langCode);
      localStorage.setItem('bm_lang', langCode);
    }
  };

  const t = (key) => {
    const langDict = TRANSLATIONS[currentLang] || TRANSLATIONS.EN;
    return langDict[key] || TRANSLATIONS.EN[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ currentLang, changeLanguage, t, availableLanguages: Object.keys(TRANSLATIONS) }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

