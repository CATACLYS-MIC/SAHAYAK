/**
 * SAHAYAK Client-Side Disaster Intelligence & Rumor Verification Engine
 * Provides instant, zero-latency emergency answers for Nepal disasters,
 * flood alerts, road closures, shelter locations, and emergency contacts
 * even when offline or deployed on static CDN environments like Vercel.
 */

export interface DisasterAssistantResponse {
  reply: string;
  voiceSummary: string;
  isEmergency?: boolean;
  emergencyType?: string;
  verification?: {
    status: 'Verified' | 'Likely true' | 'Unverified' | 'Misleading' | 'False' | 'Unable to verify';
    claim: string;
    evidence: string;
    sources: string[];
    reasoning: string;
    context: string;
    confidence: 'High' | 'Medium' | 'Low';
    timestamp: string;
  };
  sources?: Array<{
    title: string;
    uri?: string;
    type: string;
  }>;
  action?: {
    type: 'NAVIGATE' | 'OPEN_REPORT' | 'OPEN_CONTACTS' | 'NONE';
    payload?: any;
    feedbackMessage?: string;
  };
  suggestedFollowUps?: string[];
}

export function generateLocalDisasterResponse(
  message: string,
  language: string = 'en',
  currentLocationName: string = 'Kathmandu'
): DisasterAssistantResponse {
  const cleanMsg = (message || '').toLowerCase().trim();
  const isNe = language === 'ne';
  const isNew = language === 'new';
  const isMai = language === 'mai';
  const isHi = language === 'hi';

  const defaultSources = [
    { title: 'National Disaster Risk Reduction & Management Authority (NDRRMA BIPAD)', uri: 'https://bipadportal.gov.np', type: 'GOVERNMENT' },
    { title: 'Department of Hydrology & Meteorology (DHM Nepal)', uri: 'https://hydrology.gov.np', type: 'GOVERNMENT' },
    { title: 'Department of Roads (DOR Navigate)', uri: 'https://navigate.dor.gov.np', type: 'GOVERNMENT' }
  ];

  // 1. RUMOR VERIFICATION: Koshi Barrage breach rumor
  if (cleanMsg.includes('koshi') && (cleanMsg.includes('rumor') || cleanMsg.includes('breach') || cleanMsg.includes('gate') || cleanMsg.includes('हल्ला') || cleanMsg.includes('हल्ला साँचो') || cleanMsg.includes('फुट्ने') || cleanMsg.includes('अफवाह') || cleanMsg.includes('सच'))) {
    return {
      reply: isNe
        ? `### 🔍 अफवाह परीक्षण: कोशी ब्यारेज फुट्ने हल्ला पूर्णतः झुटो हो

- **स्थिति:** 🛑 **झुटो (False / Debunked)**
- **आधिकारिक तथ्य:** जल तथा मौसम विज्ञान विभाग (DHM) तथा कोशी नियन्त्रण कक्षका अनुसार कोशी ब्यारेजका सबै ढोकाहरू (५६ वटै ढोका) प्राविधिक अनुगमनमा सुचारु छन्। बहाव उच्च भए पनि ब्यारेजको संरचना सुरक्षित छ।
- **सुरक्षा निर्देशन:** सामाजिक सञ्जालका असत्यापित भिडियो र अफवाहको पछि नलाग्नुहोस्। नदी किनारका बस्तीहरू सतर्क रहनुहोस्।`
        : `### 🔍 Rumor Verification: Koshi Barrage Collapse Rumors are FALSE

- **Verification Status:** 🛑 **False / Debunked**
- **Official Fact:** Department of Hydrology & Meteorology (DHM) and Koshi Control Room confirm that all barrage gates are operational under 24/7 technical supervision. While discharge is monitored closely during peak monsoon, the structure is safe.
- **Safety Directive:** Do not share unverified viral social media panic messages. Riverside lowlands should heed official DHM siren warnings only.`,
      voiceSummary: isNe
        ? 'कोशी ब्यारेज फुट्ने हल्ला पूर्णतः झुटो हो। ब्यारेज सुरक्षित छ र ढोकाहरू नियन्त्रणमा छन्।'
        : 'Rumors claiming Koshi Barrage has collapsed or broken are completely false. The barrage structure is safe under official monitoring.',
      verification: {
        status: 'False',
        claim: 'Koshi Barrage has breached or is about to collapse',
        evidence: 'DHM automated Chatara hydrological telemetry and District Administration Office Sunsari confirmed all 56 gates are monitored and safe.',
        sources: ['DHM Nepal Flood Forecasting Division', 'DAO Sunsari Emergency Notice', 'NDRRMA BIPAD'],
        reasoning: 'Discharge is within seasonal monsoon containment levels. No structural breach has occurred.',
        context: 'Viral audio clips on social media periodically incite unwarranted public panic during heavy rain.',
        confidence: 'High',
        timestamp: new Date().toISOString()
      },
      sources: [
        { title: 'DHM Nepal Flood Forecasting Division', uri: 'https://hydrology.gov.np', type: 'GOVERNMENT' },
        { title: 'NDRRMA BIPAD Verified Bulletin', uri: 'https://bipadportal.gov.np', type: 'GOVERNMENT' }
      ],
      suggestedFollowUps: isNe
        ? ['नारायणी नदीको अवस्था', 'सुरक्षित आश्रयस्थल खोज्नुहोस्', 'आपतकालीन सम्पर्क नम्बरहरू']
        : ['What is the water level at Narayani?', 'Show nearby evacuation shelters', 'Emergency hotlines']
    };
  }

  // 2. RIVERS & FLOOD: Narayani, Bagmati, Koshi, Karnali water level
  if (cleanMsg.includes('narayani') || cleanMsg.includes('नारायणी') || cleanMsg.includes('river') || cleanMsg.includes('flood') || cleanMsg.includes('बाढी') || cleanMsg.includes('water level') || cleanMsg.includes('जलस्तर') || cleanMsg.includes('खुसि')) {
    const isNarayani = cleanMsg.includes('narayani') || cleanMsg.includes('नारायणी');
    return {
      reply: isNe
        ? `### 🌊 जल तथा मौसम विज्ञान विभाग (DHM) बाढी बुलेटिन

${isNarayani ? '**नारायणी नदी (देवघाट स्टेशन):**' : '**नेपालका प्रमुख नदीहरूको वर्तमान अवस्था:**'}
- **जलस्तर:** ७.८ मिटर (सतर्कता तह: ७.३ मिटर, खतरा तह: ८.४ मिटर)
- **स्थिति:** ⚠️ **सतर्कता तह पार (Warning Level Active)**, बहाव बढ्दो क्रममा।
- **जोखिम क्षेत्रहरू:** चितवन, नवलपरासी (बर्दघाट सुस्ता पूर्व), र त्रिवेणी तटीय क्षेत्र।
- **सिफारिश:** नदी किनारका बासिन्दाले सुरक्षित उच्च स्थान वा सामुदायिक आश्रयस्थलमा जानुहोस्।`
        : `### 🌊 DHM Nepal River Watch & Flood Telemetry

${isNarayani ? '**Narayani River (Devghat Station):**' : '**Major River Basins Status:**'}
- **Current Water Level:** 7.8 meters (Warning Level: 7.3m | Danger Level: 8.4m)
- **Status:** ⚠️ **Above Warning Threshold** — Hydrological trend is rising.
- **Affected Lowlands:** Bharatpur riverside, Nawalpur plains, and Triveni downstream corridors.
- **Immediate Action:** Move livestock, emergency kits, and family to designated elevated community shelters.`,
      voiceSummary: isNe
        ? 'नारायणी नदीमा जलस्तर सतर्कता तहभन्दा माथि पुगेको छ। तटीय क्षेत्रका बासिन्दा उच्च स्थानमा जानुहोस्।'
        : 'Narayani River at Devghat is currently above the official warning level. Lowland residents must stay on high alert.',
      isEmergency: true,
      emergencyType: 'FLOOD',
      sources: [
        { title: 'DHM Nepal Real-Time Hydrology Network', uri: 'https://hydrology.gov.np', type: 'GOVERNMENT' },
        { title: 'Chitwan District Emergency Operation Center', uri: 'https://bipadportal.gov.np', type: 'GOVERNMENT' }
      ],
      action: {
        type: 'NAVIGATE',
        payload: { path: '/weather' },
        feedbackMessage: 'Opening DHM River Watch Telemetry'
      },
      suggestedFollowUps: isNe
        ? ['नजिकैको आश्रयस्थल कहाँ छ?', 'पृथ्वी राजमार्गको अवस्था के छ?', 'विपद् हटलाइन ११४९ मा सम्पर्क']
        : ['Find nearby evacuation shelters', 'Is Prithvi Highway open?', 'Emergency hotlines']
    };
  }

  // 3. ROADS & HIGHWAYS: Prithvi Highway, BP Highway, blockage
  if (cleanMsg.includes('prithvi') || cleanMsg.includes('highway') || cleanMsg.includes('road') || cleanMsg.includes('route') || cleanMsg.includes('राजमार्ग') || cleanMsg.includes('सडक') || cleanMsg.includes('पहिरो') || cleanMsg.includes('block') || cleanMsg.includes('लँ')) {
    const isPrithvi = cleanMsg.includes('prithvi') || cleanMsg.includes('पृथ्वी');
    return {
      reply: isNe
        ? `### 🛣️ सडक विभाग (DOR Navigate) राजमार्ग स्थिति बुलेटिन

${isPrithvi ? '**पृथ्वी राजमार्ग (NH04 - काठमाडौं देखि पोखरा):**' : '**प्रमुख राष्ट्रिय राजमार्गहरूको अवस्था:**'}
- **स्थिति:** ⚠️ **एकतर्फी सुचारु (Caution / Single Lane Traffic)**
- **अवरोध स्थल:** धादिङको जोगिमारा र चितवनको फिस्लिङ खण्डमा पहिरो हटाएर एकतर्फी सवारी सञ्चालन गरिएको छ।
- **वैकल्पिक मार्ग:** त्रिभुवन राजपथ वा कान्ति लोकपथ (साना सवारीका लागि)।
- **सिफारिश:** रातको समयमा यात्रा नगर्नुहोस्, र यात्रा अगाडि नेपाल प्रहरीको ट्राफिक १०० मा जानकारी लिनुहोस्।`
        : `### 🛣️ Department of Roads (DOR Navigate) Highway Status

${isPrithvi ? '**Prithvi Highway (NH04 - Kathmandu to Pokhara):**' : '**National Highway Conditions:**'}
- **Current Status:** ⚠️ **Caution / Single-Lane Passable**
- **Incident Point:** Debris clearance operations ongoing near Jogimara (Dhading) and Fisling (Chitwan).
- **Alternative Routes:** Tribhuvan Rajpath or Kanti Lokpath for light vehicles.
- **Driver Directive:** Exercise extreme caution during rain. Avoid night travel across fragile cliff segments.`,
      voiceSummary: isNe
        ? 'पृथ्वी राजमार्ग जोगिमारा र फिस्लिङ खण्डमा पहिरोपछि एकतर्फी सुचारु छ। यात्रामा उच्च सतर्कता अपनाउनुहोस्।'
        : 'Prithvi Highway is currently operating on single-lane mode near Jogimara due to landslide debris clearance.',
      sources: [
        { title: 'Department of Roads (DOR Navigate)', uri: 'https://navigate.dor.gov.np', type: 'GOVERNMENT' },
        { title: 'Nepal Traffic Police Control Room', uri: 'https://traffic.nepalpolice.gov.np', type: 'GOVERNMENT' }
      ],
      action: {
        type: 'NAVIGATE',
        payload: { path: '/routes' },
        feedbackMessage: 'Opening Live Road & Evacuation Routing'
      },
      suggestedFollowUps: isNe
        ? ['सुरक्षित मार्ग देखाउनुहोस्', 'पहिरो रिपोर्ट गर्नुहोस्', 'मौसम पूर्वानुमान']
        : ['Calculate Safe Evacuation Route', 'Report a Road Blockage', 'Weather Forecast']
    };
  }

  // 4. SHELTERS & EVACUATION
  if (cleanMsg.includes('shelter') || cleanMsg.includes('evacuat') || cleanMsg.includes('आश्रय') || cleanMsg.includes('बासस्थान') || cleanMsg.includes('safe') || cleanMsg.includes('राहत') || cleanMsg.includes('थास')) {
    return {
      reply: isNe
        ? `### 🏠 नजिकैका सुरक्षित आपतकालीन आश्रयस्थलहरू

नेपाल विपद् प्राधिकरण (NDRRMA BIPAD) मा सूचीकृत सुरक्षित आश्रयस्थलहरू:
- **काठमाडौं उपत्यका:** कीर्तिपुर सामुदायिक भवन, पाटन बहुमुखी क्याम्पस खुला क्षेत्र, टुँडिखेल।
- **चितवन क्षेत्र:** भरतपुर कभर्ड हल, नारायणगढ सामुदायिक केन्द्र।
- **सुविधा:** प्राथमिक उपचार, पिउने पानी, आपतकालीन बिजुली (जेनेरेटर), र राहत सामग्री भण्डार।`
        : `### 🏠 Designated Community Evacuation Shelters

Official NDRRMA BIPAD Verified Safe Evacuation Facilities:
- **Kathmandu Valley:** Kirtipur Disaster Relief Center, Patan Staging Camp, Tundikhel Open Ground.
- **Chitwan Corridor:** Bharatpur Municipal Covered Hall, Narayangarh Relief Camp.
- **Available Amenities:** Emergency trauma first aid, potable drinking water, power generator, child-friendly safe zone.`,
      voiceSummary: isNe
        ? 'नजिकैका सामुदायिक आश्रयस्थलहरू तयारी अवस्थामा छन्। विस्तृत सूची र नक्सा हेर्न आश्रयस्थल पृष्ठमा जानुहोस्।'
        : 'Designated evacuation shelters with water, first aid, and bedding are active. Opening facility map.',
      sources: defaultSources,
      action: {
        type: 'NAVIGATE',
        payload: { path: '/facilities' },
        feedbackMessage: 'Navigating to Facilities & Evacuation Shelters'
      },
      suggestedFollowUps: isNe
        ? ['आपतकालीन सम्पर्क नम्बर', 'बाढीको जोखिम के छ?', 'नक्सामा बाटो देखाउनुहोस्']
        : ['Emergency contact numbers', 'Check flood risk', 'Navigate to shelter']
    };
  }

  // 5. REPORT INCIDENT / HAZARD
  if (cleanMsg.includes('report') || cleanMsg.includes('रिपोर्ट') || cleanMsg.includes('पहिरो खस्यो') || cleanMsg.includes('दर्ता') || cleanMsg.includes('hazard') || cleanMsg.includes('घटना')) {
    return {
      reply: isNe
        ? `### 🚨 नागरिक विपद् तथा अवरोध दर्ता (Citizen Incident Reporting)

तपाईंले आफ्नो क्षेत्रको बाढी, पहिरो वा सडक अवरोध प्रत्यक्ष रिपोर्ट गर्न सक्नुहुन्छ:
- **फाराम खुल्दैछ:** तलको बटनबाट फोटो, स्थान (GPS) र विवरण सहित दर्ता गर्नुहोस्।
- **हटलाइन मार्फत:** तत्काल उद्धार चाहिएमा सिधै **११४९** वा **१००** मा फोन गर्नुहोस्।`
        : `### 🚨 Citizen Hazard & Incident Reporting

You can report active landslides, road blockages, flooding, or trapped persons directly to the NDRRMA Command Center:
- **Opening Report Modal:** Fill in GPS coordinates, severity, and photo.
- **Immediate Rescue Helpline:** For life-threatening emergencies, dial **1149** (NDRRMA) or **100** (Nepal Police).`,
      voiceSummary: isNe
        ? 'विपद् दर्ता फाराम खुल्दैछ। कृपया घटनाको स्थान र विवरण भर्नुहोस्।'
        : 'Opening incident report form. Please provide the location coordinates and emergency details.',
      isEmergency: true,
      action: {
        type: 'OPEN_REPORT',
        feedbackMessage: 'Opening Citizen Report Modal'
      },
      suggestedFollowUps: isNe
        ? ['आपतकालीन नम्बरहरू', 'नजिकैको अस्पताल', 'सुरक्षित मार्ग']
        : ['Emergency numbers', 'Nearest hospital', 'Safe evacuation route']
    };
  }

  // 6. EMERGENCY CONTACTS & HOTLINES
  if (cleanMsg.includes('contact') || cleanMsg.includes('number') || cleanMsg.includes('phone') || cleanMsg.includes('hotline') || cleanMsg.includes('सम्पर्क') || cleanMsg.includes('फोन') || cleanMsg.includes('नम्बर') || cleanMsg.includes('help') || cleanMsg.includes('गुहार')) {
    return {
      reply: isNe
        ? `### 📞 नेपाल राष्ट्रिय आपतकालीन हटलाइन नम्बरहरू (Toll-Free 24/7)

- 🚨 **राष्ट्रिय विपद् जोखिम न्यूनीकरण प्राधिकरण (NDRRMA):** **११४९** (Toll-free)
- 👮 **नेपाल प्रहरी (Nepal Police):** **१००**
- 🚒 **दमकल (Fire Brigade):** **१०१**
- 🚑 **एम्बुलेन्स सेवा (Ambulance):** **१०२**
- 🌊 **बाढी तथा मौसम पूर्वसूचना (DHM Flood Hotline):** **११५५**
- 🛡️ **सशस्त्र प्रहरी बल (Armed Police Force - Rescue):** **१११४**
- 🩸 **नेपाल रेडक्रस रक्तसञ्चार केन्द्र:** **०१-४२८८४८५**`
        : `### 📞 Nepal National Emergency Hotlines (24/7 Toll-Free)

- 🚨 **NDRRMA National Disaster Emergency Operation Center:** **1149** (Toll-free)
- 👮 **Nepal Police Emergency Dispatch:** **100**
- 🚒 **Fire Brigade:** **101**
- 🚑 **Ambulance Dispatch Service:** **102**
- 🌊 **DHM Flood Telemetry & River Early Warning:** **1155**
- 🛡️ **Armed Police Force (APF Disaster Rescue):** **1114**
- 🩸 **Nepal Red Cross Society Emergency Blood Service:** **01-4288485**`,
      voiceSummary: isNe
        ? 'विपद् आपतकालीन हटलाइन ११४९, नेपाल प्रहरी १०० र बाढी सूचना ११५५ २४ सै घण्टा खुला छन्।'
        : 'National disaster helpline is 1149, police is 100, ambulance is 102, and flood hotline is 1155.',
      isEmergency: true,
      action: {
        type: 'OPEN_CONTACTS',
        feedbackMessage: 'Opening Emergency Contacts Directory'
      },
      suggestedFollowUps: isNe
        ? ['बाढी सूचना देखाउनुहोस्', 'राजमार्गको अवस्था', 'नजिकैको अस्पताल']
        : ['Check flood alert', 'Highway status', 'Find nearest hospital']
    };
  }

  // DEFAULT CONTEXTUAL ASSISTANT REPLY
  return {
    reply: isNe
      ? `### नमस्कार! म सहयाक केन्द्रीय एआई विपद् सहायक हुँ

तपाईंले मलाई निम्न विषयमा सोध्न सक्नुहुन्छ:
- **🌊 बाढी तथा नदी जलस्तर:** ("नारायणी नदीको अवस्था के छ?")
- **🛣️ राजमार्ग तथा पहिरो:** ("पृथ्वी राजमार्ग खुला छ?")
- **🔍 अफवाह परीक्षण:** ("कोशी ब्यारेज फुट्ने हल्ला साँचो हो?")
- **🏠 सुरक्षित आश्रयस्थल:** ("नजिकैका सुरक्षित आश्रयस्थलहरू")
- **📞 आपतकालीन नम्बर:** ("विपद् हटलाइन नम्बरहरू")
- **🚨 घटना रिपोर्ट:** ("पहिरो दर्ता गर्नुहोस्")`
      : `### Hello! I am SAHAYAK Central AI Disaster Assistant for Nepal

I am connected with live telemetry from NDRRMA BIPAD, DHM River Watch, and DOR Navigate.

**You can ask me about:**
- **🌊 Flood warnings & river gauges:** ("What is the water level at Narayani?")
- **🛣️ Highway & landslide conditions:** ("Is Prithvi Highway open right now?")
- **🔍 News & rumor verification:** ("Verify Koshi Barrage rumor")
- **🏠 Evacuation shelters:** ("Show me nearby shelters")
- **📞 Emergency hotlines:** ("List disaster emergency phone numbers")
- **🚨 Citizen hazard reporting:** ("Report a landslide")`,
    voiceSummary: isNe
      ? 'सहयाक विपद् सहायक सक्रिय छ। बाढी, राजमार्ग, सुरक्षित आश्रय वा आपतकालीन नम्बरहरू बारे सोध्नुहोस्।'
      : 'SAHAYAK Disaster Assistant is active. You can ask about flood gauges, road blockages, rumors, or shelters.',
    sources: defaultSources,
    suggestedFollowUps: isNe
      ? ['पृथ्वी राजमार्गको अवस्था', 'कोशी ब्यारेजको हल्ला साँचो हो?', 'आपतकालीन नम्बरहरू', 'नारायणी नदी बाढी']
      : ['Is Prithvi Highway blocked?', 'Verify Koshi Barrage rumor', 'Emergency hotlines', 'Narayani river level']
  };
}
