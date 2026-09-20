import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'ne' | 'en' | 'new' | 'mai' | 'hi';

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
  region: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'ne',
    name: 'Nepali',
    nativeName: 'नेपाली',
    flag: '🇳🇵',
    region: 'नेपाल (National)'
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    region: 'International'
  },
  {
    code: 'new',
    name: 'Nepal Bhasa',
    nativeName: 'नेपाल भाषा',
    flag: '🇳🇵',
    region: 'काठमाडौं उपत्यका (Newari)'
  },
  {
    code: 'mai',
    name: 'Maithili',
    nativeName: 'मैथिली',
    flag: '🇳🇵',
    region: 'मधेश / तराई (Mithila)'
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    region: 'क्षेत्रीय (Regional)'
  }
];

// Dictionary type
type TranslationDictionary = Record<string, string>;

const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  // 1. NEPALI (नेपाली)
  ne: {
    // Navigation
    'nav.home': 'गृह पृष्ठ',
    'nav.weather_risk': 'मौसम र जोखिम',
    'nav.news_safety': 'समाचार र सुरक्षा',
    'nav.routes': 'सुरक्षित मार्गहरू',
    'nav.facilities': 'सुविधाहरू',
    'nav.hospital_matching': 'अस्पताल मिलान',
    'nav.logistics': 'रसद र टोली कमाण्ड',
    'nav.assessment': 'क्षति मूल्यांकन',
    'nav.ai_priority': 'एआई प्राथमिकता',
    'nav.command_center': 'कमाण्ड सेन्टर',
    'nav.system_status': 'प्रणाली स्थिति',
    'nav.operational': 'सञ्चालनमा',
    'nav.language': 'भाषा',
    'nav.select_language': 'भाषा चयन गर्नुहोस्',

    // Common UI
    'common.search': 'खोज्नुहोस्...',
    'common.filter': 'फिल्टर',
    'common.all': 'सबै',
    'common.cancel': 'रद्द गर्नुहोस्',
    'common.save': 'सुरक्षित गर्नुहोस्',
    'common.submit': 'पेश गर्नुहोस्',
    'common.register': 'दर्ता गर्नुहोस्',
    'common.status': 'स्थिति',
    'common.active': 'सक्रिय',
    'common.deployed': 'तैनात',
    'common.standby': 'तयारी अवस्था',
    'common.available': 'उपलब्ध',
    'common.critical': 'अति गम्भीर',
    'common.high': 'उच्च जोखिम',
    'common.moderate': 'मध्यम',
    'common.low': 'सामान्य',
    'common.notifications': 'सूचनाहरू',
    'common.no_notifications': 'कुनै नयाँ सूचना छैन',
    'common.demo_mode': 'डेमो मोड',
    'common.location': 'स्थान',
    'common.refresh': 'ताजा गर्नुहोस्',
    'common.exit': 'बाहिर निस्कनुहोस्',
    'common.close': 'बन्द गर्नुहोस्',

    // Home Page
    'home.hero_title': 'नेपाल राष्ट्रिय विपद् व्यवस्थापन र उद्धार प्रणाली',
    'home.hero_subtitle': 'बाढी, पहिरो, सडक अवरोध र राहत परिचालनको प्रत्यक्ष समन्वय।',
    'home.critical_alerts': 'अति गम्भीर सतर्कताहरू',
    'home.no_critical_alerts': 'वर्तमान स्थानमा कुनै अति गम्भीर खतरा छैन।',
    'home.overall_risk': 'समग्र जोखिम स्तर',
    'home.top_hazard': 'प्रमुख खतरा',
    'home.dhm_river_watch': 'जल तथा मौसम विज्ञान विभाग प्रत्यक्ष नदी अनुगमन',
    'home.dor_highway_status': 'सडक विभाग (DOR) राजमार्ग स्थिति',
    'home.open_percentage': 'राजमार्ग खुला प्रतिशत',
    'home.blocked_roads': 'अवरुद्ध सडकहरू',
    'home.blocked_bridges': 'अवरुद्ध पुलहरू',
    'home.active_incidents': 'सक्रिय घटनाहरू',
    'home.hospital_beds': 'सरकारी अस्पताल बेड क्षमता',
    'home.supplies_tracking': 'राहत सामग्री अवस्था',
    'home.view_details': 'विस्तृत विवरण हेर्नुहोस्',

    // Teams & Logistics
    'teams.title': 'स्वयंसेवक टोली परिचालन र रसद कमाण्ड',
    'teams.subtitle': 'टोली नेता दर्ता गर्नुहोस्, विपद् क्षेत्र तोक्नुहोस् र नेपालभरि खटिएका टोलीहरूको प्रत्यक्ष विवरण हेर्नुहोस्।',
    'teams.register_leader': 'टोली नेता दर्ता गर्नुहोस्',
    'teams.registered_teams': 'दर्ता भएका टोलीहरू',
    'teams.mobilized_responders': 'परिचालित उद्धारकर्ताहरू',
    'teams.sectors_covered': 'जोखिम क्षेत्रहरू',
    'teams.deployment_status': 'तैनाती स्थिति',
    'teams.allocated_area': 'तोकिएको स्वयंसेवक कार्य क्षेत्र',
    'teams.active_mission': 'सक्रिय जिम्मेवारी / मिसन',
    'teams.reassign_area': 'क्षेत्र पुन: तोक्नुहोस्',
    'teams.auto_recommend': 'एआईद्वारा उपयुक्त क्षेत्र सिफारिस',
    'teams.map_view': 'नक्सा दृश्य',
    'teams.cards_view': 'टोली सूची',
    'teams.search_placeholder': 'टोली, नेता, क्षेत्र वा सीप खोज्नुहोस्...',
    'teams.resources_routes': 'राहत सामग्री र ढुवानी मार्ग',
    'teams.teams_coverage': 'स्वयंसेवक टोली र परिचालन',

    // Routes
    'routes.title': 'विपद् सचेत सुरक्षित सडक मार्ग निर्देशन',
    'routes.subtitle': 'सडक विभाग र जल तथा मौसम विज्ञान विभागको प्रत्यक्ष तथ्याङ्क अनुसार सुरक्षित मार्ग।',
    'routes.start_nav': 'गुगल म्याप्स नेभिगेसन सुरु गर्नुहोस् (फुलस्क्रिन)',
    'routes.safest_route': 'सबैभन्दा सुरक्षित मार्ग',
    'routes.route_to_avoid': 'बच्नुपर्ने अवरुद्ध मार्ग',
    'routes.dor_bridges': 'सडक विभाग पुलहरू',
    'routes.dhm_rivers': 'जल मापन केन्द्रहरू',
    'routes.travel_time': 'अनुमानित यात्रा समय',
    'routes.distance': 'जम्मा दूरी',

    // Hospital Matching
    'hospital.title': 'आपतकालीन बिरामी तथा अस्पताल मिलान',
    'hospital.subtitle': 'आईसीयू, ट्रमा र भेन्टिलेटर क्षमता अनुसार बिरामीलाई तुरुन्त उपयुक्त अस्पताल पठाउनुहोस्।',
    'hospital.matched_patients': 'सिफारिस गरिएका बिरामीहरू',

    // Weather & Risk
    'weather.title': 'मौसम पूर्वानुमान र नदी बाढी जोखिम',
    'weather.subtitle': 'नेपालका प्रमुख नदीहरूको प्रत्यक्ष जलस्तर, चेतावनी स्तर र बाढी पूर्वानुमान।',
    'weather.live_river_gauges': 'प्रत्यक्ष नदी जलस्तर मापन केन्द्रहरू'
  },

  // 2. ENGLISH
  en: {
    // Navigation
    'nav.home': 'HOME',
    'nav.weather_risk': 'WEATHER & RISK',
    'nav.news_safety': 'NEWS & SAFETY',
    'nav.routes': 'ROUTES',
    'nav.facilities': 'FACILITIES',
    'nav.hospital_matching': 'HOSPITAL MATCHING',
    'nav.logistics': 'LOGISTICS & TEAM',
    'nav.assessment': 'ASSESSMENT',
    'nav.ai_priority': 'AI PRIORITY',
    'nav.command_center': 'COMMAND CENTER',
    'nav.system_status': 'System Status',
    'nav.operational': 'Operational',
    'nav.language': 'Language',
    'nav.select_language': 'Select Language',

    // Common UI
    'common.search': 'Search demo data...',
    'common.filter': 'Filter',
    'common.all': 'All',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.submit': 'Submit',
    'common.register': 'Register',
    'common.status': 'Status',
    'common.active': 'Active',
    'common.deployed': 'Deployed',
    'common.standby': 'Standby',
    'common.available': 'Available',
    'common.critical': 'Critical',
    'common.high': 'High',
    'common.moderate': 'Moderate',
    'common.low': 'Normal',
    'common.notifications': 'Notifications',
    'common.no_notifications': 'No notifications',
    'common.demo_mode': 'DEMO MODE',
    'common.location': 'Location',
    'common.refresh': 'Refresh',
    'common.exit': 'Exit',
    'common.close': 'Close',

    // Home Page
    'home.hero_title': 'Nepal National Disaster Management & Relief Platform',
    'home.hero_subtitle': 'Real-time situational coordination of floods, landslides, road closures, and emergency field teams.',
    'home.critical_alerts': 'Critical Alerts',
    'home.no_critical_alerts': 'No critical threats logged for current location.',
    'home.overall_risk': 'Overall Risk Level',
    'home.top_hazard': 'Top Hazard Threat',
    'home.dhm_river_watch': 'DHM Live River Hydrology Watch',
    'home.dor_highway_status': 'Department of Roads (DOR) Highway Status',
    'home.open_percentage': 'National Highway Passability',
    'home.blocked_roads': 'Blocked Roads',
    'home.blocked_bridges': 'Blocked Bridges',
    'home.active_incidents': 'Active Incidents',
    'home.hospital_beds': 'Hospital Bed Network Capacity',
    'home.supplies_tracking': 'Relief Supplies Inventory',
    'home.view_details': 'View Details',

    // Teams & Logistics
    'teams.title': 'Volunteer Team Allocation & Leader Registry',
    'teams.subtitle': 'Register volunteer team leaders, assign emergency disaster response areas, and track active field allocations across Nepal.',
    'teams.register_leader': 'Register Team Leader',
    'teams.registered_teams': 'Registered Teams',
    'teams.mobilized_responders': 'Mobilized Responders',
    'teams.sectors_covered': 'Disaster Sectors Covered',
    'teams.deployment_status': 'Deployment Status',
    'teams.allocated_area': 'Allocated Volunteer Operating Area',
    'teams.active_mission': 'Active Operational Mission',
    'teams.reassign_area': 'Reassign Area',
    'teams.auto_recommend': 'Auto-Recommend Optimal Area',
    'teams.map_view': 'Map View',
    'teams.cards_view': 'Team Directory',
    'teams.search_placeholder': 'Search by team, leader, allocated area, or skill...',
    'teams.resources_routes': 'Resources & Routes',
    'teams.teams_coverage': 'Volunteer Teams & Coverage',

    // Routes
    'routes.title': 'Disaster-Aware Safe Evacuation & Convoy Routing',
    'routes.subtitle': 'Multi-criteria routing powered by live DOR road closures and DHM river flood stages.',
    'routes.start_nav': 'Start Google Maps Navigation (Fullscreen)',
    'routes.safest_route': 'Safest Route',
    'routes.route_to_avoid': 'Route to Avoid',
    'routes.dor_bridges': 'DOR Bridges',
    'routes.dhm_rivers': 'DHM River Stations',
    'routes.travel_time': 'Estimated Travel Time',
    'routes.distance': 'Total Distance',

    // Hospital Matching
    'hospital.title': 'Emergency Hospital & Patient Matching',
    'hospital.subtitle': 'Match incoming casualties to available ICU, trauma beds, and surgical capabilities.',
    'hospital.matched_patients': 'Matched Patients',

    // Weather & Risk
    'weather.title': 'Weather Forecast & River Risk Telemetry',
    'weather.subtitle': 'Live hydrology monitoring across Nepal major river basins and warning thresholds.',
    'weather.live_river_gauges': 'Live River Gauges & Flood Stages'
  },

  // 3. NEPAL BHASA / NEWARI (नेपाल भाषा)
  new: {
    // Navigation
    'nav.home': 'छें पौ (गृह)',
    'nav.weather_risk': 'मौसम व जोखिम',
    'nav.news_safety': 'बुखँ व सुरक्षा',
    'nav.routes': 'बांलागु लँपु (मार्ग)',
    'nav.facilities': 'सुविधाहरु',
    'nav.hospital_matching': 'अस्पताल मिलान',
    'nav.logistics': 'सामग्री व पुचः कमाण्ड',
    'nav.assessment': 'क्षति ल्यंकेगु',
    'nav.ai_priority': 'एआई प्राथमिकता',
    'nav.command_center': 'कमाण्ड सेन्टर',
    'nav.system_status': 'प्रणाली अवस्था',
    'nav.operational': 'चालू दु',
    'nav.language': 'भाषा',
    'nav.select_language': 'भाषा ल्ययादिसँ',

    // Common UI
    'common.search': 'मालादिसँ...',
    'common.filter': 'फिल्टर',
    'common.all': 'दक्को (सबै)',
    'common.cancel': 'रद्द यानादिसँ',
    'common.save': 'स्वथनादिसँ',
    'common.submit': 'दाखिला यानादिसँ',
    'common.register': 'दर्ता यानादिसँ',
    'common.status': 'अवस्था',
    'common.active': 'सक्रिय',
    'common.deployed': 'खटेजूगु',
    'common.standby': 'तयार अवस्था',
    'common.available': 'उपलब्ध',
    'common.critical': 'तसकं गम्भीर',
    'common.high': 'तःधंगु जोखिम',
    'common.moderate': 'दथुइगु',
    'common.low': 'सामान्य',
    'common.notifications': 'सुचं',
    'common.no_notifications': 'छुं सुचं मदु',
    'common.demo_mode': 'डेमो मोड',
    'common.location': 'थाय् (स्थान)',
    'common.refresh': 'न्हापाथें यानादिसँ',
    'common.exit': 'पिहाँ वनेगु',
    'common.close': 'तिनादिसँ',

    // Home Page
    'home.hero_title': 'नेपाल राष्ट्रिय विपद् व्यवस्थापन व ग्वाहालि प्रणाली',
    'home.hero_subtitle': 'खुसिबाः, चलः, लँ बन्द व राहत पुचःया प्रत्यक्ष समन्वय।',
    'home.critical_alerts': 'गम्भीर चेतावनी',
    'home.no_critical_alerts': 'आः थ्व थासय् छुं तःधंगु खतरा मदु।',
    'home.overall_risk': 'समग्र जोखिम स्तर',
    'home.top_hazard': 'मू जोखिम',
    'home.dhm_river_watch': 'जल तथा मौसम विज्ञान विभाग प्रत्यक्ष खुसि अनुगमन',
    'home.dor_highway_status': 'सडक विभाग (DOR) राजमार्ग स्थिति',
    'home.open_percentage': 'राजमार्ग चायेकातःगु प्रतिशत',
    'home.blocked_roads': 'बन्द जूगु लँपु',
    'home.blocked_bridges': 'बन्द जूगु तां (पुल)',
    'home.active_incidents': 'सक्रिय घटना',
    'home.hospital_beds': 'अस्पताल बेड क्षमता',
    'home.supplies_tracking': 'राहत सामग्री अवस्था',
    'home.view_details': 'विस्तृत विवरण',

    // Teams & Logistics
    'teams.title': 'स्वयंसेवक पुचः परिचालन व सामग्री कमाण्ड',
    'teams.subtitle': 'पुचः नायः दर्ता यानादिसँ, विपद् क्षेत्र ल्ययादिसँ व खटेजूगु पुचःत स्वयादिसँ।',
    'teams.register_leader': 'पुचः नायः दर्ता यानादिसँ',
    'teams.registered_teams': 'दर्ता जूगु पुचःत',
    'teams.mobilized_responders': 'खटेजूगु उद्धारकर्तात',
    'teams.sectors_covered': 'कार्यक्षेत्रत',
    'teams.deployment_status': 'तैनाती स्थिति',
    'teams.allocated_area': 'तोकेयानातःगु कार्यक्षेत्र',
    'teams.active_mission': 'सक्रिय जिम्मेवारी',
    'teams.reassign_area': 'मेगु क्षेत्र तोकेयानादिसँ',
    'teams.auto_recommend': 'एआई सिफारिस क्षेत्र',
    'teams.map_view': 'नक्सा स्वयेगु',
    'teams.cards_view': 'पुचः सूची',
    'teams.search_placeholder': 'पुचः, नायः वा क्षेत्र मालादिसँ...',
    'teams.resources_routes': 'सामग्री व लँपु',
    'teams.teams_coverage': 'स्वयंसेवक पुचः व परिचालन',

    // Routes
    'routes.title': 'सुरक्षित विपद् सचेत लँपु निर्देशन',
    'routes.subtitle': 'सडक विभाग व खुसिबाः प्रत्यक्ष विवरणकथं सुरक्षित लँपु।',
    'routes.start_nav': 'गुगल म्याप्स नेभिगेसन सुरु यानादिसँ',
    'routes.safest_route': 'दकलय् सुरक्षित लँपु',
    'routes.route_to_avoid': 'बचेजुइमाःगु लँपु',
    'routes.dor_bridges': 'सडक विभाग तां (पुल)',
    'routes.dhm_rivers': 'खुसि मापन केन्द्रत',
    'routes.travel_time': 'अनुमानित ई (समय)',
    'routes.distance': 'जम्मा तापाःगु (दूरी)',

    // Hospital Matching
    'hospital.title': 'अस्पताल व ल्वगी मिलान',
    'hospital.subtitle': 'आईसीयू व बेड क्षमताकथं ल्वगीयात तुरन्त अस्पताल छ्वयेगु।',
    'hospital.matched_patients': 'मिलान जूगु ल्वगीत',

    // Weather & Risk
    'weather.title': 'मौसम पूर्वानुमान व खुसि जोखिम',
    'weather.subtitle': 'नेपाःया मू खुसिबाःया प्रत्यक्ष जलस्तर व बाढी पूर्वसूचना।',
    'weather.live_river_gauges': 'प्रत्यक्ष खुसि जलस्तर केन्द्रत'
  },

  // 4. MAITHILI (मैथिली)
  mai: {
    // Navigation
    'nav.home': 'मुख्य पृष्ठ',
    'nav.weather_risk': 'मौसम आ जोखिम',
    'nav.news_safety': 'समाचार आ सुरक्षा',
    'nav.routes': 'सुरक्षित रस्ता',
    'nav.facilities': 'सुविधासभ',
    'nav.hospital_matching': 'अस्पताल मिलान',
    'nav.logistics': 'राहत आ दल कमाण्ड',
    'nav.assessment': 'क्षति मूल्यांकन',
    'nav.ai_priority': 'एआई प्राथमिकता',
    'nav.command_center': 'कमाण्ड सेन्टर',
    'nav.system_status': 'प्रणाली स्थिति',
    'nav.operational': 'सञ्चालनमे',
    'nav.language': 'भाषा',
    'nav.select_language': 'भाषा चुनु',

    // Common UI
    'common.search': 'खोजू...',
    'common.filter': 'फिल्टर',
    'common.all': 'सब',
    'common.cancel': 'रद्द करू',
    'common.save': 'सुरक्षित करू',
    'common.submit': 'जमा करू',
    'common.register': 'दर्ता करू',
    'common.status': 'स्थिति',
    'common.active': 'सक्रिय',
    'common.deployed': 'तैनात',
    'common.standby': 'तयार',
    'common.available': 'उपलब्ध',
    'common.critical': 'अति गम्भीर',
    'common.high': 'उच्च जोखिम',
    'common.moderate': 'मध्यम',
    'common.low': 'सामान्य',
    'common.notifications': 'सूचनासभ',
    'common.no_notifications': 'कोनो नव सूचना नहि अछि',
    'common.demo_mode': 'डेमो मोड',
    'common.location': 'स्थान',
    'common.refresh': 'ताजा करू',
    'common.exit': 'बाहर जाउ',
    'common.close': 'बन्द करू',

    // Home Page
    'home.hero_title': 'नेपाल राष्ट्रिय विपद् व्यवस्थापन आ राहत प्रणाली',
    'home.hero_subtitle': 'बाढि, पहिरो, रस्ता अवरोध आ राहत दलक प्रत्यक्ष समन्वय।',
    'home.critical_alerts': 'अति गम्भीर चेतावनी',
    'home.no_critical_alerts': 'एहि स्थानमे कोनो गम्भीर संकट नहि अछि।',
    'home.overall_risk': 'समग्र जोखिम स्तर',
    'home.top_hazard': 'मुख्य खतरा',
    'home.dhm_river_watch': 'जल तथा मौसम विभाग प्रत्यक्ष नदी अनुगमन',
    'home.dor_highway_status': 'सड़क विभाग (DOR) राजमार्ग स्थिति',
    'home.open_percentage': 'राजमार्ग खुला प्रतिशत',
    'home.blocked_roads': 'अवरुद्ध सड़क',
    'home.blocked_bridges': 'अवरुद्ध पुल',
    'home.active_incidents': 'सक्रिय घटनासभ',
    'home.hospital_beds': 'अस्पताल बेड क्षमता',
    'home.supplies_tracking': 'राहत सामग्री स्थिति',
    'home.view_details': 'विस्तृत विवरण',

    // Teams & Logistics
    'teams.title': 'स्वयंसेवक दल परिचालन आ राहत कमाण्ड',
    'teams.subtitle': 'दलक नेता दर्ता करू, विपद् क्षेत्र सौपू आ खटल दलक विवरण देखू।',
    'teams.register_leader': 'दल नेता दर्ता करू',
    'teams.registered_teams': 'दर्ता भेल दल',
    'teams.mobilized_responders': 'खटल स्वयंसेवक',
    'teams.sectors_covered': 'विपद् क्षेत्रसभ',
    'teams.deployment_status': 'तैनाती स्थिति',
    'teams.allocated_area': 'आवंटित स्वयंसेवक क्षेत्र',
    'teams.active_mission': 'सक्रिय जिम्मेवारी / मिसन',
    'teams.reassign_area': 'क्षेत्र फेर बदलो',
    'teams.auto_recommend': 'एआई द्वारा उपयुक्त क्षेत्र',
    'teams.map_view': 'नक्शा देखू',
    'teams.cards_view': 'दल सूची',
    'teams.search_placeholder': 'दल, नेता वा क्षेत्र खोजू...',
    'teams.resources_routes': 'राहत सामग्री आ रस्ता',
    'teams.teams_coverage': 'स्वयंसेवक दल आ परिचालन',

    // Routes
    'routes.title': 'विपद् सचेत सुरक्षित रस्ता निर्देशन',
    'routes.subtitle': 'सड़क विभाग आ नदी बाढिक प्रत्यक्ष जानकारी अनुसार सुरक्षित मार्ग।',
    'routes.start_nav': 'गुगल म्याप्स नेभिगेसन शुरू करू (फुलस्क्रिन)',
    'routes.safest_route': 'सबसँ सुरक्षित रस्ता',
    'routes.route_to_avoid': 'बचबाक रस्ता',
    'routes.dor_bridges': 'सड़क विभागक पुल',
    'routes.dhm_rivers': 'नदी मापन केन्द्र',
    'routes.travel_time': 'अनुमानित यात्रा समय',
    'routes.distance': 'कुल दूरी',

    // Hospital Matching
    'hospital.title': 'अस्पताल आ बिरामी मिलान',
    'hospital.subtitle': 'आईसीयू आ बेड क्षमतानुकूल बिरामीकेँ तुरन्त उपयुक्त अस्पताल पठाउ।',
    'hospital.matched_patients': 'सिफारिस कएल बिरामी',

    // Weather & Risk
    'weather.title': 'मौसम पूर्वानुमान आ नदी जलस्तर',
    'weather.subtitle': 'नेपालक मुख्य नदीसभक प्रत्यक्ष जलस्तर आ बाढि पूर्वसूचना।',
    'weather.live_river_gauges': 'प्रत्यक्ष नदी जलस्तर केन्द्र'
  },

  // 5. HINDI (हिन्दी)
  hi: {
    // Navigation
    'nav.home': 'मुख्य पृष्ठ',
    'nav.weather_risk': 'मौसम और जोखिम',
    'nav.news_safety': 'समाचार व सुरक्षा',
    'nav.routes': 'सुरक्षित मार्ग',
    'nav.facilities': 'सुविधाएं',
    'nav.hospital_matching': 'अस्पताल मिलान',
    'nav.logistics': 'लॉजिस्टिक्स व दल',
    'nav.assessment': 'क्षति मूल्यांकन',
    'nav.ai_priority': 'एआई प्राथमिकता',
    'nav.command_center': 'कमांड सेंटर',
    'nav.system_status': 'सिस्टम स्थिति',
    'nav.operational': 'सक्रिय / चालू',
    'nav.language': 'भाषा',
    'nav.select_language': 'भाषा चुनें',

    // Common UI
    'common.search': 'खोजें...',
    'common.filter': 'फ़िल्टर',
    'common.all': 'सभी',
    'common.cancel': 'रद्द करें',
    'common.save': 'सहेजें',
    'common.submit': 'जमा करें',
    'common.register': 'पंजीकृत करें',
    'common.status': 'स्थिति',
    'common.active': 'सक्रिय',
    'common.deployed': 'तैनात',
    'common.standby': 'स्टैंडबाय',
    'common.available': 'उपलब्ध',
    'common.critical': 'अति गंभीर',
    'common.high': 'उच्च जोखिम',
    'common.moderate': 'मध्यम',
    'common.low': 'सामान्य',
    'common.notifications': 'सूचनाएं',
    'common.no_notifications': 'कोई नई सूचना नहीं',
    'common.demo_mode': 'डेमो मोड',
    'common.location': 'स्थान',
    'common.refresh': 'ताज़ा करें',
    'common.exit': 'बाहर निकलें',
    'common.close': 'बंद करें',

    // Home Page
    'home.hero_title': 'नेपाल राष्ट्रीय आपदा प्रबंधन व राहत प्रणाली',
    'home.hero_subtitle': 'बाढ़, भूस्खलन, सड़क अवरोध और आपातकालीन बचाव दलों का लाइव समन्वय।',
    'home.critical_alerts': 'अति गंभीर अलर्ट',
    'home.no_critical_alerts': 'वर्तमान स्थान पर कोई गंभीर संकट दर्ज नहीं है।',
    'home.overall_risk': 'समग्र जोखिम स्तर',
    'home.top_hazard': 'प्रमुख आपदा',
    'home.dhm_river_watch': 'जल एवं मौसम विज्ञान विभाग लाइव नदी निगरानी',
    'home.dor_highway_status': 'सड़क विभाग (DOR) राजमार्ग स्थिति',
    'home.open_percentage': 'राजमार्ग खुला प्रतिशत',
    'home.blocked_roads': 'अवरुद्ध सड़कें',
    'home.blocked_bridges': 'अवरुद्ध पुल',
    'home.active_incidents': 'सक्रिय घटनाएं',
    'home.hospital_beds': 'अस्पताल बेड नेटवर्क क्षमता',
    'home.supplies_tracking': 'राहत सामग्री भंडार',
    'home.view_details': 'विवरण देखें',

    // Teams & Logistics
    'teams.title': 'स्वयंसेवक दल आवंटन व लीडर रजिस्ट्री',
    'teams.subtitle': 'टीम लीडर पंजीकृत करें, आपदा क्षेत्र सौंपें और नेपाल भर में तैनात टीमों का लाइव विवरण देखें।',
    'teams.register_leader': 'टीम लीडर पंजीकृत करें',
    'teams.registered_teams': 'पंजीकृत दल',
    'teams.mobilized_responders': 'तैनात स्वयंसेवक',
    'teams.sectors_covered': 'आपदा क्षेत्र',
    'teams.deployment_status': 'तैनाती स्थिति',
    'teams.allocated_area': 'आवंटित स्वयंसेवक कार्य क्षेत्र',
    'teams.active_mission': 'सक्रिय मिशन / कार्य',
    'teams.reassign_area': 'क्षेत्र पुन: आवंटित करें',
    'teams.auto_recommend': 'एआई द्वारा अनुशंसित क्षेत्र',
    'teams.map_view': 'मानचित्र दृश्य',
    'teams.cards_view': 'दल निर्देशिका',
    'teams.search_placeholder': 'दल, लीडर, क्षेत्र या कौशल खोजें...',
    'teams.resources_routes': 'राहत सामग्री व आपूर्ति मार्ग',
    'teams.teams_coverage': 'स्वयंसेवक दल व तैनाती',

    // Routes
    'routes.title': 'आपदा-सचेत सुरक्षित मार्ग नेविगेशन',
    'routes.subtitle': 'सड़क विभाग व नदी बाढ़ स्तर के लाइव डेटा के अनुसार सबसे सुरक्षित मार्ग।',
    'routes.start_nav': 'गूगल मैप्स नेविगेशन शुरू करें (फ़ुलस्क्रीन)',
    'routes.safest_route': 'सबसे सुरक्षित मार्ग',
    'routes.route_to_avoid': 'बचने योग्य अवरुद्ध मार्ग',
    'routes.dor_bridges': 'सड़क विभाग पुल',
    'routes.dhm_rivers': 'नदी जलस्तर केंद्र',
    'routes.travel_time': 'अनुमानित यात्रा समय',
    'routes.distance': 'कुल दूरी',

    // Hospital Matching
    'hospital.title': 'आपातकालीन अस्पताल व मरीज मिलान',
    'hospital.subtitle': 'आईसीयू व ट्रॉमा क्षमता के अनुसार मरीज को तुरंत उपयुक्त अस्पताल भेजें।',
    'hospital.matched_patients': 'अनुशंसित मरीज',

    // Weather & Risk
    'weather.title': 'मौसम पूर्वानुमान व नदी जोखिम स्तर',
    'weather.subtitle': 'नेपाल की प्रमुख नदियों का लाइव जलस्तर, चेतावनी स्तर व बाढ़ पूर्वानुमान।',
    'weather.live_river_gauges': 'लाइव नदी जलस्तर गेज'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  currentLanguageOption: LanguageOption;
  languages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'sahayak_app_language_v1';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language;
      if (stored && SUPPORTED_LANGUAGES.some(l => l.code === stored)) {
        return stored;
      }
      // Check browser language or default to Nepali
      const navLang = navigator.language.toLowerCase();
      if (navLang.startsWith('ne')) return 'ne';
      if (navLang.startsWith('hi')) return 'hi';
      return 'ne'; // Default to Nepali (नेपाली)
    }
    return 'ne';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      document.documentElement.lang = lang;
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const t = (key: string, fallback?: string): string => {
    const dict = TRANSLATIONS[language];
    if (dict && dict[key]) {
      return dict[key];
    }
    // Fallback to English dictionary
    if (TRANSLATIONS.en && TRANSLATIONS.en[key]) {
      return TRANSLATIONS.en[key];
    }
    return fallback || key;
  };

  const currentLanguageOption = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        currentLanguageOption,
        languages: SUPPORTED_LANGUAGES
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
}
