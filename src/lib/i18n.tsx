import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

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

export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  // ==========================================
  // 1. NEPALI (नेपाली)
  // ==========================================
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
    'common.normal': 'सामान्य',
    'common.notifications': 'सूचनाहरू',
    'common.no_notifications': 'कुनै नयाँ सूचना छैन',
    'common.demo_mode': 'डेमो मोड',
    'common.location': 'स्थान',
    'common.refresh': 'ताजा गर्नुहोस्',
    'common.exit': 'बाहिर निस्कनुहोस्',
    'common.close': 'बन्द गर्नुहोस्',
    'common.view': 'हेर्नुहोस्',
    'common.view_details': 'विस्तृत विवरण हेर्नुहोस्',
    'common.edit': 'सम्पादन गर्नुहोस्',
    'common.delete': 'मेटाउनुहोस्',
    'common.actions': 'कार्यहरू',
    'common.loading': 'लोड हुँदैछ...',
    'common.error': 'त्रुटि',
    'common.success': 'सफल',
    'common.warning': 'चेतावनी',
    'common.info': 'जानकारी',
    'common.confirm': 'पुष्टि गर्नुहोस्',
    'common.back': 'पछाडि',
    'common.next': 'अर्को',
    'common.reset': 'रिसेट गर्नुहोस्',
    'common.download': 'डाउनलोड गर्नुहोस्',
    'common.export': 'निर्यात गर्नुहोस्',
    'common.print': 'प्रिन्ट गर्नुहोस्',

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
    'teams.leader_name': 'नेताको नाम',
    'teams.contact_phone': 'सम्पर्क फोन नम्बर',
    'teams.team_size': 'टोली सदस्य संख्या',
    'teams.primary_skill': 'प्रमुख सीप / विशेषज्ञता',
    'teams.current_location': 'हालको स्थान',
    'teams.equipment': 'उपलब्ध उपकरणहरू',
    'teams.approve_team': 'टोली स्वीकृत गर्नुहोस्',
    'teams.deploy_now': 'तत्काल परिचालन गर्नुहोस्',

    // Routes & Navigation
    'routes.title': 'विपद् सचेत सुरक्षित सडक मार्ग निर्देशन',
    'routes.subtitle': 'सडक विभाग र जल तथा मौसम विज्ञान विभागको प्रत्यक्ष तथ्याङ्क अनुसार सुरक्षित मार्ग।',
    'routes.start_nav': 'गुगल म्याप्स नेभिगेसन सुरु गर्नुहोस् (फुलस्क्रिन)',
    'routes.safest_route': 'सबैभन्दा सुरक्षित मार्ग',
    'routes.route_to_avoid': 'बच्नुपर्ने अवरुद्ध मार्ग',
    'routes.dor_bridges': 'सडक विभाग पुलहरू',
    'routes.dhm_rivers': 'जल मापन केन्द्रहरू',
    'routes.travel_time': 'अनुमानित यात्रा समय',
    'routes.distance': 'जम्मा दूरी',
    'routes.origin': 'प्रस्थान स्थान',
    'routes.destination': 'गन्तव्य स्थान',
    'routes.test_scenarios': 'परीक्षण परिदृश्यहरू',
    'routes.baseline': 'सामान्य अवस्था',
    'routes.landslide': 'पहिरो अवरोध',
    'routes.river_flood': 'नदी बाढी संकट',
    'routes.turn_left': 'बायाँ मोडिनुहोस्',
    'routes.turn_right': 'दायाँ मोडिनुहोस्',
    'routes.move_forward': 'सिधा अगाडि बढ्नुहोस्',
    'routes.destination_reached': 'तपाईं गन्तव्यमा पुग्नुभयो',
    'routes.recalculating': 'मार्ग पुन: गणना हुँदैछ...',
    'routes.why_recommended': 'यो मार्ग किन सिफारिस गरियो:',
    'routes.speed': 'गति',
    'routes.eta': 'पुग्ने समय',
    'routes.exit_fullscreen': 'फुलस्क्रिन बन्द गर्नुहोस्',
    'routes.hazard_avoidance': 'खतराबाट बच्ने एआई तर्क:',

    // Weather & Risk
    'weather.title': 'मौसम पूर्वानुमान र नदी बाढी जोखिम',
    'weather.subtitle': 'नेपालका प्रमुख नदीहरूको प्रत्यक्ष जलस्तर, चेतावनी स्तर र बाढी पूर्वानुमान।',
    'weather.live_river_gauges': 'प्रत्यक्ष नदी जलस्तर मापन केन्द्रहरू',
    'weather.overview': 'मौसम अवलोकन',
    'weather.river_watch': 'नदी अनुगमन',
    'weather.precipitation': 'वर्षा',
    'weather.rainfall_rate': 'वर्षा दर',
    'weather.humidity': 'आर्द्रता',
    'weather.wind_speed': 'हावाको गति',
    'weather.temperature': 'तापक्रम',
    'weather.warning_level': 'चेतावनी तह',
    'weather.danger_level': 'खतराको तह',
    'weather.rising': 'बढ्दो क्रममा',
    'weather.falling': 'घट्दो क्रममा',
    'weather.steady': 'स्थिर',

    // Facilities & Hospitals
    'facilities.title': 'स्वास्थ्य तथा आपतकालीन सुविधाहरू',
    'facilities.subtitle': 'अस्पतालहरू, आपतकालीन आश्रयस्थल र राहत केन्द्रहरूको प्रत्यक्ष विवरण।',
    'facilities.hospitals': 'अस्पतालहरू',
    'facilities.shelters': 'आपतकालीन आश्रयस्थलहरू',
    'facilities.relief_hubs': 'राहत वितरण केन्द्रहरू',
    'facilities.blood_banks': 'रक्त सञ्चार केन्द्रहरू',
    'facilities.available_beds': 'उपलब्ध बेड संख्या',
    'facilities.icu_beds': 'आईसीयू बेड',
    'facilities.ventilators': 'भेन्टिलेटरहरू',
    'facilities.occupancy': 'बेड भरिएको स्थिति',
    'facilities.call_hospital': 'अस्पतालमा सम्पर्क गर्नुहोस्',
    'facilities.get_directions': 'मार्ग हेर्नुहोस्',
    'facilities.dispatch_ambulance': 'एम्बुलेन्स पठाउनुहोस्',

    // Hospital Matching
    'hospital.title': 'आपतकालीन बिरामी तथा अस्पताल मिलान',
    'hospital.subtitle': 'आईसीयू, ट्रमा र भेन्टिलेटर क्षमता अनुसार बिरामीलाई तुरुन्त उपयुक्त अस्पताल पठाउनुहोस्।',
    'hospital.matched_patients': 'सिफारिस गरिएका बिरामीहरू',
    'hospital.patient_registry': 'बिरामी दर्ता पुस्तिका',
    'hospital.submit_patient': 'नयाँ बिरामी विवरण दर्ता',
    'hospital.audit_log': 'प्रणाली अडिट लग',
    'hospital.match_confidence': 'मिलान प्रतिशत',
    'hospital.confirm_match': 'मिलान स्वीकृत गर्नुहोस्',
    'hospital.reject_match': 'अस्वीकार गर्नुहोस्',

    // News & Safety
    'news.title': 'प्रमाणित सूचना तथा सुरक्षा सल्लाह',
    'news.subtitle': 'राष्ट्रिय विपद् जोखिम न्यूनीकरण तथा व्यवस्थापन प्राधिकरण (NDRRMA) आधिकारिक जानकारी।',
    'news.verified_bulletins': 'प्रमाणित सूचनाहरू',
    'news.fact_checker': 'तथ्य जाँच तथा हल्ला निवारण',
    'news.missing_persons': 'हराएका व्यक्तिहरूको खोजी',
    'news.report_missing': 'हराएको व्यक्ति रिपोर्ट गर्नुहोस्',

    // Damage Assessment
    'assessment.title': 'विपद् क्षति तथा आवश्यकता द्रुत मूल्यांकन',
    'assessment.subtitle': 'भौतिक संरचना, घर, सडक र मानवीय क्षतिको तत्काल डिजिटल मूल्यांकन।',
    'assessment.total_casualties': 'जम्मा मानवीय क्षति',
    'assessment.injured': 'घाइते',
    'assessment.displaced': 'विस्थापित परिवार',
    'assessment.destroyed_houses': 'पूर्ण क्षति भएका घरहरू',

    // AI Priority & Command Center
    'aipriority.title': 'एआई प्राथमिकता तथा स्रोत परिचालन',
    'aipriority.subtitle': 'बहु-मापदण्ड निर्णय विश्लेषण अनुसार तत्काल उद्धार आवश्यक क्षेत्रहरूको सूची।',
    'command.title': 'केन्द्रीय आपतकालीन कमाण्ड सेन्टर',
    'command.subtitle': 'संयुक्त सुरक्षा बल, स्वास्थ्य टोली र स्वयंसेवकहरूको एकीकृत प्रत्यक्ष कमाण्ड।'
  },

  // ==========================================
  // 2. ENGLISH (English)
  // ==========================================
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
    'common.normal': 'Normal',
    'common.notifications': 'Notifications',
    'common.no_notifications': 'No notifications',
    'common.demo_mode': 'DEMO MODE',
    'common.location': 'Location',
    'common.refresh': 'Refresh',
    'common.exit': 'Exit',
    'common.close': 'Close',
    'common.view': 'View',
    'common.view_details': 'View Details',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.actions': 'Actions',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.warning': 'Warning',
    'common.info': 'Info',
    'common.confirm': 'Confirm',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.reset': 'Reset',
    'common.download': 'Download',
    'common.export': 'Export',
    'common.print': 'Print',

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
    'teams.leader_name': 'Leader Name',
    'teams.contact_phone': 'Contact Phone',
    'teams.team_size': 'Team Size',
    'teams.primary_skill': 'Primary Skill',
    'teams.current_location': 'Current Location',
    'teams.equipment': 'Available Equipment',
    'teams.approve_team': 'Approve Team',
    'teams.deploy_now': 'Deploy Now',

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
    'routes.origin': 'Origin Corridor',
    'routes.destination': 'Destination Corridor',
    'routes.test_scenarios': 'Test Scenarios',
    'routes.baseline': 'Baseline',
    'routes.landslide': 'Landslide',
    'routes.river_flood': 'River Flood',
    'routes.turn_left': 'Turn Left',
    'routes.turn_right': 'Turn Right',
    'routes.move_forward': 'Move Forward / Continue Straight',
    'routes.destination_reached': 'Destination Reached',
    'routes.recalculating': 'Recalculating route...',
    'routes.why_recommended': 'Why This Route is Recommended:',
    'routes.speed': 'Speed',
    'routes.eta': 'ETA',
    'routes.exit_fullscreen': 'Exit Fullscreen',
    'routes.hazard_avoidance': 'Hazard Avoidance AI Reasoning:',

    // Weather & Risk
    'weather.title': 'Weather Forecast & River Risk Telemetry',
    'weather.subtitle': 'Live hydrology monitoring across Nepal major river basins and warning thresholds.',
    'weather.live_river_gauges': 'Live River Gauges & Flood Stages',
    'weather.overview': 'Weather Overview',
    'weather.river_watch': 'River Watch',
    'weather.precipitation': 'Precipitation',
    'weather.rainfall_rate': 'Rainfall Rate',
    'weather.humidity': 'Humidity',
    'weather.wind_speed': 'Wind Speed',
    'weather.temperature': 'Temperature',
    'weather.warning_level': 'Warning Level',
    'weather.danger_level': 'Danger Level',
    'weather.rising': 'Rising',
    'weather.falling': 'Falling',
    'weather.steady': 'Steady',

    // Facilities & Hospitals
    'facilities.title': 'Emergency & Medical Facilities Network',
    'facilities.subtitle': 'Live availability of hospitals, relief distribution centers, and emergency shelters.',
    'facilities.hospitals': 'Hospitals',
    'facilities.shelters': 'Emergency Shelters',
    'facilities.relief_hubs': 'Relief Distribution Hubs',
    'facilities.blood_banks': 'Blood Banks',
    'facilities.available_beds': 'Available Beds',
    'facilities.icu_beds': 'ICU Beds',
    'facilities.ventilators': 'Ventilators',
    'facilities.occupancy': 'Bed Occupancy',
    'facilities.call_hospital': 'Call Facility',
    'facilities.get_directions': 'Get Directions',
    'facilities.dispatch_ambulance': 'Dispatch Ambulance',

    // Hospital Matching
    'hospital.title': 'Emergency Hospital & Patient Matching',
    'hospital.subtitle': 'Match incoming casualties to available ICU, trauma beds, and surgical capabilities.',
    'hospital.matched_patients': 'Matched Patients',
    'hospital.patient_registry': 'Patient Registry',
    'hospital.submit_patient': 'Submit Patient Intake',
    'hospital.audit_log': 'Audit Log',
    'hospital.match_confidence': 'Match Confidence',
    'hospital.confirm_match': 'Confirm Match',
    'hospital.reject_match': 'Reject Match',

    // News & Safety
    'news.title': 'Verified News & NDRRMA Safety Directives',
    'news.subtitle': 'Official disaster bulletins, fact-checking, and emergency citizen alerts.',
    'news.verified_bulletins': 'Verified Bulletins',
    'news.fact_checker': 'Fact Checker & Rumor Debunker',
    'news.missing_persons': 'Missing Persons Registry',
    'news.report_missing': 'Report Missing Person',

    // Damage Assessment
    'assessment.title': 'Rapid Damage & Needs Assessment (RDNA)',
    'assessment.subtitle': 'Post-disaster structural assessment, casualty logs, and emergency aid triage.',
    'assessment.total_casualties': 'Total Casualties',
    'assessment.injured': 'Injured',
    'assessment.displaced': 'Displaced Families',
    'assessment.destroyed_houses': 'Destroyed Houses',

    // AI Priority & Command Center
    'aipriority.title': 'AI Decision Engine & Response Prioritization',
    'aipriority.subtitle': 'Multi-criteria optimization to identify critical bottlenecks and dispatch teams.',
    'command.title': 'Unified Emergency Command Center',
    'command.subtitle': 'Central tactical command for security forces, health responders, and volunteer logistics.'
  },

  // ==========================================
  // 3. NEPAL BHASA / NEWARI (नेपाल भाषा)
  // ==========================================
  new: {
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
    'common.normal': 'सामान्य',
    'common.notifications': 'सुचं',
    'common.no_notifications': 'छुं सुचं मदु',
    'common.demo_mode': 'डेमो मोड',
    'common.location': 'थाय् (स्थान)',
    'common.refresh': 'न्हापाथें यानादिसँ',
    'common.exit': 'पिहाँ वनेगु',
    'common.close': 'तिनादिसँ',
    'common.view': 'स्वयेगु',
    'common.view_details': 'विस्तृत विवरण',
    'common.edit': 'हिलादिसँ',
    'common.delete': 'मेटायानादिसँ',
    'common.actions': 'ज्याखँ',
    'common.loading': 'लोड जुयाच्वंगु दु...',
    'common.error': 'गल्ती',
    'common.success': 'सफल',
    'common.warning': 'सतर्कता',
    'common.info': 'जानकारी',
    'common.confirm': 'पुष्टि यानादिसँ',
    'common.back': 'लिहां',
    'common.next': 'न्ह्यःने',
    'common.reset': 'रिसेट',

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

    'routes.title': 'सुरक्षित विपद् सचेत लँपु निर्देशन',
    'routes.subtitle': 'सडक विभाग व खुसिबाः प्रत्यक्ष विवरणकथं सुरक्षित लँपु।',
    'routes.start_nav': 'गुगल म्याप्स नेभिगेसन सुरु यानादिसँ (फुलस्क्रिन)',
    'routes.safest_route': 'दकलय् सुरक्षित लँपु',
    'routes.route_to_avoid': 'बचेजुइमाःगु लँपु',
    'routes.dor_bridges': 'सडक विभाग तां (पुल)',
    'routes.dhm_rivers': 'खुसि मापन केन्द्रत',
    'routes.travel_time': 'अनुमानित ई (समय)',
    'routes.distance': 'जम्मा तापाःगु (दूरी)',
    'routes.turn_left': 'देपाः पाखे वनेगु (बायाँ)',
    'routes.turn_right': 'ज्वपाः पाखे वनेगु (दायाँ)',
    'routes.move_forward': 'न्ह्यःने वनेगु (सिधा)',
    'routes.destination_reached': 'छि गन्तव्यय् थ्यन',
    'routes.why_recommended': 'थ्व लँपु सिफारिस याःगु कारण:',

    'weather.title': 'मौसम पूर्वानुमान व खुसि जोखिम',
    'weather.subtitle': 'नेपाःया मू खुसिबाःया प्रत्यक्ष जलस्तर व बाढी पूर्वसूचना।',
    'weather.live_river_gauges': 'प्रत्यक्ष खुसि जलस्तर केन्द्रत',
    'weather.overview': 'मौसम अवलोकन',
    'weather.river_watch': 'खुसि अनुगमन',

    'hospital.title': 'अस्पताल व ल्वगी मिलान',
    'hospital.subtitle': 'आईसीयू व बेड क्षमताकथं ल्वगीयात तुरन्त अस्पताल छ्वयेगु।',
    'hospital.matched_patients': 'मिलान जूगु ल्वगीत',

    'facilities.title': 'उसाँय् व आपतकालीन केन्द्रत',
    'facilities.subtitle': 'अस्पताल, राहत केन्द्र व शरण केन्द्रत।',

    'news.title': 'प्रमाणित बुखँ व सुरक्षा सुचं',
    'news.subtitle': 'प्राधिकरण पाखें आधिकारिक जानकारी।',

    'assessment.title': 'विपद् क्षति व आवश्यकता ल्यंकेगु',
    'assessment.subtitle': 'संरचना व मनूया क्षतिया तत्काल मूल्यांकन।',

    'aipriority.title': 'एआई प्राथमिकता व ग्वाहालि परिचालन',
    'aipriority.subtitle': 'तुरुन्त उद्धार माःगु क्षेत्रत।',

    'command.title': 'केन्द्रीय आपतकालीन कमाण्ड सेन्टर',
    'command.subtitle': 'सुरक्षाकर्मी व स्वयंसेवकतय्गु एकीकृत कमाण्ड।'
  },

  // ==========================================
  // 4. MAITHILI (मैथिली)
  // ==========================================
  mai: {
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
    'common.normal': 'सामान्य',
    'common.notifications': 'सूचनासभ',
    'common.no_notifications': 'कोनो नव सूचना नहि अछि',
    'common.demo_mode': 'डेमो मोड',
    'common.location': 'स्थान',
    'common.refresh': 'ताजा करू',
    'common.exit': 'बाहर जाउ',
    'common.close': 'बन्द करू',
    'common.view': 'देखू',
    'common.view_details': 'विस्तृत विवरण',
    'common.edit': 'सम्पादन',
    'common.delete': 'हटाउ',
    'common.actions': 'कार्य',
    'common.loading': 'लोड भ रहल अछि...',
    'common.error': 'त्रुटि',
    'common.success': 'सफल',
    'common.warning': 'चेतावनी',
    'common.info': 'जानकारी',
    'common.confirm': 'पुष्टि करू',
    'common.back': 'पाछाँ',
    'common.next': 'आगाँ',
    'common.reset': 'रिसेट',

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

    'routes.title': 'विपद् सचेत सुरक्षित रस्ता निर्देशन',
    'routes.subtitle': 'सड़क विभाग आ नदी बाढिक प्रत्यक्ष जानकारी अनुसार सुरक्षित मार्ग।',
    'routes.start_nav': 'गुगल म्याप्स नेभिगेसन शुरू करू (फुलस्क्रिन)',
    'routes.safest_route': 'सबसँ सुरक्षित रस्ता',
    'routes.route_to_avoid': 'बचबाक रस्ता',
    'routes.dor_bridges': 'सड़क विभागक पुल',
    'routes.dhm_rivers': 'नदी मापन केन्द्र',
    'routes.travel_time': 'अनुमानित यात्रा समय',
    'routes.distance': 'कुल दूरी',
    'routes.turn_left': 'बायाँ मुडू',
    'routes.turn_right': 'दायाँ मुडू',
    'routes.move_forward': 'सोझे आगाँ बढ़ू',
    'routes.destination_reached': 'अहाँ गन्तव्य पर पहुँचि गेलहुँ',
    'routes.why_recommended': 'ई रस्ता किएक सिफारिस कएल गेल:',

    'weather.title': 'मौसम पूर्वानुमान आ नदी जलस्तर',
    'weather.subtitle': 'नेपालक मुख्य नदीसभक प्रत्यक्ष जलस्तर आ बाढि पूर्वसूचना।',
    'weather.live_river_gauges': 'प्रत्यक्ष नदी जलस्तर केन्द्र',
    'weather.overview': 'मौसम अवलोकन',
    'weather.river_watch': 'नदी निगरानी',

    'hospital.title': 'अस्पताल आ बिरामी मिलान',
    'hospital.subtitle': 'आईसीयू आ बेड क्षमतानुकूल बिरामीकेँ तुरन्त उपयुक्त अस्पताल पठाउ।',
    'hospital.matched_patients': 'सिफारिस कएल बिरामी',

    'facilities.title': 'स्वास्थ्य आ राहत केन्द्रसभ',
    'facilities.subtitle': 'अस्पताल, आश्रयस्थल आ राहत वितरण केन्द्र।',

    'news.title': 'प्रमाणित समाचार आ सुरक्षा सूचना',
    'news.subtitle': 'प्राधिकरणक आधिकारिक सूचना आ सचेतता।',

    'assessment.title': 'क्षति आ आवश्यकता मूल्यांकन',
    'assessment.subtitle': 'घर, रस्ता आ मानवीय क्षतिक द्रुत मूल्यांकन।',

    'aipriority.title': 'एआई प्राथमिकता आ राहत प्रेषण',
    'aipriority.subtitle': 'तत्काल मद्दतिक आवश्यकता भेल क्षेत्रसभ।',

    'command.title': 'केन्द्रीय आपातकालीन कमाण्ड सेन्टर',
    'command.subtitle': 'सुरक्षा बल आ राहत दलाक एकीकृत कमाण्ड।'
  },

  // ==========================================
  // 5. HINDI (हिन्दी)
  // ==========================================
  hi: {
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
    'common.normal': 'सामान्य',
    'common.notifications': 'सूचनाएं',
    'common.no_notifications': 'कोई नई सूचना नहीं',
    'common.demo_mode': 'डेमो मोड',
    'common.location': 'स्थान',
    'common.refresh': 'ताज़ा करें',
    'common.exit': 'बाहर निकलें',
    'common.close': 'बंद करें',
    'common.view': 'देखें',
    'common.view_details': 'विवरण देखें',
    'common.edit': 'संपादित करें',
    'common.delete': 'हटाएं',
    'common.actions': 'कार्रवाई',
    'common.loading': 'लोड हो रहा है...',
    'common.error': 'त्रुटि',
    'common.success': 'सफल',
    'common.warning': 'चेतावनी',
    'common.info': 'जानकारी',
    'common.confirm': 'पुष्टि करें',
    'common.back': 'पीछे',
    'common.next': 'आगे',
    'common.reset': 'रीसेट',

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

    'routes.title': 'आपदा-सचेत सुरक्षित मार्ग नेविगेशन',
    'routes.subtitle': 'सड़क विभाग व नदी बाढ़ स्तर के लाइव डेटा के अनुसार सबसे सुरक्षित मार्ग।',
    'routes.start_nav': 'गूगल मैप्स नेविगेशन शुरू करें (फ़ुलस्क्रीन)',
    'routes.safest_route': 'सबसे सुरक्षित मार्ग',
    'routes.route_to_avoid': 'बचने योग्य अवरुद्ध मार्ग',
    'routes.dor_bridges': 'सड़क विभाग पुल',
    'routes.dhm_rivers': 'नदी जलस्तर केंद्र',
    'routes.travel_time': 'अनुमानित यात्रा समय',
    'routes.distance': 'कुल दूरी',
    'routes.turn_left': 'बाएं मुड़ें',
    'routes.turn_right': 'दाएं मुड़ें',
    'routes.move_forward': 'सीधे आगे बढ़ें',
    'routes.destination_reached': 'आप गंतव्य पर पहुँच गए हैं',
    'routes.why_recommended': 'यह मार्ग क्यों अनुशंसित है:',

    'weather.title': 'मौसम पूर्वानुमान व नदी जोखिम स्तर',
    'weather.subtitle': 'नेपाल की प्रमुख नदियों का लाइव जलस्तर, चेतावनी स्तर व बाढ़ पूर्वानुमान।',
    'weather.live_river_gauges': 'लाइव नदी जलस्तर गेज',
    'weather.overview': 'मौसम अवलोकन',
    'weather.river_watch': 'नदी निगरानी',

    'hospital.title': 'आपातकालीन अस्पताल व मरीज मिलान',
    'hospital.subtitle': 'आईसीयू व ट्रॉमा क्षमता के अनुसार मरीज को तुरंत उपयुक्त अस्पताल भेजें।',
    'hospital.matched_patients': 'अनुशंसित मरीज',

    'facilities.title': 'आपातकालीन व चिकित्सा सुविधाएं',
    'facilities.subtitle': 'अस्पताल, आश्रय स्थल और राहत आपूर्ति केंद्र।',

    'news.title': 'सत्यापित समाचार व एनडीआरआरएमए सुरक्षा निर्देश',
    'news.subtitle': 'आधिकारिक आपदा बुलेटिन और आपातकालीन निर्देश।',

    'assessment.title': 'क्षति व आवश्यकता त्वरित मूल्यांकन',
    'assessment.subtitle': 'मकानों, सड़कों और मानवीय क्षति का डिजिटल मूल्यांकन।',

    'aipriority.title': 'एआई निर्णय व संसाधन प्राथमिकता',
    'aipriority.subtitle': 'तत्काल राहत और बचाव हेतु अनुशंसित प्राथमिकताएं।',

    'command.title': 'एकीकृत आपातकालीन कमांड सेंटर',
    'command.subtitle': 'सुरक्षा बलों और स्वास्थ्य टीमों का केंद्रीय सामरिक नियंत्रण।'
  }
};

// ==========================================
// COMPREHENSIVE PHRASE GLOSSARY FOR TEXT & DYNAMIC TRANSLATION
// ==========================================
const COMMON_PHRASES: Record<string, Record<Language, string>> = {
  'Recorded in database': { ne: 'डाटाबेसमा अभिलेख गरिएको', en: 'Recorded in database', new: 'डाटाबेसय् अभिलेख यानातःगु', mai: 'डेटाबेसमे दर्ज', hi: 'डेटाबेस में दर्ज' },
  'Minors & medical risk': { ne: 'नाबालक तथा चिकित्सा जोखिम', en: 'Minors & medical risk', new: 'नाबालक व चिकित्सा जोखिम', mai: 'नाबालिग आ चिकित्सा जोखिम', hi: 'नाबालिग और चिकित्सा जोखिम' },
  'Unresolved cases': { ne: 'समाधान नभएका केसहरू', en: 'Unresolved cases', new: 'समाधान मदूगु केस', mai: 'अनसुलझल केस', hi: 'अनसुलझे मामले' },
  'Awaiting human review': { ne: 'मानवीय समीक्षाको प्रतीक्षामा', en: 'Awaiting human review', new: 'मनूया समीक्षा प्रतीक्षाय्', mai: 'मानवीय समीक्षाक प्रतीक्षा', hi: 'मानवीय समीक्षा की प्रतीक्षा' },
  'fresh leads': { ne: 'नयाँ सुराकहरू', en: 'fresh leads', new: 'न्हूगु सुराक', mai: 'नव सुराग', hi: 'नई सुराग' },
  'Officer verified safe': { ne: 'अधिकारीद्वारा सुरक्षित पुष्टि', en: 'Officer verified safe', new: 'अधिकारीया सुरक्षित पुष्टि', mai: 'अधिकारी द्वारा सुरक्षित सत्यापन', hi: 'अधिकारी द्वारा सुरक्षित सत्यापित' },
  'Privacy Safeguard: Personal contact phone numbers redacted in citizen view': { ne: 'गोपनीयता सुरक्षा: नागरिक दृश्यमा व्यक्तिगत फोन नम्बरहरू हटाइएका छन्', en: 'Privacy Safeguard: Personal contact phone numbers redacted in citizen view', new: 'गोपनीयता सुरक्षा: नागरिक दृश्यय् व्यक्तिगत फोन नम्बर लिकायेगु दु', mai: 'गोपनीयता सुरक्षा: नागरिक दृश्यमे व्यक्तिगत फोन नम्बर हटाओल गेल अछि', hi: 'गोपनीयता सुरक्षा: नागरिक दृश्य में व्यक्तिगत फोन नंबर छिपाए गए हैं' },
  'REAL SOURCE DATA': { ne: 'वास्तविक स्रोत तथ्याङ्क', en: 'REAL SOURCE DATA', new: 'वास्तविक स्रोत तथ्यांक', mai: 'वास्तविक स्रोत डेटा', hi: 'वास्तविक स्रोत डेटा' },
  'Patient Matching Portal': { ne: 'बिरामी मिलान पोर्टल', en: 'Patient Matching Portal', new: 'ल्वगी मिलान पोर्टल', mai: 'बिरामी मिलान पोर्टल', hi: 'मरीज मिलान पोर्टल' },
  'REFRESH HOSPITAL DATA': { ne: 'अस्पताल तथ्याङ्क ताजा गर्नुहोस्', en: 'REFRESH HOSPITAL DATA', new: 'अस्पताल तथ्यांक ताजा यानादिसँ', mai: 'अस्पताल डेटा ताज़ा करू', hi: 'अस्पताल डेटा रिफ्रेश करें' },
  'SOURCE UPDATED:': { ne: 'स्रोत अद्यावधिक:', en: 'SOURCE UPDATED:', new: 'स्रोत अद्यावधिक:', mai: 'स्रोत अपडेट:', hi: 'स्रोत अपडेट:' },
  'Source update time unavailable': { ne: 'स्रोत अद्यावधिक समय उपलब्ध छैन', en: 'Source update time unavailable', new: 'स्रोत अद्यावधिक समय उपलब्ध मदु', mai: 'स्रोत अपडेट समय उपलब्ध नहि', hi: 'स्रोत अपडेट समय उपलब्ध नहीं' },
  'SAHAYAK RETRIEVED:': { ne: 'SAHAYAK प्राप्त:', en: 'SAHAYAK RETRIEVED:', new: 'SAHAYAK प्राप्त:', mai: 'SAHAYAK प्राप्त:', hi: 'SAHAYAK प्राप्त:' },
  'Gross capacity': { ne: 'कुल क्षमता', en: 'Gross capacity', new: 'कुल क्षमता', mai: 'कुल क्षमता', hi: 'कुल क्षमता' },
  'Gov Free Quota': { ne: 'सरकारी निःशुल्क कोटा', en: 'Gov Free Quota', new: 'सरकारी निःशुल्क कोटा', mai: 'सरकारी निःशुल्क कोटा', hi: 'सरकारी मुफ्त कोटा' },
  'Active patients': { ne: 'सक्रिय बिरामीहरू', en: 'Active patients', new: 'सक्रिय ल्वगीत', mai: 'सक्रिय बिरामी', hi: 'सक्रिय मरीज' },
  'Open for intake': { ne: 'भर्नाका लागि खुला', en: 'Open for intake', new: 'दाखिलाया लागि खुला', mai: 'भर्ना लेल खुलल', hi: 'दाखिले के लिए खुला' },
  '28 Districts': { ne: '२८ जिल्लाहरू', en: '28 Districts', new: '२८ जिल्ला', mai: '२८ जिला', hi: '२८ जिले' },
  'Shelters': { ne: 'आश्रयस्थलहरू', en: 'Shelters', new: 'शरण थाय्', mai: 'आश्रय', hi: 'आश्रय स्थल' },
  'Emergency Centers': { ne: 'आपतकालीन केन्द्रहरू', en: 'Emergency Centers', new: 'आपतकालीन केन्द्र', mai: 'आपातकालीन केंद्र', hi: 'आपातकालीन केंद्र' },
  'Pharmacies': { ne: 'औषधि पसलहरू', en: 'Pharmacies', new: 'औषधि पसल', mai: 'औषधि पसल', hi: 'फार्मेसी' },
  'Blood Banks': { ne: 'रक्त बैंकहरू', en: 'Blood Banks', new: 'रक्त बैंक', mai: 'रक्त बैंक', hi: 'ब्लड बैंक' },
  'Relief Centers': { ne: 'राहत केन्द्रहरू', en: 'Relief Centers', new: 'राहत केन्द्र', mai: 'राहत केंद्र', hi: 'राहत केंद्र' },
  'All Facilities': { ne: 'सबै सुविधाहरू', en: 'All Facilities', new: 'दक्को सुविधा', mai: 'सब सुविधा', hi: 'सभी सुविधाएं' },
  'FREE BED OCCUPANCY': { ne: 'निःशुल्क बेड भरिएको', en: 'FREE BED OCCUPANCY', new: 'निःशुल्क बेड भरल', mai: 'निःशुल्क बेड भरल', hi: 'मुफ्त बेड भरे हुए' },
  'TOTAL SANCTION': { ne: 'कुल स्वीकृति', en: 'TOTAL SANCTION', new: 'कुल स्वीकृति', mai: 'कुल स्वीकृति', hi: 'कुल स्वीकृति' },
  'Inspect Details': { ne: 'विवरण हेर्नुहोस्', en: 'Inspect Details', new: 'विवरण स्वयादिसँ', mai: 'विवरण देखू', hi: 'विवरण देखें' },
  'GOVERNMENT (PUBLIC)': { ne: 'सरकार (सार्वजनिक)', en: 'GOVERNMENT (PUBLIC)', new: 'सरकार (सार्वजनिक)', mai: 'सरकार (सार्वजनिक)', hi: 'सरकार (सार्वजनिक)' },
  'Weather & River Basins Within Safe Limits': { ne: 'मौसम तथा नदी बेसिनहरू सुरक्षित सीमाभित्र', en: 'Weather & River Basins Within Safe Limits', new: 'मौसम व खुसि बेसिन सुरक्षित सीमाय्', mai: 'मौसम आ नदी बेसिन सुरक्षित सीमाक भीतर', hi: 'मौसम और नदी बेसिन सुरक्षित सीमा के भीतर' },
  'ALL CLEAR • LOW RISK': { ne: 'सबै सुरक्षित • न्यून जोखिम', en: 'ALL CLEAR • LOW RISK', new: 'दक्को सुरक्षित • न्यून जोखिम', mai: 'सब सुरक्षित • कम जोखिम', hi: 'सब सुरक्षित • कम जोखिम' },
  'Current Rain:': { ne: 'हालको वर्षा:', en: 'Current Rain:', new: 'हालया वा:', mai: 'वर्तमान वर्षा:', hi: 'वर्तमान बारिश:' },
  '24h Total:': { ne: '२४ घण्टे कुल:', en: '24h Total:', new: '२४ घण्टा कुल:', mai: '२४ घंटाक कुल:', hi: '२४ घंटे कुल:' },
  'River Basins: Normal Steady Flow': { ne: 'नदी बेसिन: सामान्य स्थिर बहाव', en: 'River Basins: Normal Steady Flow', new: 'खुसि बेसिन: सामान्य स्थिर बहाव', mai: 'नदी बेसिन: सामान्य स्थिर बहाव', hi: 'नदी बेसिन: सामान्य स्थिर प्रवाह' },
  'Road Corridors: Passable': { ne: 'सडक मार्ग: पार गर्न सकिने', en: 'Road Corridors: Passable', new: 'लँपु: वनेज्यूगु', mai: 'सड़क मार्ग: पार कएल जा सकैत अछि', hi: 'सड़क मार्ग: आवागमन योग्य' },
  'Intelligence Summary': { ne: 'सूचना सारांश', en: 'Intelligence Summary', new: 'सूचना सारांश', mai: 'सूचना सारांश', hi: 'खुफिया सारांश' },
  '24-Hour Predictive Trend': { ne: '२४ घण्टे पूर्वानुमान प्रवृत्ति', en: '24-Hour Predictive Trend', new: '२४ घण्टा पूर्वानुमान प्रवृत्ति', mai: '२४ घंटाक पूर्वानुमान प्रवृत्ति', hi: '२४ घंटे का पूर्वानुमान रुझान' },
  'Source Comparison': { ne: 'स्रोत तुलना', en: 'Source Comparison', new: 'स्रोत तुलना', mai: 'स्रोत तुलना', hi: 'स्रोत तुलना' },
  'Multi-source telemetry synchronized': { ne: 'बहु-स्रोत टेलिमेट्री समक्रमण गरिएको', en: 'Multi-source telemetry synchronized', new: 'बहु-स्रोत टेलिमेट्री समक्रमण यानातःगु', mai: 'बहु-स्रोत टेलीमेट्री सिंक कएल गेल', hi: 'बहु-स्रोत टेलीमेट्री समन्वयित' },
  'Live Monitors': { ne: 'प्रत्यक्ष अनुगमन', en: 'Live Monitors', new: 'प्रत्यक्ष अनुगमन', mai: 'लाइव निगरानी', hi: 'लाइव मॉनिटर' },
  'Synchronized': { ne: 'समक्रमण गरिएको', en: 'Synchronized', new: 'समक्रमण यानातःगु', mai: 'सिंक्रोनाइज़्ड', hi: 'समन्वयित' },
  'Damage Assessment': { ne: 'क्षति मूल्यांकन', en: 'Damage Assessment', new: 'क्षति मूल्याङ्कन', mai: 'क्षति मूल्यांकन', hi: 'क्षति मूल्यांकन' },
  'Submit New Report': { ne: 'नयाँ रिपोर्ट पेश गर्नुहोस्', en: 'Submit New Report', new: 'न्हूगु विवरण दाखिला यानादिसँ', mai: 'नव रिपोर्ट जमा करू', hi: 'नई रिपोर्ट जमा करें' },
  'Citizens and officials can report damage here.': { ne: 'नागरिक र अधिकारीहरूले यहाँ क्षति रिपोर्ट गर्न सक्छन्।', en: 'Citizens and officials can report damage here.', new: 'नागरिक व अधिकारीय् थ्वय् क्षति विवरण बियाःगु खः।', mai: 'नागरिक आ अधिकारी एतय क्षतिक रिपोर्ट कऽ सकैत छथि।', hi: 'नागरिक और अधिकारी यहां क्षति की रिपोर्ट कर सकते हैं।' },
  'Damage Type': { ne: 'क्षतिको प्रकार', en: 'Damage Type', new: 'क्षतिया प्रकार', mai: 'क्षतिक प्रकार', hi: 'क्षति का प्रकार' },
  'Building Collapse': { ne: 'भवन भत्किएको', en: 'Building Collapse', new: 'भवन भत्कल', mai: 'भवन ढहल', hi: 'इमारत ढहना' },
  'Road Blockage / Landslide': { ne: 'सडक अवरोध / पहिरो', en: 'Road Blockage / Landslide', new: 'लँपु अवरोध / चलः', mai: 'सड़क अवरोध / पहिरो', hi: 'सड़क अवरोध / भूस्खलन' },
  'Flooding': { ne: 'बाढी', en: 'Flooding', new: 'खुसिबाः', mai: 'बाढि', hi: 'बाढ़' },
  'Power/Comm Outage': { ne: 'विद्युत/सञ्चार अवरोध', en: 'Power/Comm Outage', new: 'बिजुली/सञ्चार अवरोध', mai: 'बिजली/संचार बाधित', hi: 'बिजली/संचार बाधित' },
  'Other Infrastructure': { ne: 'अन्य पूर्वाधार', en: 'Other Infrastructure', new: 'मेगु पूर्वाधार', mai: 'दोसर आधारभूत संरचना', hi: 'अन्य बुनियादी ढांचा' },
  'Estimated Severity': { ne: 'अनुमानित गम्भीरता', en: 'Estimated Severity', new: 'अनुमानित गम्भीरता', mai: 'अनुमानित गम्भीरता', hi: 'अनुमानित गंभीरता' },
  'Low': { ne: 'न्यून', en: 'Low', new: 'न्यून', mai: 'कम', hi: 'कम' },
  'Moderate': { ne: 'मध्यम', en: 'Moderate', new: 'मध्यम', mai: 'मध्यम', hi: 'मध्यम' },
  'High': { ne: 'उच्च', en: 'High', new: 'उच्च', mai: 'उच्च', hi: 'उच्च' },
  'Critical': { ne: 'अति गम्भीर', en: 'Critical', new: 'तसकं गम्भीर', mai: 'अति गम्भीर', hi: 'अति गंभीर' },
  'Description & Impact': { ne: 'विवरण तथा प्रभाव', en: 'Description & Impact', new: 'विवरण व प्रभाव', mai: 'विवरण आ प्रभाव', hi: 'विवरण और प्रभाव' },
  'Provide details about the severity...': { ne: 'गम्भीरताबारे विवरण दिनुहोस्...', en: 'Provide details about the severity...', new: 'गम्भीरताया विवरण बियादिसँ...', mai: 'गम्भीरताक विवरण दिअ...', hi: 'गंभीरता के बारे में विवरण दें...' },
  'Visual Evidence': { ne: 'दृश्य प्रमाण', en: 'Visual Evidence', new: 'दृश्य प्रमाण', mai: 'दृश्य प्रमाण', hi: 'दृश्य प्रमाण' },
  'Tap to upload photos': { ne: 'फोटो अपलोड गर्न थिच्नुहोस्', en: 'Tap to upload photos', new: 'फोटो अपलोड यायेगु लागि थ्वय् थ्वयेगु', mai: 'फोटो अपलोड लेल दबाउ', hi: 'फ़ोटो अपलोड करने के लिए दबाएं' },
  'Submit Report': { ne: 'रिपोर्ट पेश गर्नुहोस्', en: 'Submit Report', new: 'विवरण दाखिला यानादिसँ', mai: 'रिपोर्ट जमा करू', hi: 'रिपोर्ट जमा करें' },
  'Analysis Board (Demo Data)': { ne: 'विश्लेषण बोर्ड (डेमो तथ्याङ्क)', en: 'Analysis Board (Demo Data)', new: 'विश्लेषण बोर्ड (डेमो तथ्यांक)', mai: 'विश्लेषण बोर्ड (डेमो डेटा)', hi: 'विश्लेषण बोर्ड (डेमो डेटा)' },
  'Incoming reports shown here. Advanced AI validation pending integration.': { ne: 'आएका रिपोर्टहरू यहाँ देखाइन्छन्। उन्नत एआई प्रमाणीकरण एकीकरण हुन बाँकी छ।', en: 'Incoming reports shown here. Advanced AI validation pending integration.', new: 'आगु विवरण थ्वय् क्यनेगु दु। उन्नत एआई प्रमाणीकरण एकीकरण जुइ ल्यं।', mai: 'आएल रिपोर्ट एतय देखाओल जा रहल अछि। उन्नत एआई सत्यापन एकीकरण बाँकी अछि।', hi: 'आने वाली रिपोर्ट यहां दिखाई जाती हैं। उन्नत एआई सत्यापन का एकीकरण लंबित है।' },
  'No damage reports for this area.': { ne: 'यस क्षेत्रमा क्षतिको कुनै रिपोर्ट छैन।', en: 'No damage reports for this area.', new: 'थ्व थाय् क्षतिया विवरण मदु।', mai: 'एहि क्षेत्र लेल क्षतिक कोनो रिपोर्ट नहि अछि।', hi: 'इस क्षेत्र के लिए कोई क्षति रिपोर्ट नहीं है।' },
  'Verified': { ne: 'प्रमाणित', en: 'Verified', new: 'प्रमाणित', mai: 'सत्यापित', hi: 'सत्यापित' },
  'Acknowledge': { ne: 'स्वीकार गर्नुहोस्', en: 'Acknowledge', new: 'स्वीकार यानादिसँ', mai: 'स्वीकार करू', hi: 'स्वीकार करें' },
  'Strategic Command Center': { ne: 'रणनीतिक कमाण्ड सेन्टर', en: 'Strategic Command Center', new: 'रणनीतिक कमाण्ड सेन्टर', mai: 'रणनीतिक कमांड सेंटर', hi: 'रणनीतिक कमांड सेंटर' },
  'Demo Mode': { ne: 'डेमो मोड', en: 'Demo Mode', new: 'डेमो मोड', mai: 'डेमो मोड', hi: 'डेमो मोड' },
  'Master Intelligence': { ne: 'मुख्य सूचना', en: 'Master Intelligence', new: 'मुख्य सूचना', mai: 'मुख्य सूचना', hi: 'मुख्य खुफिया' },
  'System Risk': { ne: 'प्रणाली जोखिम', en: 'System Risk', new: 'प्रणाली जोखिम', mai: 'प्रणाली जोखिम', hi: 'सिस्टम जोखिम' },
  'Source Confidence': { ne: 'स्रोत विश्वसनीयता', en: 'Source Confidence', new: 'स्रोत विश्वसनीयता', mai: 'स्रोत विश्वास', hi: 'स्रोत विश्वसनीयता' },
  'Blockages': { ne: 'अवरोधहरू', en: 'Blockages', new: 'अवरोधत', mai: 'अवरोध', hi: 'अवरोध' },
  'Restrictions': { ne: 'प्रतिबन्धहरू', en: 'Restrictions', new: 'प्रतिबन्धत', mai: 'प्रतिबंध', hi: 'प्रतिबंध' },
  'Bridges Monitored:': { ne: 'अनुगमन गरिएका पुलहरू:', en: 'Bridges Monitored:', new: 'अनुगमन यानातःगु तां:', mai: 'निगरानी कएल पुल:', hi: 'निगरानी किए गए पुल:' },
  'National BIPAD Picture': { ne: 'राष्ट्रिय BIPAD अवस्था', en: 'National BIPAD Picture', new: 'राष्ट्रिय BIPAD अवस्था', mai: 'राष्ट्रीय BIPAD स्थिति', hi: 'राष्ट्रीय BIPAD स्थिति' },
  'Warnings': { ne: 'चेतावनीहरू', en: 'Warnings', new: 'सतर्कतात', mai: 'चेतावनी', hi: 'चेतावनियां' },
  'Live Alerts': { ne: 'प्रत्यक्ष सतर्कताहरू', en: 'Live Alerts', new: 'प्रत्यक्ष सतर्कतात', mai: 'लाइव अलर्ट', hi: 'लाइव अलर्ट' },
  'Hospitals at Maximum Capacity': { ne: 'अधिकतम क्षमतामा रहेका अस्पतालहरू', en: 'Hospitals at Maximum Capacity', new: 'अधिकतम क्षमताय् दुगु अस्पतालत', mai: 'अधिकतम क्षमता पर अस्पताल', hi: 'अधिकतम क्षमता वाले अस्पताल' },
  'Hospital capacity data loading.': { ne: 'अस्पताल क्षमता तथ्याङ्क लोड हुँदैछ।', en: 'Hospital capacity data loading.', new: 'अस्पताल क्षमता तथ्यांक लोड जुयाच्वंगु।', mai: 'अस्पताल क्षमता डेटा लोड भ रहल अछि।', hi: 'अस्पताल क्षमता डेटा लोड हो रहा है।' },
  'Current Location': { ne: 'हालको स्थान', en: 'Current Location', new: 'हालया थाय्', mai: 'वर्तमान स्थान', hi: 'वर्तमान स्थान' },
  'Automatically detected': { ne: 'स्वचालित रूपमा पहिचान', en: 'Automatically detected', new: 'स्वचालित पहिचान', mai: 'स्वतः पहिचान', hi: 'स्वचालित रूप से पहचाना गया' },
  'DOR Highway Network & Disaster Awareness': { ne: 'DOR राजमार्ग नेटवर्क तथा विपद् सचेतना', en: 'DOR Highway Network & Disaster Awareness', new: 'DOR राजमार्ग नेटवर्क व विपद् सचेतना', mai: 'DOR राजमार्ग नेटवर्क आ आपदा जागरूकता', hi: 'DOR राजमार्ग नेटवर्क और आपदा जागरूकता' },
  'Routing Priority Profile': { ne: 'मार्ग प्राथमिकता प्रोफाइल', en: 'Routing Priority Profile', new: 'लँपु प्राथमिकता प्रोफाइल', mai: 'मार्ग प्राथमिकता प्रोफाइल', hi: 'मार्ग प्राथमिकता प्रोफ़ाइल' },
  'Citizen / Light': { ne: 'नागरिक / हल्का', en: 'Citizen / Light', new: 'नागरिक / हलु', mai: 'नागरिक / हल्का', hi: 'नागरिक / हल्का' },
  'Ambulance': { ne: 'एम्बुलेन्स', en: 'Ambulance', new: 'एम्बुलेन्स', mai: 'एम्बुलेन्स', hi: 'एम्बुलेंस' },
  'Fire': { ne: 'दमकल', en: 'Fire', new: 'दमकल', mai: 'अग्नि', hi: 'अग्निशमन' },
  'Rescue': { ne: 'उद्धार', en: 'Rescue', new: 'उद्धार', mai: 'उद्धार', hi: 'बचाव' },
  'Relief': { ne: 'राहत', en: 'Relief', new: 'राहत', mai: 'राहत', hi: 'राहत' },
  'To Safe Hospital': { ne: 'सुरक्षित अस्पतालमा', en: 'To Safe Hospital', new: 'सुरक्षित अस्पतालय्', mai: 'सुरक्षित अस्पताल', hi: 'सुरक्षित अस्पताल' },
  'Emergency Shelters': { ne: 'आपतकालीन आश्रयस्थलहरू', en: 'Emergency Shelters', new: 'आपतकालीन शरण थाय्', mai: 'आपातकालीन आश्रय', hi: 'आपातकालीन आश्रय स्थल' },
  'Starting Corridor': { ne: 'प्रस्थान मार्ग', en: 'Starting Corridor', new: 'शुरु लँपु', mai: 'प्रस्थान मार्ग', hi: 'प्रस्थान गलियारा' },
  'Current Location, Automatically detected': { ne: 'हालको स्थान, स्वचालित रूपमा पहिचान', en: 'Current Location, Automatically detected', new: 'हालया थाय्, स्वचालित पहिचान', mai: 'वर्तमान स्थान, स्वतः पहिचान', hi: 'वर्तमान स्थान, स्वचालित रूप से पहचाना गया' },
  'DOR Highway Status': { ne: 'DOR राजमार्ग स्थिति', en: 'DOR Highway Status', new: 'DOR राजमार्ग अवस्था', mai: 'DOR राजमार्ग स्थिति', hi: 'DOR राजमार्ग स्थिति' },
  'Emergency Facilities & Hospitals': { ne: 'आपतकालीन सुविधाहरू तथा अस्पतालहरू', en: 'Emergency Facilities & Hospitals', new: 'आपतकालीन सुविधा व अस्पताल', mai: 'आपातकालीन सुविधा आ अस्पताल', hi: 'आपातकालीन सुविधाएं और अस्पताल' },
  'Authoritative Nepal medical bed availability, free health quota capacities, and shelter networks.': { ne: 'नेपालका आधिकारिक चिकित्सा बेड उपलब्धता, निःशुल्क स्वास्थ्य कोटा क्षमता र आश्रय नेटवर्क।', en: 'Authoritative Nepal medical bed availability, free health quota capacities, and shelter networks.', new: 'नेपालया आधिकारिक चिकित्सा बेड उपलब्धता, निःशुल्क स्वास्थ्य कोटा व शरण नेटवर्क।', mai: 'नेपालक आधिकारिक चिकित्सा बेड उपलब्धता, निःशुल्क स्वास्थ्य कोटा क्षमता आ आश्रय नेटवर्क।', hi: 'नेपाल में आधिकारिक चिकित्सा बेड उपलब्धता, मुफ्त स्वास्थ्य कोटा क्षमता और आश्रय नेटवर्क।' },
  'DATA SOURCE: NEPAL GOVERNMENT — FREE HEALTH DASHBOARD': { ne: 'तथ्याङ्क स्रोत: नेपाल सरकार — निःशुल्क स्वास्थ्य ड्यासबोर्ड', en: 'DATA SOURCE: NEPAL GOVERNMENT — FREE HEALTH DASHBOARD', new: 'तथ्यांक स्रोत: नेपाल सरकार — निःशुल्क स्वास्थ्य ड्यासबोर्ड', mai: 'डेटा स्रोत: नेपाल सरकार — निःशुल्क स्वास्थ्य डैशबोर्ड', hi: 'डेटा स्रोत: नेपाल सरकार — निःशुल्क स्वास्थ्य डैशबोर्ड' },
  'HOSPITALS TRACKED': { ne: 'अनुगमन गरिएका अस्पताल', en: 'HOSPITALS TRACKED', new: 'अनुगमन यानातःगु अस्पताल', mai: 'निगरानी कएल अस्पताल', hi: 'ट्रैक किए गए अस्पताल' },
  'TOTAL SANCTION BEDS': { ne: 'कुल स्वीकृत बेड', en: 'TOTAL SANCTION BEDS', new: 'कुल स्वीकृत बेड', mai: 'कुल स्वीकृत बेड', hi: 'कुल स्वीकृत बेड' },
  'ALLOCATED FREE BEDS': { ne: 'तोकिएका निःशुल्क बेड', en: 'ALLOCATED FREE BEDS', new: 'तोकेयानातःगु निःशुल्क बेड', mai: 'आवंटित निःशुल्क बेड', hi: 'आवंटित मुफ्त बेड' },
  'OCCUPIED FREE BEDS': { ne: 'भरिएका निःशुल्क बेड', en: 'OCCUPIED FREE BEDS', new: 'भरल निःशुल्क बेड', mai: 'भरल निःशुल्क बेड', hi: 'भरे हुए मुफ्त बेड' },
  'AVAILABLE FREE BEDS': { ne: 'उपलब्ध निःशुल्क बेड', en: 'AVAILABLE FREE BEDS', new: 'उपलब्ध निःशुल्क बेड', mai: 'उपलब्ध निःशुल्क बेड', hi: 'उपलब्ध मुफ्त बेड' },
  'NEAR CAPACITY': { ne: 'क्षमता नजिक', en: 'NEAR CAPACITY', new: 'क्षमता नजिक', mai: 'क्षमताक नजदीक', hi: 'क्षमता के करीब' },
  'TOTAL CASES': { ne: 'कुल केसहरू', en: 'TOTAL CASES', new: 'कुल केस', mai: 'कुल केस', hi: 'कुल मामले' },
  'ACTIVE SEARCH': { ne: 'सक्रिय खोजी', en: 'ACTIVE SEARCH', new: 'सक्रिय माला', mai: 'सक्रिय खोज', hi: 'सक्रिय खोज' },
  'POTENTIAL MATCHES': { ne: 'सम्भावित मिलान', en: 'POTENTIAL MATCHES', new: 'सम्भावित मिलान', mai: 'सम्भावित मिलान', hi: 'संभावित मिलान' },
  'FIELD SIGHTINGS': { ne: 'मैदानी देखाइहरू', en: 'FIELD SIGHTINGS', new: 'मैदानी खंगु', mai: 'फील्ड देखल', hi: 'फ़ील्ड sightings' },
  'VERIFIED FOUND': { ne: 'पुष्टि भएका भेटिएका', en: 'VERIFIED FOUND', new: 'पुष्टि जूगु खंगु', mai: 'पुष्टि भेल भेटल', hi: 'सत्यापित मिले' },
  'Search by name': { ne: 'नामबाट खोज्नुहोस्', en: 'Search by name', new: 'नांसँ माला', mai: 'नामसँ खोजू', hi: 'नाम से खोजें' },
  'All Sources': { ne: 'सबै स्रोतहरू', en: 'All Sources', new: 'दक्को स्रोत', mai: 'सब स्रोत', hi: 'सभी स्रोत' },
  'Reset': { ne: 'रिसेट', en: 'Reset', new: 'रिसेट', mai: 'रीसेट', hi: 'रीसेट' },
  'Showing': { ne: 'देखाउँदै', en: 'Showing', new: 'क्यनेगु', mai: 'देखाओल जा रहल', hi: 'दिखाया जा रहा है' },
  'out of': { ne: 'मध्ये', en: 'out of', new: 'मध्ये', mai: 'मे सँ', hi: 'में से' },
  'Current Location Risk Profile': { ne: 'हालको स्थान जोखिम प्रोफाइल', en: 'Current Location Risk Profile', new: 'हालया थाय् जोखिम प्रोफाइल', mai: 'वर्तमान स्थान जोखिम प्रोफाइल', hi: 'वर्तमान स्थान जोखिम प्रोफ़ाइल' },
  'SAHAYAK Master Intelligence & Threat Analysis': { ne: 'SAHAYAK मुख्य सूचना तथा खतरा विश्लेषण', en: 'SAHAYAK Master Intelligence & Threat Analysis', new: 'SAHAYAK मुख्य सूचना व खतरा विश्लेषण', mai: 'SAHAYAK मुख्य सूचना आ खतरा विश्लेषण', hi: 'SAHAYAK मुख्य खुफिया और खतरा विश्लेषण' },
  'Multi-Hazard Risk Profile': { ne: 'बहु-खतरा जोखिम प्रोफाइल', en: 'Multi-Hazard Risk Profile', new: 'बहु-खतरा जोखिम प्रोफाइल', mai: 'बहु-खतरा जोखिम प्रोफाइल', hi: 'बहु-खतरा जोखिम प्रोफ़ाइल' },
  'Nepal DHM River Watch Telemetry': { ne: 'नेपाल DHM नदी अनुगमन टेलिमेट्री', en: 'Nepal DHM River Watch Telemetry', new: 'नेपाल DHM खुसि अनुगमन टेलिमेट्री', mai: 'नेपाल DHM नदी निगरानी टेलीमेट्री', hi: 'नेपाल DHM नदी निगरानी टेलीमेट्री' },
  'Rain Probability Today:': { ne: 'आज वर्षाको सम्भावना:', en: 'Rain Probability Today:', new: 'थौं वा वइगु सम्भावना:', mai: 'आइ वर्षाक सम्भावना:', hi: 'आज बारिश की संभावना:' },
  'MASTER TEMP': { ne: 'मुख्य तापक्रम', en: 'MASTER TEMP', new: 'मुख्य तापक्रम', mai: 'मुख्य तापमान', hi: 'मुख्य तापमान' },
  'RAIN PROB (TODAY)': { ne: 'आजको वर्षा सम्भावना', en: 'RAIN PROB (TODAY)', new: 'थौंया वा सम्भावना', mai: 'आइक वर्षाक सम्भावना', hi: 'आज बारिश की संभावना' },
  'RISK LEVEL (SCORE 11/100)': { ne: 'जोखिम तह (स्कोर ११/१००)', en: 'RISK LEVEL (SCORE 11/100)', new: 'जोखिम स्तर (स्कोर ११/१००)', mai: 'जोखिम स्तर (स्कोर ११/१००)', hi: 'जोखिम स्तर (स्कोर ११/१००)' },
  'DHM CAUTION MARK': { ne: 'DHM सावधानी चिन्ह', en: 'DHM CAUTION MARK', new: 'DHM सावधानी चिन्ह', mai: 'DHM सावधानी चिन्ह', hi: 'DHM सावधानी चिह्न' },
  'AI Hazard Analysis & Multi-Model Calibration': { ne: 'एआई खतरा विश्लेषण तथा बहु-मोडेल क्यालिब्रेसन', en: 'AI Hazard Analysis & Multi-Model Calibration', new: 'एआई खतरा विश्लेषण व बहु-मोडेल क्यालिब्रेसन', mai: 'एआई खतरा विश्लेषण आ बहु-मॉडल कैलिब्रेशन', hi: 'एआई खतरा विश्लेषण और बहु-मॉडल कैलिब्रेशन' },
  'Confidence Floor:': { ne: 'विश्वसनीयता न्यूनतम सीमा:', en: 'Confidence Floor:', new: 'विश्वसनीयता न्यूनतम सीमा:', mai: 'विश्वास सीमा:', hi: 'विश्वसनीयता न्यूनतम सीमा:' },
  'Base-Level Normalized': { ne: 'आधार तह सामान्यीकृत', en: 'Base-Level Normalized', new: 'आधार तह सामान्यीकृत', mai: 'आधार स्तर सामान्यीकृत', hi: 'आधार स्तर सामान्यीकृत' },
  'Flood Assessment': { ne: 'बाढी मूल्यांकन', en: 'Flood Assessment', new: 'खुसिबाः मूल्याङ्कन', mai: 'बाढि मूल्यांकन', hi: 'बाढ़ मूल्यांकन' },
  'Landslide Assessment': { ne: 'पहिरो मूल्यांकन', en: 'Landslide Assessment', new: 'चलः मूल्याङ्कन', mai: 'पहिरो मूल्यांकन', hi: 'भूस्खलन मूल्यांकन' },
  'Why? (AI & Meteorological Logic)': { ne: 'किन? (एआई तथा मौसम विज्ञान तर्क)', en: 'Why? (AI & Meteorological Logic)', new: 'कसाया? (एआई व मौसम विज्ञान तर्क)', mai: 'किएक? (एआई आ मौसम विज्ञान तर्क)', hi: 'क्यों? (एआई और मौसम विज्ञान तर्क)' },
  'Confidence:': { ne: 'विश्वसनीयता:', en: 'Confidence:', new: 'विश्वसनीयता:', mai: 'विश्वास:', hi: 'विश्वसनीयता:' },
  'Telemetry Factors': { ne: 'टेलिमेट्री कारकहरू', en: 'Telemetry Factors', new: 'टेलिमेट्री कारकत', mai: 'टेलीमेट्री कारक', hi: 'टेलीमेट्री कारक' },
  'Live BIPAD Portal Alerts': { ne: 'प्रत्यक्ष BIPAD पोर्टल सतर्कताहरू', en: 'Live BIPAD Portal Alerts', new: 'प्रत्यक्ष BIPAD पोर्टल सतर्कतात', mai: 'लाइव BIPAD पोर्टल अलर्ट', hi: 'लाइव BIPAD पोर्टल अलर्ट' },
  'Realtime alerts from the Government of Nepal disaster information portal.': { ne: 'नेपाल सरकारको विपद् सूचना पोर्टलबाट प्रत्यक्ष सतर्कताहरू।', en: 'Realtime alerts from the Government of Nepal disaster information portal.', new: 'नेपाल सरकारया विपद् सूचना पोर्टलपाखें प्रत्यक्ष सतर्कतात।', mai: 'नेपाल सरकारक आपदा सूचना पोर्टलसँ लाइव अलर्ट।', hi: 'नेपाल सरकार के आपदा सूचना पोर्टल से रीयल-टाइम अलर्ट।' },
  'BIPAD LIVE': { ne: 'BIPAD प्रत्यक्ष', en: 'BIPAD LIVE', new: 'BIPAD प्रत्यक्ष', mai: 'BIPAD लाइव', hi: 'BIPAD लाइव' },
  'Refresh': { ne: 'ताजा गर्नुहोस्', en: 'Refresh', new: 'ताजा यानादिसँ', mai: 'ताज़ा करू', hi: 'रिफ्रेश करें' },
  'Synchronizing BIPAD alerts...': { ne: 'BIPAD सतर्कताहरू समक्रमण हुँदैछ...', en: 'Synchronizing BIPAD alerts...', new: 'BIPAD सतर्कता समक्रमण जुयाच्वंगु...', mai: 'BIPAD अलर्ट सिंक भ रहल अछि...', hi: 'BIPAD अलर्ट सिंक हो रहे हैं...' },
  'No BIPAD alerts available.': { ne: 'कुनै BIPAD सतर्कता उपलब्ध छैन।', en: 'No BIPAD alerts available.', new: 'छुं BIPAD सतर्कता उपलब्ध मदु।', mai: 'कोनो BIPAD अलर्ट उपलब्ध नहि अछि।', hi: 'कोई BIPAD अलर्ट उपलब्ध नहीं है।' },
  'Last synced:': { ne: 'पछिल्लो समक्रमण:', en: 'Last synced:', new: 'लिपांगु समक्रमण:', mai: 'पछिला सिंक:', hi: 'अंतिम सिंक:' },
  'One calm place for Nepal\'s emergency decisions.': { ne: 'नेपालका आपतकालीन निर्णयका लागि शान्त र भरपर्दो स्थान।', en: 'One calm place for Nepal\'s emergency decisions.', new: 'नेपालया आपतकालीन निर्णयय् लागि शान्त व भरपर्दो थाय्।', mai: 'नेपालक आपातकालीन निर्णय लेल एक शान्त आ भरोसाक स्थान।', hi: 'नेपाल के आपातकालीन निर्णयों के लिए एक शांत और भरोसेमंद स्थान।' },
  'Stay informed as a citizen, or coordinate response operations with the full national intelligence workspace.': { ne: 'नागरिकका रूपमा जानकारीमा रहनुहोस् वा पूर्ण राष्ट्रिय सूचना कार्यक्षेत्रबाट उद्धार कार्य समन्वय गर्नुहोस्।', en: 'Stay informed as a citizen, or coordinate response operations with the full national intelligence workspace.', new: 'नागरिक जक जानकारीय् दुगु वा सम्पूर्ण राष्ट्रिय सूचना कार्यक्षेत्रपाखें उद्धार कार्य समन्वय यानादिसँ।', mai: 'नागरिकक रूपमे जानकारीमे रहू अथवा पूर्ण राष्ट्रिय सूचना कार्यक्षेत्रसँ प्रतिक्रिया कार्य समन्वय करू।', hi: 'नागरिक के रूप में जानकारी रखें या पूरे राष्ट्रीय सूचना कार्यक्षेत्र से प्रतिक्रिया कार्यों का समन्वय करें।' },
  'Weather, rivers & roads': { ne: 'मौसम, नदी र सडकहरू', en: 'Weather, rivers & roads', new: 'मौसम, खुसि व लँपु', mai: 'मौसम, नदी आ सड़क', hi: 'मौसम, नदियां और सड़कें' },
  'SECURE': { ne: 'सुरक्षित', en: 'SECURE', new: 'सुरक्षित', mai: 'सुरक्षित', hi: 'सुरक्षित' },
  'Role-based workspaces': { ne: 'भूमिका आधारित कार्यक्षेत्र', en: 'Role-based workspaces', new: 'भूमिका आधारित कार्यक्षेत्र', mai: 'भूमिका आधारित कार्यक्षेत्र', hi: 'भूमिका आधारित कार्यक्षेत्र' },
  'Emergency access portal': { ne: 'आपतकालीन पहुँच पोर्टल', en: 'Emergency access portal', new: 'आपतकालीन पहुँच पोर्टल', mai: 'आपातकालीन पहुँच पोर्टल', hi: 'आपातकालीन एक्सेस पोर्टल' },
  'How are you joining today?': { ne: 'आज तपाईं कसरी प्रवेश गर्दै हुनुहुन्छ?', en: 'How are you joining today?', new: 'थौं छिं जकं प्रवेश यानाच्वन?', mai: 'आइ अहाँ कोना जुड़ि रहल छी?', hi: 'आज आप कैसे जुड़ रहे हैं?' },
  'Choose the workspace that matches your role.': { ne: 'तपाईंको भूमिकासँग मिल्ने कार्यक्षेत्र छान्नुहोस्।', en: 'Choose the workspace that matches your role.', new: 'छिंया भूमिकानाप मिलायेगु कार्यक्षेत्र स्वयादिसँ।', mai: 'अपन भूमिकासँ मेल खाइत कार्यक्षेत्र चुनू।', hi: 'अपनी भूमिका के अनुसार कार्यक्षेत्र चुनें।' },
  'General user': { ne: 'सामान्य प्रयोगकर्ता', en: 'General user', new: 'सामान्य प्रयोगकर्ता', mai: 'सामान्य उपयोगकर्ता', hi: 'सामान्य उपयोगकर्ता' },
  'Safety alerts, weather, roads and facilities': { ne: 'सुरक्षा सतर्कता, मौसम, सडक र सुविधाहरू', en: 'Safety alerts, weather, roads and facilities', new: 'सुरक्षा सतर्कता, मौसम, लँपु व सुविधा', mai: 'सुरक्षा अलर्ट, मौसम, सड़क आ सुविधा', hi: 'सुरक्षा अलर्ट, मौसम, सड़कें और सुविधाएं' },
  'Full command, response and coordination tools': { ne: 'पूर्ण कमाण्ड, उद्धार र समन्वय उपकरणहरू', en: 'Full command, response and coordination tools', new: 'पूर्ण कमाण्ड, उद्धार व समन्वय उपकरण', mai: 'पूर्ण कमांड, प्रतिक्रिया आ समन्वय उपकरण', hi: 'पूर्ण कमांड, प्रतिक्रिया और समन्वय उपकरण' },
  'Choose another access type': { ne: 'अर्को पहुँच प्रकार छान्नुहोस्', en: 'Choose another access type', new: 'मेगु पहुँच प्रकार स्वयादिसँ', mai: 'दोसर पहुँच प्रकार चुनू', hi: 'दूसरा एक्सेस प्रकार चुनें' },
  'General access': { ne: 'सामान्य पहुँच', en: 'General access', new: 'सामान्य पहुँच', mai: 'सामान्य पहुँच', hi: 'सामान्य एक्सेस' },
  'Create your safety profile': { ne: 'आफ्नो सुरक्षा प्रोफाइल बनाउनुहोस्', en: 'Create your safety profile', new: 'छिंया सुरक्षा प्रोफाइल यानादिसँ', mai: 'अपन सुरक्षा प्रोफाइल बनाउ', hi: 'अपनी सुरक्षा प्रोफ़ाइल बनाएं' },
  'Your details stay saved on this device for faster access next time.': { ne: 'अर्को पटक छिटो पहुँचका लागि तपाईंका विवरणहरू यस उपकरणमा सुरक्षित रहनेछन्।', en: 'Your details stay saved on this device for faster access next time.', new: 'मेगु खँय् छिटो पहुँचया लागि छिंया विवरण थ्व उपकरणय् सुरक्षित दु।', mai: 'अगिला बेर जल्दी पहुँच लेल अहाँक विवरण एहि उपकरणमे सुरक्षित रहत।', hi: 'अगली बार तेज़ पहुंच के लिए आपकी जानकारी इस डिवाइस पर सुरक्षित रहेगी।' },
  'Full name': { ne: 'पूरा नाम', en: 'Full name', new: 'पूरा नां', mai: 'पूरा नाम', hi: 'पूरा नाम' },
  'Your name': { ne: 'तपाईंको नाम', en: 'Your name', new: 'छिंया नां', mai: 'अहाँक नाम', hi: 'आपका नाम' },
  'Phone number': { ne: 'फोन नम्बर', en: 'Phone number', new: 'फोन नम्बर', mai: 'फोन नम्बर', hi: 'फ़ोन नंबर' },
  'District or city': { ne: 'जिल्ला वा शहर', en: 'District or city', new: 'जिल्ला वा सहर', mai: 'जिला वा शहर', hi: 'जिला या शहर' },
  'Enter safety dashboard': { ne: 'सुरक्षा ड्यासबोर्डमा प्रवेश गर्नुहोस्', en: 'Enter safety dashboard', new: 'सुरक्षा ड्यासबोर्डय् प्रवेश यानादिसँ', mai: 'सुरक्षा डैशबोर्डमे प्रवेश करू', hi: 'सुरक्षा डैशबोर्ड में प्रवेश करें' },
  'Restricted access': { ne: 'सीमित पहुँच', en: 'Restricted access', new: 'सीमित पहुँच', mai: 'सीमित पहुँच', hi: 'सीमित एक्सेस' },
  'Administrator sign in': { ne: 'प्रशासक लगइन', en: 'Administrator sign in', new: 'प्रशासक लगइन', mai: 'प्रशासक साइन इन', hi: 'प्रशासक साइन इन' },
  'Access the complete emergency command workspace.': { ne: 'सम्पूर्ण आपतकालीन कमाण्ड कार्यक्षेत्रमा पहुँच प्राप्त गर्नुहोस्।', en: 'Access the complete emergency command workspace.', new: 'सम्पूर्ण आपतकालीन कमाण्ड कार्यक्षेत्रय् पहुँच बियादिसँ।', mai: 'पूर्ण आपातकालीन कमांड कार्यक्षेत्रमे पहुँच करू।', hi: 'पूरे आपातकालीन कमांड कार्यक्षेत्र तक पहुंचें।' },
  'Username': { ne: 'प्रयोगकर्ता नाम', en: 'Username', new: 'प्रयोगकर्ता नां', mai: 'उपयोगकर्ता नाम', hi: 'उपयोगकर्ता नाम' },
  'Administrator username': { ne: 'प्रशासक प्रयोगकर्ता नाम', en: 'Administrator username', new: 'प्रशासक प्रयोगकर्ता नां', mai: 'प्रशासक उपयोगकर्ता नाम', hi: 'प्रशासक उपयोगकर्ता नाम' },
  'Password': { ne: 'पासवर्ड', en: 'Password', new: 'पासवर्ड', mai: 'पासवर्ड', hi: 'पासवर्ड' },
  'Administrator password': { ne: 'प्रशासक पासवर्ड', en: 'Administrator password', new: 'प्रशासक पासवर्ड', mai: 'प्रशासक पासवर्ड', hi: 'प्रशासक पासवर्ड' },
  'Open command workspace': { ne: 'कमाण्ड कार्यक्षेत्र खोल्नुहोस्', en: 'Open command workspace', new: 'कमाण्ड कार्यक्षेत्र खोलादिसँ', mai: 'कमांड कार्यक्षेत्र खोलू', hi: 'कमांड कार्यक्षेत्र खोलें' },
  'Authorized administrators see all operational modules.': { ne: 'अधिकृत प्रशासकहरूले सबै सञ्चालन मोड्युलहरू देख्न सक्छन्।', en: 'Authorized administrators see all operational modules.', new: 'अधिकृत प्रशासकय् दक्को सञ्चालन मोड्युल क्यनेगु खः।', mai: 'अधिकृत प्रशासक सभ परिचालन मॉड्युल देख सकैत छथि।', hi: 'अधिकृत प्रशासक सभी परिचालन मॉड्यूल देख सकते हैं।' },
  'Please complete your name, phone number, and district.': { ne: 'कृपया आफ्नो नाम, फोन नम्बर र जिल्ला पूरा गर्नुहोस्।', en: 'Please complete your name, phone number, and district.', new: 'कृपया छिंया नां, फोन नम्बर व जिल्ला पूरा यानादिसँ।', mai: 'कृपया अपन नाम, फोन नम्बर आ जिला पूरा करू।', hi: 'कृपया अपना नाम, फ़ोन नंबर और जिला भरें।' },
  'Administrator credentials are incorrect.': { ne: 'प्रशासकको प्रमाणहरू गलत छन्।', en: 'Administrator credentials are incorrect.', new: 'प्रशासकया प्रमाण गलत दु।', mai: 'प्रशासकक प्रमाण गलत अछि।', hi: 'प्रशासक के क्रेडेंशियल गलत हैं।' },
  // Weather conditions and alert labels
  'Clear sky': { ne: 'खुला आकाश', en: 'Clear sky', new: 'स्वच्छ आकाश', mai: 'साफ आकाश', hi: 'साफ़ आसमान' },
  'Mainly clear': { ne: 'मुख्यतः सफा', en: 'Mainly clear', new: 'मूख्यतः स्वच्छ', mai: 'मुख्य रूपसँ साफ', hi: 'मुख्यतः साफ़' },
  'Partly cloudy': { ne: 'आंशिक बदली', en: 'Partly cloudy', new: 'केही बदली', mai: 'आंशिक बादल', hi: 'आंशिक बादल' },
  'Overcast': { ne: 'बादल लागेको', en: 'Overcast', new: 'बादलय् ढाकल', mai: 'बादलसँ ढकल', hi: 'बादल छाए हुए' },
  'Fog': { ne: 'कुहिरो', en: 'Fog', new: 'कुहिरो', mai: 'कुहासा', hi: 'कोहरा' },
  'Drizzle': { ne: 'सिमसिमे पानी', en: 'Drizzle', new: 'सिमसिमे वा', mai: 'फुहार', hi: 'फुहार' },
  'Rain': { ne: 'वर्षा', en: 'Rain', new: 'वा', mai: 'वर्षा', hi: 'बारिश' },
  'Showers': { ne: 'छिटपुट वर्षा', en: 'Showers', new: 'भचाभचा वा', mai: 'छिटपुट वर्षा', hi: 'बौछार' },
  'Thunderstorm': { ne: 'मेघगर्जनसहितको वर्षा', en: 'Thunderstorm', new: 'गर्जन सहित वा', mai: 'गरजनासहित वर्षा', hi: 'गरज के साथ तूफ़ान' },
  'Snow': { ne: 'हिमपात', en: 'Snow', new: 'हिमपात', mai: 'हिमपात', hi: 'बर्फ़बारी' },
  'Heavy Rain / Downpour': { ne: 'भारी वर्षा / मुसलधारे पानी', en: 'Heavy Rain / Downpour', new: 'तःधंगु वा / मुसलधारे वा', mai: 'भारी वर्षा / मूसलाधार पानी', hi: 'भारी बारिश / मूसलाधार वर्षा' },
  'Moderate Rain': { ne: 'मध्यम वर्षा', en: 'Moderate Rain', new: 'दथुइगु वा', mai: 'मध्यम वर्षा', hi: 'मध्यम बारिश' },
  'Light Rain': { ne: 'हल्का वर्षा', en: 'Light Rain', new: 'हलकु वा', mai: 'हल्का वर्षा', hi: 'हल्की बारिश' },
  'Fog / Mist': { ne: 'कुहिरो / तुवाँलो', en: 'Fog / Mist', new: 'कुहिरो / तुवाँलो', mai: 'कुहासा / कुहिरा', hi: 'कोहरा / धुंध' },
  'Dry & Clear': { ne: 'सुख्खा र सफा', en: 'Dry & Clear', new: 'गंगु व स्वच्छ', mai: 'सुख्खा आ साफ', hi: 'शुष्क और साफ़' },
  'Overcast / Chance of Rain': { ne: 'बादल लागेको / वर्षाको सम्भावना', en: 'Overcast / Chance of Rain', new: 'बादलय् ढाकल / वा वइगु सम्भावना', mai: 'बादल / वर्षाक सम्भावना', hi: 'बादल छाए / बारिश की संभावना' },
  'Normal Weather': { ne: 'सामान्य मौसम', en: 'Normal Weather', new: 'सामान्य मौसम', mai: 'सामान्य मौसम', hi: 'सामान्य मौसम' },
  'Normal / Safe Conditions': { ne: 'सामान्य / सुरक्षित अवस्था', en: 'Normal / Safe Conditions', new: 'सामान्य / सुरक्षित अवस्था', mai: 'सामान्य / सुरक्षित स्थिति', hi: 'सामान्य / सुरक्षित स्थिति' },
  'Alerts': { ne: 'सतर्कताहरू', en: 'Alerts', new: 'सतर्कतात', mai: 'सतर्कतासभ', hi: 'अलर्ट' },
  'Alert': { ne: 'सतर्कता', en: 'Alert', new: 'सतर्कता', mai: 'सतर्कता', hi: 'अलर्ट' },
  'Dashboard': { ne: 'ड्यासबोर्ड', en: 'Dashboard', new: 'ड्यासबोर्ड', mai: 'ड्यासबोर्ड', hi: 'डैशबोर्ड' },
  'Situation Overview for': { ne: 'स्थितिको अवलोकन', en: 'Situation Overview for', new: 'स्थितिया अवलोकन', mai: 'स्थितिक अवलोकन', hi: 'स्थिति का अवलोकन' },
  'REAL TELEMETRY': { ne: 'प्रत्यक्ष तथ्याङ्क', en: 'REAL TELEMETRY', new: 'प्रत्यक्ष तथ्यांक', mai: 'प्रत्यक्ष डेटा', hi: 'लाइव डेटा' },
  'Live Telemetry Feed': { ne: 'प्रत्यक्ष तथ्याङ्क प्रवाह', en: 'Live Telemetry Feed', new: 'प्रत्यक्ष तथ्यांक प्रवाह', mai: 'प्रत्यक्ष डेटा प्रवाह', hi: 'लाइव डेटा प्रवाह' },
  'Telemetry': { ne: 'तथ्याङ्क', en: 'Telemetry', new: 'तथ्यांक', mai: 'डेटा', hi: 'डेटा' },
  'DoR Live': { ne: 'DoR प्रत्यक्ष', en: 'DoR Live', new: 'DoR प्रत्यक्ष', mai: 'DoR लाइव', hi: 'DoR लाइव' },
  'Road Status': { ne: 'सडकको स्थिति', en: 'Road Status', new: 'लँपुया अवस्था', mai: 'सड़कक स्थिति', hi: 'सड़क की स्थिति' },
  'Latest Alerts': { ne: 'नवीनतम सतर्कताहरू', en: 'Latest Alerts', new: 'न्हूगु सतर्कतात', mai: 'नवीनतम सतर्कता', hi: 'नवीनतम अलर्ट' },
  'No recent news.': { ne: 'हालैका कुनै समाचार छैनन्।', en: 'No recent news.', new: 'न्हूगु बुखँ मदु।', mai: 'हालमे कोनो समाचार नहि।', hi: 'हाल की कोई खबर नहीं।' },
  'View all alerts': { ne: 'सबै सतर्कता हेर्नुहोस्', en: 'View all alerts', new: 'दक्को सतर्कता स्वयादिसँ', mai: 'सब सतर्कता देखू', hi: 'सभी अलर्ट देखें' },
  'Synchronizing live BIPAD alerts...': { ne: 'प्रत्यक्ष BIPAD सतर्कताहरू समक्रमण हुँदैछ...', en: 'Synchronizing live BIPAD alerts...', new: 'प्रत्यक्ष BIPAD सतर्कता समक्रमण जुयाच्वंगु...', mai: 'प्रत्यक्ष BIPAD सतर्कता सिंक भ रहल अछि...', hi: 'लाइव BIPAD अलर्ट सिंक हो रहे हैं...' },
  'Missing Persons': { ne: 'हराएका व्यक्तिहरू', en: 'Missing Persons', new: 'तंगु मनूत', mai: 'हेराएल व्यक्ति', hi: 'लापता व्यक्ति' },
  'Active Reports': { ne: 'सक्रिय रिपोर्टहरू', en: 'Active Reports', new: 'सक्रिय विवरणत', mai: 'सक्रिय रिपोर्ट', hi: 'सक्रिय रिपोर्ट' },
  'Found/Safe': { ne: 'भेटिएका / सुरक्षित', en: 'Found/Safe', new: 'लुयावःगु / सुरक्षित', mai: 'भेटल / सुरक्षित', hi: 'मिले / सुरक्षित' },
  'Access Registry': { ne: 'लगत खोल्नुहोस्', en: 'Access Registry', new: 'लगत स्वयादिसँ', mai: 'पंजी खोलू', hi: 'रजिस्टर खोलें' },
  'Nearby Hospitals': { ne: 'नजिकका अस्पतालहरू', en: 'Nearby Hospitals', new: 'नजिकया अस्पतालत', mai: 'नजदीकी अस्पताल', hi: 'नज़दीकी अस्पताल' },
  'Nepal MoHP Free Health Portal': { ne: 'नेपाल स्वास्थ्य मन्त्रालय निःशुल्क स्वास्थ्य पोर्टल', en: 'Nepal MoHP Free Health Portal', new: 'नेपाल स्वास्थ्य पोर्टल', mai: 'नेपाल स्वास्थ्य मन्त्रालय निःशुल्क स्वास्थ्य पोर्टल', hi: 'नेपाल स्वास्थ्य मंत्रालय निःशुल्क स्वास्थ्य पोर्टल' },
  'REAL DATA': { ne: 'वास्तविक तथ्याङ्क', en: 'REAL DATA', new: 'वास्तविक तथ्यांक', mai: 'वास्तविक डेटा', hi: 'वास्तविक डेटा' },
  'CACHED': { ne: 'सङ्ग्रहित', en: 'CACHED', new: 'संग्रहित', mai: 'संग्रहित', hi: 'कैश्ड' },
  'beds available': { ne: 'बेड उपलब्ध', en: 'beds available', new: 'बेड उपलब्ध', mai: 'बेड उपलब्ध', hi: 'बेड उपलब्ध' },
  'occupied': { ne: 'भरिएको', en: 'occupied', new: 'भरल', mai: 'भरल', hi: 'भरे हुए' },
  'Coords unverified': { ne: 'स्थान पुष्टि भएको छैन', en: 'Coords unverified', new: 'थाय् पुष्टि मदु', mai: 'स्थान सत्यापित नहि', hi: 'स्थान सत्यापित नहीं' },
  'Loading hospital capacity data...': { ne: 'अस्पताल क्षमता तथ्याङ्क लोड हुँदैछ...', en: 'Loading hospital capacity data...', new: 'अस्पताल क्षमता तथ्यांक लोड जुयाच्वंगु...', mai: 'अस्पताल क्षमता डेटा लोड भ रहल अछि...', hi: 'अस्पताल क्षमता डेटा लोड हो रहा है...' },
  'Hospital Missing-Person Matching Network': { ne: 'अस्पताल हराएका व्यक्ति मिलान नेटवर्क', en: 'Hospital Missing-Person Matching Network', new: 'अस्पताल तंगु मनू मिलान नेटवर्क', mai: 'अस्पताल हेराएल व्यक्ति मिलान नेटवर्क', hi: 'अस्पताल लापता व्यक्ति मिलान नेटवर्क' },
  'SIMULATED DATA': { ne: 'सिमुलेट गरिएको तथ्याङ्क', en: 'SIMULATED DATA', new: 'सिमुलेट यानातःगु तथ्यांक', mai: 'सिमुलेट डेटा', hi: 'सिम्युलेटेड डेटा' },
  'Secure trauma clinical workflow enabling authorized Nepal hospitals to correlate unidentified disaster victims against national missing-person reports via AI multi-signal vector matching.': { ne: 'अधिकृत नेपाली अस्पतालहरूलाई एआई बहु-सङ्केत मिलानमार्फत अज्ञात विपद् पीडितलाई राष्ट्रिय हराएका व्यक्ति रिपोर्टसँग मिलान गर्न सक्षम बनाउने सुरक्षित ट्रमा क्लिनिकल कार्यप्रवाह।', en: 'Secure trauma clinical workflow enabling authorized Nepal hospitals to correlate unidentified disaster victims against national missing-person reports via AI multi-signal vector matching.', new: 'अधिकृत अस्पतालतय् एआई मिलानय् अज्ञात विपद् पीडित व राष्ट्रिय लगत मिलायेगु सुरक्षित कार्यप्रवाह।', mai: 'अधिकृत नेपाली अस्पतालकेँ एआई मिलानसँ अज्ञात विपद् पीड़ितकेँ राष्ट्रिय हेराएल रिपोर्टसँ मिलाबयवाला सुरक्षित ट्रमा कार्यप्रवाह।', hi: 'अधिकृत नेपाली अस्पतालों को एआई बहु-संकेत मिलान से अज्ञात आपदा पीड़ितों को राष्ट्रीय लापता रिपोर्ट से मिलाने वाला सुरक्षित ट्रॉमा कार्यप्रवाह।' },
  'Authorized Access Level:': { ne: 'अधिकृत पहुँच स्तर:', en: 'Authorized Access Level:', new: 'अधिकृत पहुँच स्तर:', mai: 'अधिकृत पहुँच स्तर:', hi: 'अधिकृत पहुँच स्तर:' },
  'Authorized Hospital Staff (Trauma Desk)': { ne: 'अधिकृत अस्पताल कर्मचारी (ट्रमा डेस्क)', en: 'Authorized Hospital Staff (Trauma Desk)', new: 'अधिकृत अस्पताल कर्मचारी (ट्रमा डेस्क)', mai: 'अधिकृत अस्पताल कर्मचारी (ट्रमा डेस्क)', hi: 'अधिकृत अस्पताल कर्मचारी (ट्रॉमा डेस्क)' },
  'Disaster Verification Authority (Nepal Police / NDRRMA)': { ne: 'विपद् प्रमाणीकरण प्राधिकरण (नेपाल प्रहरी / NDRRMA)', en: 'Disaster Verification Authority (Nepal Police / NDRRMA)', new: 'विपद् प्रमाणीकरण प्राधिकरण (नेपाल प्रहरी / NDRRMA)', mai: 'विपद् सत्यापन प्राधिकरण (नेपाल प्रहरी / NDRRMA)', hi: 'आपदा सत्यापन प्राधिकरण (नेपाल पुलिस / NDRRMA)' },
  'Public Overview (Restricted Redaction)': { ne: 'सार्वजनिक अवलोकन (सीमित विवरण)', en: 'Public Overview (Restricted Redaction)', new: 'सार्वजनिक अवलोकन (सीमित विवरण)', mai: 'सार्वजनिक अवलोकन (सीमित विवरण)', hi: 'सार्वजनिक अवलोकन (सीमित विवरण)' },
  'Reset Demo': { ne: 'डेमो रिसेट गर्नुहोस्', en: 'Reset Demo', new: 'डेमो रिसेट यानादिसँ', mai: 'डेमो रिसेट करू', hi: 'डेमो रीसेट करें' },
  'Privacy Protected:': { ne: 'गोपनीयता सुरक्षित:', en: 'Privacy Protected:', new: 'गोपनीयता सुरक्षित:', mai: 'गोपनीयता सुरक्षित:', hi: 'गोपनीयता सुरक्षित:' },
  'Clinical intake records are restricted to verified medical desks. Unnecessary medical diagnostics are redacted from correlation algorithms.': { ne: 'क्लिनिकल भर्ना अभिलेखहरू प्रमाणित चिकित्सा डेस्कमा मात्र सीमित छन्। अनावश्यक चिकित्सा निदानहरू मिलान एल्गोरिदमबाट हटाइन्छन्।', en: 'Clinical intake records are restricted to verified medical desks. Unnecessary medical diagnostics are redacted from correlation algorithms.', new: 'क्लिनिकल अभिलेखत प्रमाणित चिकित्सा डेस्कय् जक सीमित दु। अनावश्यक निदान मिलान प्रणालीपाखें लिकायेगु दु।', mai: 'क्लिनिकल अभिलेख प्रमाणित चिकित्सा डेस्कमे सीमित अछि। अनावश्यक निदान मिलान प्रणालीसँ हटाओल जाइत अछि।', hi: 'क्लिनिकल प्रवेश रिकॉर्ड केवल सत्यापित चिकित्सा डेस्क तक सीमित हैं। अनावश्यक चिकित्सीय निदान मिलान एल्गोरिदम से हटा दिए जाते हैं।' },
  'Patients Submitted': { ne: 'पेश गरिएका बिरामी', en: 'Patients Submitted', new: 'दाखिला यानातःगु ल्वगीत', mai: 'जमा कएल बिरामी', hi: 'जमा किए गए मरीज' },
  'unidentified victims': { ne: 'पहिचान नभएका पीडित', en: 'unidentified victims', new: 'म्हसिका मदूगु पीडित', mai: 'पहचान नहि भेल पीड़ित', hi: 'अज्ञात पीड़ित' },
  'AI Matches Flagged': { ne: 'एआईले चिन्ह लगाएका मिलान', en: 'AI Matches Flagged', new: 'एआई मिलान चिन्ह लगायल', mai: 'एआई मिलान चिह्नित', hi: 'एआई द्वारा चिह्नित मिलान' },
  'similarity candidates': { ne: 'समानता भएका सम्भावित मिलान', en: 'similarity candidates', new: 'समानता सम्भावित मिलान', mai: 'समानता सम्भावित मिलान', hi: 'समानता वाले संभावित मिलान' },
  'Awaiting Verification': { ne: 'प्रमाणीकरणको प्रतीक्षामा', en: 'Awaiting Verification', new: 'प्रमाणीकरणया प्रतीक्षाय्', mai: 'सत्यापनक प्रतीक्षा', hi: 'सत्यापन की प्रतीक्षा' },
  'human review': { ne: 'मानवीय समीक्षा', en: 'human review', new: 'मनूया समीक्षा', mai: 'मानवीय समीक्षा', hi: 'मानवीय समीक्षा' },
  'Confirmed Matches': { ne: 'पुष्टि भएका मिलान', en: 'Confirmed Matches', new: 'पुष्टि जूगु मिलान', mai: 'पुष्टि भेल मिलान', hi: 'पुष्ट मिलान' },
  'reunited / treated': { ne: 'पुनर्मिलन / उपचार', en: 'reunited / treated', new: 'पुनर्मिलान / उपचार', mai: 'पुनर्मिलन / उपचार', hi: 'पुनर्मिलन / उपचार' },
  'Human-in-the-Loop Operational Guardrail:': { ne: 'मानवीय समीक्षा सहित सञ्चालन सुरक्षा:', en: 'Human-in-the-Loop Operational Guardrail:', new: 'मनूया समीक्षा सञ्चालन सुरक्षा:', mai: 'मानवीय समीक्षा सञ्चालन सुरक्षा:', hi: 'मानवीय समीक्षा संचालन सुरक्षा:' },
  'The SAHAYAK AI system operates exclusively as an advisory decision-support instrument. The matching score indicates multi-variable feature correlation and never automatically declares identity. Verification and case resolution strictly require authorized clinician or authority confirmation.': { ne: 'SAHAYAK एआई प्रणाली सल्लाह दिने निर्णय-सहायता उपकरणका रूपमा मात्र काम गर्छ। मिलान स्कोरले बहु-चर विशेषता सम्बन्ध देखाउँछ र स्वचालित रूपमा पहिचान घोषणा गर्दैन। प्रमाणीकरण र केस समाधानका लागि अधिकृत चिकित्सक वा प्राधिकरणको पुष्टि अनिवार्य हुन्छ।', en: 'The SAHAYAK AI system operates exclusively as an advisory decision-support instrument. The matching score indicates multi-variable feature correlation and never automatically declares identity. Verification and case resolution strictly require authorized clinician or authority confirmation.', new: 'SAHAYAK एआई प्रणाली सल्लाहया निर्णय-सहायता उपकरण जक दु। मिलान स्कोरय् पहिचान स्वचालित यानातःगु मदु। प्रमाणीकरण अधिकृत चिकित्सकया पुष्टिसँ जक जुयाः।', mai: 'SAHAYAK एआई प्रणाली केवल सलाह देबयवाला निर्णय-सहायता उपकरण अछि। मिलान स्कोर बहु-विशेषता सम्बन्ध देखबैत अछि, पहचान अपने नहि घोषित करैत अछि। सत्यापन आ केस समाधान लेल अधिकृत चिकित्सकक पुष्टि जरूरी अछि।', hi: 'SAHAYAK एआई प्रणाली केवल सलाहकारी निर्णय-सहायता उपकरण है। मिलान स्कोर बहु-चर विशेषताओं का संबंध दिखाता है और स्वतः पहचान घोषित नहीं करता। सत्यापन और केस समाधान के लिए अधिकृत चिकित्सक या प्राधिकरण की पुष्टि आवश्यक है।' },
  'AI Match Center': { ne: 'एआई मिलान केन्द्र', en: 'AI Match Center', new: 'एआई मिलान केन्द्र', mai: 'एआई मिलान केन्द्र', hi: 'एआई मिलान केंद्र' },
  'Submit Unidentified Patients': { ne: 'पहिचान नभएका बिरामी पेश गर्नुहोस्', en: 'Submit Unidentified Patients', new: 'म्हसिका मदूगु ल्वगीत दाखिला', mai: 'पहचान नहि भेल बिरामी जमा करू', hi: 'अज्ञात मरीज जमा करें' },
  'Patient Intake Registry': { ne: 'बिरामी भर्ना लगत', en: 'Patient Intake Registry', new: 'ल्वगी दाखिला लगत', mai: 'बिरामी भर्ना पंजी', hi: 'मरीज प्रवेश रजिस्टर' },
  'Audit Trail & Governance': { ne: 'अडिट विवरण र शासन', en: 'Audit Trail & Governance', new: 'अडिट विवरण व शासन', mai: 'ऑडिट विवरण आ शासन', hi: 'ऑडिट ट्रेल और शासन' },
  'Filter by patient MRN, missing person name, hospital, or recovery location...': { ne: 'बिरामी MRN, हराएका व्यक्तिको नाम, अस्पताल वा उद्धार स्थानबाट खोज्नुहोस्...', en: 'Filter by patient MRN, missing person name, hospital, or recovery location...', new: 'ल्वगी MRN, तंगु मनूया नां, अस्पताल वा उद्धार थाय् मालादिसँ...', mai: 'बिरामी MRN, हेराएल व्यक्तिक नाम, अस्पताल वा उद्धार स्थानसँ खोजू...', hi: 'मरीज MRN, लापता व्यक्ति का नाम, अस्पताल या बरामदगी स्थान से खोजें...' },
  'Filter:': { ne: 'फिल्टर:', en: 'Filter:', new: 'फिल्टर:', mai: 'फिल्टर:', hi: 'फ़िल्टर:' },
  'All Matches': { ne: 'सबै मिलान', en: 'All Matches', new: 'दक्को मिलान', mai: 'सब मिलान', hi: 'सभी मिलान' },
  'High Confidence (75%+)': { ne: 'उच्च विश्वास (७५%+)', en: 'High Confidence (75%+)', new: 'उच्च विश्वास (७५%+)', mai: 'उच्च विश्वास (७५%+)', hi: 'उच्च विश्वसनीयता (७५%+)' },
  'Pending Review': { ne: 'समीक्षा बाँकी', en: 'Pending Review', new: 'समीक्षा जुइ ल्यं', mai: 'समीक्षा बाँकी', hi: 'समीक्षा लंबित' },
  'Confirmed': { ne: 'पुष्टि भएको', en: 'Confirmed', new: 'पुष्टि जूगु', mai: 'पुष्टि भेल', hi: 'पुष्ट' },
  'Hospital Missing-Person Matching': { ne: 'अस्पताल हराएका व्यक्ति मिलान', en: 'Hospital Missing-Person Matching', new: 'अस्पताल तंगु मनू मिलान', mai: 'अस्पताल हेराएल व्यक्ति मिलान', hi: 'अस्पताल लापता व्यक्ति मिलान' },
  'Authorized Trauma Hospital Network • Autonomous Multimodal Identification': { ne: 'अधिकृत ट्रमा अस्पताल नेटवर्क • स्वचालित बहु-माध्यम पहिचान', en: 'Authorized Trauma Hospital Network • Autonomous Multimodal Identification', new: 'अधिकृत ट्रमा अस्पताल नेटवर्क • स्वचालित पहिचान', mai: 'अधिकृत ट्रमा अस्पताल नेटवर्क • स्वचालित बहु-माध्यम पहिचान', hi: 'अधिकृत ट्रॉमा अस्पताल नेटवर्क • स्वचालित बहु-माध्यम पहचान' },
  'unidentified': { ne: 'पहिचान नभएका', en: 'unidentified', new: 'म्हसिका मदूगु', mai: 'पहचान नहि भेल', hi: 'अज्ञात' },
  'candidates': { ne: 'सम्भावित मिलान', en: 'candidates', new: 'सम्भावित मिलान', mai: 'सम्भावित मिलान', hi: 'संभावित मिलान' },
  'Matches Confirmed': { ne: 'पुष्टि भएका मिलान', en: 'Matches Confirmed', new: 'पुष्टि जूगु मिलान', mai: 'पुष्टि भेल मिलान', hi: 'पुष्ट मिलान' },
  'verified safe': { ne: 'सुरक्षित पुष्टि', en: 'verified safe', new: 'सुरक्षित पुष्टि', mai: 'सुरक्षित पुष्टि', hi: 'सुरक्षित पुष्टि' },
  'High-Confidence AI Candidate(s) Require Medical Verification': { ne: 'उच्च-विश्वास भएका एआई सम्भावित मिलानलाई चिकित्सा प्रमाणीकरण आवश्यक', en: 'High-Confidence AI Candidate(s) Require Medical Verification', new: 'उच्च-विश्वास एआई मिलानया चिकित्सा प्रमाणीकरण माःगु', mai: 'उच्च-विश्वास एआई सम्भावित मिलानक चिकित्सा सत्यापन आवश्यक', hi: 'उच्च-विश्वसनीय एआई संभावित मिलान के लिए चिकित्सा सत्यापन आवश्यक' },
  'AI decision support engine • Human verification required for all closures': { ne: 'एआई निर्णय सहायता प्रणाली • सबै निष्कर्षका लागि मानवीय प्रमाणीकरण आवश्यक', en: 'AI decision support engine • Human verification required for all closures', new: 'एआई निर्णय सहायता • दक्को निष्कर्षया मनूया प्रमाणीकरण माःगु', mai: 'एआई निर्णय सहायता प्रणाली • सब निष्कर्ष लेल मानवीय सत्यापन आवश्यक', hi: 'एआई निर्णय सहायता प्रणाली • सभी निष्कर्षों के लिए मानवीय सत्यापन आवश्यक' },
  'Open Hospital Matching Portal': { ne: 'अस्पताल मिलान पोर्टल खोल्नुहोस्', en: 'Open Hospital Matching Portal', new: 'अस्पताल मिलान पोर्टल खोलादिसँ', mai: 'अस्पताल मिलान पोर्टल खोलू', hi: 'अस्पताल मिलान पोर्टल खोलें' },
  'Match': { ne: 'मिलान', en: 'Match', new: 'मिलान', mai: 'मिलान', hi: 'मिलान' },
  'MRN': { ne: 'MRN', en: 'MRN', new: 'MRN', mai: 'MRN', hi: 'MRN' },
  'Missing': { ne: 'हराएका', en: 'Missing', new: 'तंगु', mai: 'हेराएल', hi: 'लापता' },
  'Found': { ne: 'भेटिएको स्थान', en: 'Found', new: 'खंगु', mai: 'भेटल', hi: 'मिला' },
  'Review Side-by-Side Dossier': { ne: 'छेउछाउ विवरण समीक्षा गर्नुहोस्', en: 'Review Side-by-Side Dossier', new: 'छेउछाउ विवरण समीक्षा यानादिसँ', mai: 'छेउ-छेउ विवरण समीक्षा करू', hi: 'साथ-साथ विवरण समीक्षा करें' },
  'Supporting Match Reasons:': { ne: 'मिलानका समर्थन कारणहरू:', en: 'Supporting Match Reasons:', new: 'मिलानया समर्थन कारणत:', mai: 'मिलानक समर्थन कारण:', hi: 'मिलान के समर्थन कारण:' },
  'Contradictions / Verification Context:': { ne: 'विरोधाभास / प्रमाणीकरण सन्दर्भ:', en: 'Contradictions / Verification Context:', new: 'विरोधाभास / प्रमाणीकरण सन्दर्भ:', mai: 'विरोधाभास / सत्यापन सन्दर्भ:', hi: 'विरोधाभास / सत्यापन संदर्भ:' },
  'Reviewed by:': { ne: 'समीक्षा गर्ने:', en: 'Reviewed by:', new: 'समीक्षा यानिगु:', mai: 'समीक्षा कएलक:', hi: 'समीक्षा करने वाला:' },
  'on': { ne: 'मा', en: 'on', new: 'य्', mai: 'पर', hi: 'को' },
  'No contradictions identified. Awaiting authorized clinical sign-off.': { ne: 'कुनै विरोधाभास पहिचान भएन। अधिकृत क्लिनिकल स्वीकृतिको प्रतीक्षा।', en: 'No contradictions identified. Awaiting authorized clinical sign-off.', new: 'छुं विरोधाभास मदु। अधिकृत क्लिनिकल स्वीकृतिया प्रतीक्षा।', mai: 'कोनो विरोधाभास नहि भेटल। अधिकृत क्लिनिकल स्वीकृतिक प्रतीक्षा।', hi: 'कोई विरोधाभास नहीं मिला। अधिकृत क्लिनिकल स्वीकृति की प्रतीक्षा।' },
  'Side-by-Side Match Verification Dossier': { ne: 'छेउछाउ मिलान प्रमाणीकरण विवरण', en: 'Side-by-Side Match Verification Dossier', new: 'छेउछाउ मिलान प्रमाणीकरण विवरण', mai: 'छेउ-छेउ मिलान सत्यापन विवरण', hi: 'साथ-साथ मिलान सत्यापन विवरण' },
  'Hospital MRN:': { ne: 'अस्पताल MRN:', en: 'Hospital MRN:', new: 'अस्पताल MRN:', mai: 'अस्पताल MRN:', hi: 'अस्पताल MRN:' },
  'Missing Case:': { ne: 'हराएको केस:', en: 'Missing Case:', new: 'तंगु केस:', mai: 'हेराएल केस:', hi: 'लापता केस:' },
  'MANDATORY HUMAN-IN-THE-LOOP ETHICAL STANDARD:': { ne: 'अनिवार्य मानवीय समीक्षा नैतिक मापदण्ड:', en: 'MANDATORY HUMAN-IN-THE-LOOP ETHICAL STANDARD:', new: 'अनिवार्य मनूया समीक्षा नैतिक मापदण्ड:', mai: 'अनिवार्य मानवीय समीक्षा नैतिक मानक:', hi: 'अनिवार्य मानवीय समीक्षा नैतिक मानक:' },
  'The AI engine does NOT declare or confirm legal identity. The AI matching score is an indicator of multi-signal feature similarity, not proof. Final verification must always be performed and signed off by authorized hospital staff, designated law enforcement, or verified family liaisons.': { ne: 'एआई प्रणालीले कानुनी पहिचान घोषणा वा पुष्टि गर्दैन। एआई मिलान स्कोर बहु-सङ्केत विशेषता समानताको सूचक मात्र हो, प्रमाण होइन। अन्तिम प्रमाणीकरण अधिकृत अस्पताल कर्मचारी, तोकिएको कानून कार्यान्वयन निकाय वा प्रमाणित पारिवारिक प्रतिनिधिले गर्नुपर्छ।', en: 'The AI engine does NOT declare or confirm legal identity. The AI matching score is an indicator of multi-signal feature similarity, not proof. Final verification must always be performed and signed off by authorized hospital staff, designated law enforcement, or verified family liaisons.', new: 'एआई प्रणाली कानुनी पहिचान घोषणा वा पुष्टि यायेगु मदु। अन्तिम प्रमाणीकरण अधिकृत अस्पताल कर्मचारी वा सम्बन्धित प्राधिकरणया पुष्टिसँ जुयाः।', mai: 'एआई प्रणाली कानूनी पहचान घोषित वा पुष्टि नहि करैत अछि। अन्तिम सत्यापन अधिकृत अस्पताल कर्मचारी वा सम्बन्धित प्राधिकरणेँ करबाक अछि।', hi: 'एआई प्रणाली कानूनी पहचान घोषित या पुष्ट नहीं करती। अंतिम सत्यापन अधिकृत अस्पताल कर्मचारी या संबंधित प्राधिकरण द्वारा किया जाना चाहिए।' },
  'AI Match Indicator': { ne: 'एआई मिलान सूचक', en: 'AI Match Indicator', new: 'एआई मिलान सूचक', mai: 'एआई मिलान सूचक', hi: 'एआई मिलान संकेतक' },
  'Autonomous Multimodal Match Assessment': { ne: 'स्वचालित बहु-माध्यम मिलान मूल्याङ्कन', en: 'Autonomous Multimodal Match Assessment', new: 'स्वचालित बहु-माध्यम मिलान मूल्याङ्कन', mai: 'स्वचालित बहु-माध्यम मिलान मूल्यांकन', hi: 'स्वचालित बहु-माध्यम मिलान मूल्यांकन' },
  'Engine evaluated physical tokens, age bracket compatibility, clothing remnants, and river drainage corridor flow from': { ne: 'प्रणालीले शारीरिक संकेत, उमेर समूह, कपडाका अवशेष र नदी निकास मार्गको बहाव मूल्याङ्कन गर्‍यो', en: 'Engine evaluated physical tokens, age bracket compatibility, clothing remnants, and river drainage corridor flow from', new: 'प्रणालीय् शारीरिक संकेत, उमेर, वसःया अवशेष व नदी बहाव मूल्याङ्कन याःगु', mai: 'प्रणाली शारीरिक संकेत, उमेर, कपड़ा अवशेष आ नदी बहाव मूल्यांकन कएलक', hi: 'प्रणाली ने शारीरिक संकेत, आयु, कपड़ों के अवशेष और नदी प्रवाह का मूल्यांकन किया' },
  'to': { ne: 'देखि', en: 'to', new: 'पाखें', mai: 'सँ', hi: 'से' },
  'Visual / Attire': { ne: 'दृश्य / पहिरन', en: 'Visual / Attire', new: 'दृश्य / वसः', mai: 'दृश्य / पोशाक', hi: 'दृश्य / पहनावा' },
  'Corridor / Flow': { ne: 'मार्ग / बहाव', en: 'Corridor / Flow', new: 'लँपु / बहाव', mai: 'मार्ग / बहाव', hi: 'मार्ग / प्रवाह' },
  'Chronology': { ne: 'समयक्रम', en: 'Chronology', new: 'समयक्रम', mai: 'समयक्रम', hi: 'कालक्रम' },
  'MISSING PERSON RECORD': { ne: 'हराएका व्यक्ति विवरण', en: 'MISSING PERSON RECORD', new: 'तंगु मनू विवरण', mai: 'हेराएल व्यक्ति विवरण', hi: 'लापता व्यक्ति रिकॉर्ड' },
  'Last seen:': { ne: 'अन्तिम पटक देखिएको:', en: 'Last seen:', new: 'अन्तिम खंगु:', mai: 'अन्तिम देखल:', hi: 'अंतिम बार देखा गया:' },
  'Reported': { ne: 'रिपोर्ट गरिएको', en: 'Reported', new: 'रिपोर्ट यानातःगु', mai: 'रिपोर्ट कएल', hi: 'रिपोर्ट किया गया' },
  'Reported Clothing:': { ne: 'रिपोर्ट गरिएको पहिरन:', en: 'Reported Clothing:', new: 'रिपोर्ट यानातःगु वसः:', mai: 'रिपोर्ट कएल पोशाक:', hi: 'रिपोर्ट किया गया पहनावा:' },
  'Not specified in initial report': { ne: 'प्रारम्भिक रिपोर्टमा उल्लेख छैन', en: 'Not specified in initial report', new: 'न्हापां रिपोर्टय् उल्लेख मदु', mai: 'प्रारम्भिक रिपोर्टमे उल्लेख नहि', hi: 'प्रारंभिक रिपोर्ट में निर्दिष्ट नहीं' },
  'Physical Traits & Context:': { ne: 'शारीरिक विशेषता र सन्दर्भ:', en: 'Physical Traits & Context:', new: 'शारीरिक विशेषता व सन्दर्भ:', mai: 'शारीरिक विशेषता आ सन्दर्भ:', hi: 'शारीरिक विशेषताएं और संदर्भ:' },
  'Standard profile recorded.': { ne: 'सामान्य प्रोफाइल अभिलेख गरिएको छ।', en: 'Standard profile recorded.', new: 'सामान्य प्रोफाइल अभिलेख यानातःगु।', mai: 'सामान्य प्रोफाइल दर्ज अछि।', hi: 'सामान्य प्रोफ़ाइल दर्ज है।' },
  'Reported By:': { ne: 'रिपोर्ट गर्ने:', en: 'Reported By:', new: 'रिपोर्ट यानिगु:', mai: 'रिपोर्ट कएनिहार:', hi: 'रिपोर्ट करने वाला:' },
  'Authorized Registry': { ne: 'अधिकृत लगत', en: 'Authorized Registry', new: 'अधिकृत लगत', mai: 'अधिकृत पंजी', hi: 'अधिकृत रजिस्टर' },
  'Contact:': { ne: 'सम्पर्क:', en: 'Contact:', new: 'सम्पर्क:', mai: 'सम्पर्क:', hi: 'संपर्क:' },
  'Authority Desk': { ne: 'प्राधिकरण डेस्क', en: 'Authority Desk', new: 'प्राधिकरण डेस्क', mai: 'प्राधिकरण डेस्क', hi: 'प्राधिकरण डेस्क' },
  'HOSPITAL PATIENT RECORD': { ne: 'अस्पताल बिरामी विवरण', en: 'HOSPITAL PATIENT RECORD', new: 'अस्पताल ल्वगी विवरण', mai: 'अस्पताल बिरामी विवरण', hi: 'अस्पताल मरीज रिकॉर्ड' },
  'Intake Photo': { ne: 'भर्ना फोटो', en: 'Intake Photo', new: 'दाखिला फोटो', mai: 'भर्ना फोटो', hi: 'प्रवेश फोटो' },
  'Unidentified Patient': { ne: 'पहिचान नभएको बिरामी', en: 'Unidentified Patient', new: 'म्हसिका मदूगु ल्वगी', mai: 'पहचान नहि भेल बिरामी', hi: 'अज्ञात मरीज' },
  'Est. Age:': { ne: 'अनुमानित उमेर:', en: 'Est. Age:', new: 'अनुमानित उमेर:', mai: 'अनुमानित उमेर:', hi: 'अनुमानित आयु:' },
  'Sex:': { ne: 'लिङ्ग:', en: 'Sex:', new: 'लिङ्ग:', mai: 'लिङ्ग:', hi: 'लिंग:' },
  'Found:': { ne: 'भेटिएको:', en: 'Found:', new: 'खंगु:', mai: 'भेटल:', hi: 'मिला:' },
  'Observed Clothing on Intake:': { ne: 'भर्ना गर्दा देखिएको पहिरन:', en: 'Observed Clothing on Intake:', new: 'दाखिला समयय् खंगु वसः:', mai: 'भर्ना समय देखल पोशाक:', hi: 'प्रवेश के समय देखा गया पहनावा:' },
  'Distinguishing Characteristics & Belongings:': { ne: 'पहिचानयोग्य विशेषता र सामान:', en: 'Distinguishing Characteristics & Belongings:', new: 'पहिचानया विशेषता व सामान:', mai: 'पहिचान योग्य विशेषता आ सामान:', hi: 'पहचान योग्य विशेषताएं और सामान:' },
  'None cataloged': { ne: 'कुनै अभिलेख छैन', en: 'None cataloged', new: 'छुं अभिलेख मदु', mai: 'कोनो अभिलेख नहि', hi: 'कोई रिकॉर्ड नहीं' },
  'Admitted:': { ne: 'भर्ना:', en: 'Admitted:', new: 'दाखिला:', mai: 'भर्ना:', hi: 'भर्ती:' },
  'Submitted by:': { ne: 'पेश गर्ने:', en: 'Submitted by:', new: 'दाखिला यानिगु:', mai: 'जमा कएनिहार:', hi: 'जमा करने वाला:' },
  'PENDING HUMAN REVIEW': { ne: 'मानवीय समीक्षा बाँकी', en: 'PENDING HUMAN REVIEW', new: 'मनूया समीक्षा जुइ ल्यं', mai: 'मानवीय समीक्षा बाँकी', hi: 'मानवीय समीक्षा लंबित' },
  'CONFIRMED POSSIBLE MATCH': { ne: 'सम्भावित मिलान पुष्टि', en: 'CONFIRMED POSSIBLE MATCH', new: 'सम्भावित मिलान पुष्टि', mai: 'सम्भावित मिलान पुष्टि', hi: 'संभावित मिलान पुष्ट' },
  'NEEDS FURTHER VERIFICATION': { ne: 'थप प्रमाणीकरण आवश्यक', en: 'NEEDS FURTHER VERIFICATION', new: 'मेगु प्रमाणीकरण माःगु', mai: 'अतिरिक्त सत्यापन आवश्यक', hi: 'अतिरिक्त सत्यापन आवश्यक' },
  'REJECTED': { ne: 'अस्वीकृत', en: 'REJECTED', new: 'अस्वीकृत', mai: 'अस्वीकृत', hi: 'अस्वीकृत' },
  'Strong visual resemblance in facial structure, hair color, and athletic build': { ne: 'अनुहारको बनोट, कपालको रङ र खेलाडी शरीरमा बलियो दृश्य समानता', en: 'Strong visual resemblance in facial structure, hair color, and athletic build', new: 'अनुहारया बनोट, कपालया रङ व खेलाडी शरीरय् बलियो दृश्य समानता', mai: 'अनुहारक बनोट, कपालक रंग आ एथलेटिक शरीरमे मजबूत दृश्य समानता', hi: 'चेहरे की बनावट, बालों के रंग और एथलेटिक शरीर में मजबूत दृश्य समानता' },
  'Compatible estimated age range (Patient: 30-35 vs Missing Report: 34 years)': { ne: 'अनुमानित उमेर दायरा मिल्दोजुल्दो (बिरामी: ३०-३५ वर्ष, हराएको रिपोर्ट: ३४ वर्ष)', en: 'Compatible estimated age range (Patient: 30-35 vs Missing Report: 34 years)', new: 'अनुमानित उमेर मिल्दो (ल्वगी: ३०-३५, तंगु रिपोर्ट: ३४ वर्ष)', mai: 'अनुमानित उमेरक दायरा मिलैत अछि (बिरामी: ३०-३५, हेराएल रिपोर्ट: ३४ वर्ष)', hi: 'अनुमानित आयु सीमा मेल खाती है (मरीज: ३०-३५, लापता रिपोर्ट: ३४ वर्ष)' },
  'Geographic corridor alignment: Melamchi flood water drainage path connects downriver to Bagmati / Balkhu basin': { ne: 'भौगोलिक मार्ग मिलान: मेलम्ची बाढीको पानी निकास मार्ग नदीको बहावसँगै बागमती / बल्खु बेसिनमा जोडिन्छ', en: 'Geographic corridor alignment: Melamchi flood water drainage path connects downriver to Bagmati / Balkhu basin', new: 'भौगोलिक लँपु मिलान: मेलम्ची खुसिया निकास बागमती / बल्खु बेसिनय् थ्यन', mai: 'भौगोलिक मार्ग मिलान: मेलम्ची बाढिक निकास बागमती / बल्खु बेसिनसँ जुड़ैत अछि', hi: 'भौगोलिक मार्ग मिलान: मेलम्ची बाढ़ जल निकासी मार्ग नीचे की ओर बागमती / बल्खु बेसिन से जुड़ता है' },
  'Patient admitted with slight facial abrasions and mud covering not present in family photo': { ne: 'बिरामीको अनुहारमा सामान्य चोट र हिलो लागेको छ, जुन पारिवारिक फोटोमा देखिँदैन', en: 'Patient admitted with slight facial abrasions and mud covering not present in family photo', new: 'ल्वगीया अनुहारय् सामान्य चोट व हिलो दु, परिवारया फोटोय् मदु', mai: 'बिरामीक अनुहार पर हल्का चोट आ माटि अछि, जे पारिवारिक फोटोमे नहि अछि', hi: 'मरीज के चेहरे पर हल्की खरोंच और मिट्टी है, जो पारिवारिक फोटो में नहीं है' },
  'Location of recovery (Balkhu) is downstream from initial last seen point (Melamchi)': { ne: 'उद्धार स्थान (बल्खु) सुरुमा अन्तिम पटक देखिएको स्थान (मेलम्ची) भन्दा नदीको तल्लो बहावमा छ', en: 'Location of recovery (Balkhu) is downstream from initial last seen point (Melamchi)', new: 'उद्धार थाय् (बल्खु) न्हापां अन्तिम खंगु थाय् (मेलम्ची) पाखें खुसिया बहावय् दु', mai: 'उद्धार स्थान (बल्खु) अन्तिम देखल स्थान (मेलम्ची) सँ नीचाँ धारमे अछि', hi: 'बरामदगी स्थान (बल्खु) प्रारंभिक अंतिम दृश्य स्थान (मेलम्ची) से नीचे की ओर है' },
  'Precise demographic alignment: Female child, age 7-9 (Reported: 8 years old, 3ft 10in)': { ne: 'ठ्याक्कै जनसांख्यिक मिलान: बालिका, उमेर ७-९ (रिपोर्ट: ८ वर्ष, ३ फिट १० इन्च)', en: 'Precise demographic alignment: Female child, age 7-9 (Reported: 8 years old, 3ft 10in)', new: 'ठ्याक्कै जनसांख्यिक मिलान: मचा, उमेर ७-९ (रिपोर्ट: ८ वर्ष, ३ फिट १० इन्च)', mai: 'सटीक जनसांख्यिक मिलान: बच्ची, उमेर ७-९ (रिपोर्ट: ८ वर्ष, ३ फिट १० इन्च)', hi: 'सटीक जनसांख्यिक मिलान: बालिका, आयु ७-९ (रिपोर्ट: ८ वर्ष, ३ फीट १० इंच)' },
  'Exact attire correspondence: Navy blue pleated school uniform skirt, white shirt, red hair ribbons': { ne: 'ठ्याक्कै पहिरन मिलान: गाढा नीलो चुन्नट भएको स्कुल स्कर्ट, सेतो सर्ट र रातो कपालको रिबन', en: 'Exact attire correspondence: Navy blue pleated school uniform skirt, white shirt, red hair ribbons', new: 'ठ्याक्कै वसः मिलान: गाढा नीलो स्कुल स्कर्ट, सेतो सर्ट व रातो कपालया रिबन', mai: 'ठीक पोशाक मिलान: गाढा नील स्कुल स्कर्ट, सेतो सर्ट आ रातो कपाल रिबन', hi: 'सटीक पहनावा मिलान: गहरे नीले रंग की स्कूल स्कर्ट, सफेद शर्ट और लाल बाल रिबन' },
  'Minor water staining and wear on uniform compared to pristine school photograph': { ne: 'सफा स्कुल फोटोको तुलनामा युनिफर्ममा पानीको सामान्य दाग र घिसावट', en: 'Minor water staining and wear on uniform compared to pristine school photograph', new: 'सफा स्कुल फोटोया तुलनामय् वसःय् सामान्य लःया दाग व घिसावट', mai: 'साफ स्कुल फोटोसँ तुलना करैत पोशाक पर हल्का पानिक दाग आ घिसावट', hi: 'साफ स्कूल फोटो की तुलना में यूनिफॉर्म पर हल्के पानी के दाग और घिसावट' },
  'Strong visual similarity in facial features, silver hair, and spectacles': { ne: 'अनुहारका विशेषता, फुलेको कपाल र चस्मामा बलियो दृश्य समानता', en: 'Strong visual similarity in facial features, silver hair, and spectacles', new: 'अनुहारया विशेषता, फुला कपाल व चश्माय् बलियो दृश्य समानता', mai: 'अनुहारक विशेषता, सफेद कपाल आ चश्मामे मजबूत दृश्य समानता', hi: 'चेहरे की विशेषताओं, सफेद बालों और चश्मे में मजबूत दृश्य समानता' },
  'Demographic match: Male, estimated age 60-65 (Reported: 62 years old, ~5ft 6in)': { ne: 'जनसांख्यिक मिलान: पुरुष, अनुमानित उमेर ६०-६५ (रिपोर्ट: ६२ वर्ष, करिब ५ फिट ६ इन्च)', en: 'Demographic match: Male, estimated age 60-65 (Reported: 62 years old, ~5ft 6in)', new: 'जनसांख्यिक मिलान: पुरुष, उमेर ६०-६५ (रिपोर्ट: ६२ वर्ष)', mai: 'जनसांख्यिक मिलान: पुरुष, अनुमानित उमेर ६०-६५ (रिपोर्ट: ६२ वर्ष)', hi: 'जनसांख्यिक मिलान: पुरुष, अनुमानित आयु ६०-६५ (रिपोर्ट: ६२ वर्ष, लगभग ५ फीट ६ इंच)' },
  'Administrator': { ne: 'प्रशासक', en: 'Administrator', new: 'प्रशासक', mai: 'प्रशासक', hi: 'प्रशासक' },
  'Full Access': { ne: 'पूर्ण पहुँच', en: 'Full Access', new: 'पूर्ण पहुँच', mai: 'पूर्ण पहुँच', hi: 'पूर्ण पहुँच' },
  'Citizen Access': { ne: 'नागरिक पहुँच', en: 'Citizen Access', new: 'नागरिक पहुँच', mai: 'नागरिक पहुँच', hi: 'नागरिक पहुँच' },
  'General User': { ne: 'सामान्य प्रयोगकर्ता', en: 'General User', new: 'सामान्य प्रयोगकर्ता', mai: 'सामान्य प्रयोगकर्ता', hi: 'सामान्य उपयोगकर्ता' },
  'Exit': { ne: 'बाहिर निस्कनुहोस्', en: 'Exit', new: 'पिहाँ वनेगु', mai: 'बाहर जाउ', hi: 'बाहर निकलें' },
  'Auto-detected': { ne: 'स्वचालित रूपमा पहिचान', en: 'Auto-detected', new: 'स्वचालित पहिचान', mai: 'स्वतः पहिचान', hi: 'स्वचालित रूप से पहचाना गया' },
  'ALERT': { ne: 'सतर्कता', en: 'ALERT', new: 'सतर्कता', mai: 'सतर्कता', hi: 'अलर्ट' },
  'ALERT LEVEL 2': { ne: 'सतर्कता तह २', en: 'ALERT LEVEL 2', new: 'सतर्कता स्तर २', mai: 'सतर्कता स्तर २', hi: 'अलर्ट स्तर २' },
  'ALERT LEVEL 3': { ne: 'सतर्कता तह ३', en: 'ALERT LEVEL 3', new: 'सतर्कता स्तर ३', mai: 'सतर्कता स्तर ३', hi: 'अलर्ट स्तर ३' },
  'WARNING': { ne: 'चेतावनी', en: 'WARNING', new: 'सतर्कता', mai: 'चेतावनी', hi: 'चेतावनी' },
  'CRITICAL': { ne: 'अति गम्भीर', en: 'CRITICAL', new: 'तसकं गम्भीर', mai: 'अति गम्भीर', hi: 'अति गंभीर' },
  'LOW': { ne: 'न्यून', en: 'LOW', new: 'न्यून', mai: 'न्यून', hi: 'कम' },
  'MODERATE': { ne: 'मध्यम', en: 'MODERATE', new: 'दथुइगु', mai: 'मध्यम', hi: 'मध्यम' },
  'HIGH': { ne: 'उच्च', en: 'HIGH', new: 'तःधंगु', mai: 'उच्च', hi: 'उच्च' },
  'NORMAL': { ne: 'सामान्य', en: 'NORMAL', new: 'सामान्य', mai: 'सामान्य', hi: 'सामान्य' },
  'ALL CLEAR': { ne: 'सबै सुरक्षित', en: 'ALL CLEAR', new: 'दक्को सुरक्षित', mai: 'सब सुरक्षित', hi: 'सब सुरक्षित' },
  'No Active Threat': { ne: 'कुनै सक्रिय खतरा छैन', en: 'No Active Threat', new: 'छुं नं खतरा मदु', mai: 'कोनो सक्रिय खतरा नहि', hi: 'कोई सक्रिय खतरा नहीं' },

  // Navigation & Directions
  'Turn left': { ne: 'बायाँ मोडिनुहोस्', en: 'Turn left', new: 'देपाः पाखे वनेगु', mai: 'बायाँ मुडू', hi: 'बाएं मुड़ें' },
  'Turn right': { ne: 'दायाँ मोडिनुहोस्', en: 'Turn right', new: 'ज्वपाः पाखे वनेगु', mai: 'दायाँ मुडू', hi: 'दाएं मुड़ें' },
  'Move forward': { ne: 'सिधा अगाडि बढ्नुहोस्', en: 'Move forward', new: 'न्ह्यःने वनेगु', mai: 'सोझे आगाँ बढ़ू', hi: 'सीधे आगे बढ़ें' },
  'Continue straight': { ne: 'सिधा अगाडि बढ्नुहोस्', en: 'Continue straight', new: 'न्ह्यःने वनेगु', mai: 'सोझे आगाँ बढ़ू', hi: 'सीधे आगे बढ़ें' },
  'Start Google Maps Navigation': { ne: 'गुगल म्याप्स नेभिगेसन सुरु गर्नुहोस्', en: 'Start Google Maps Navigation', new: 'गुगल म्याप्स नेभिगेसन सुरु यानादिसँ', mai: 'गुगल म्याप्स नेभिगेसन शुरू करू', hi: 'गूगल मैप्स नेविगेशन शुरू करें' },
  'Start Google Maps Navigation (Fullscreen)': { ne: 'गुगल म्याप्स नेभिगेसन सुरु गर्नुहोस् (फुलस्क्रिन)', en: 'Start Google Maps Navigation (Fullscreen)', new: 'गुगल म्याप्स नेभिगेसन सुरु यानादिसँ (फुलस्क्रिन)', mai: 'गुगल म्याप्स नेभिगेसन शुरू करू (फुलस्क्रिन)', hi: 'गूगल मैप्स नेविगेशन शुरू करें (फ़ुलस्क्रीन)' },
  'Turn-by-turn guidance': { ne: 'प्रत्येक मोडको प्रत्यक्ष निर्देशन', en: 'Turn-by-turn guidance', new: 'प्रत्येक मोडया लँपु निर्देशन', mai: 'प्रत्येक मोड़क मार्गदर्शन', hi: 'प्रत्येक मोड़ का मार्गदर्शन' },
  'DOR Bridges': { ne: 'सडक विभाग (DOR) पुलहरू', en: 'DOR Bridges', new: 'सडक विभाग तां (पुल)', mai: 'सड़क विभागक पुल', hi: 'सड़क विभाग पुल' },
  'DHM Rivers': { ne: 'जल तथा मौसम विभाग नदीहरू', en: 'DHM Rivers', new: 'जल तथा मौसम विभाग खुसि', mai: 'जल तथा मौसम विभाग नदी', hi: 'जल एवं मौसम विभाग नदियाँ' },
  'Route Avoidance': { ne: 'खतरायुक्त मार्गबाट बच्नुहोस्', en: 'Route Avoidance', new: 'खतरा लँपुपाखें बचेजुइगु', mai: 'खतरा रस्तासँ बचू', hi: 'खतरनाक मार्ग से बचें' },
  'Safest Route': { ne: 'सबैभन्दा सुरक्षित मार्ग', en: 'Safest Route', new: 'दकलय् सुरक्षित लँपु', mai: 'सबसँ सुरक्षित रस्ता', hi: 'सबसे सुरक्षित मार्ग' },
  'Route to Avoid': { ne: 'बच्नुपर्ने अवरुद्ध मार्ग', en: 'Route to Avoid', new: 'बचेजुइमाःगु लँपु', mai: 'बचबाक रस्ता', hi: 'बचने योग्य अवरुद्ध मार्ग' },
  'Estimated Travel Time': { ne: 'अनुमानित यात्रा समय', en: 'Estimated Travel Time', new: 'अनुमानित ई (समय)', mai: 'अनुमानित यात्रा समय', hi: 'अनुमानित यात्रा समय' },
  'Total Distance': { ne: 'जम्मा दूरी', en: 'Total Distance', new: 'जम्मा तापाःगु (दूरी)', mai: 'कुल दूरी', hi: 'कुल दूरी' },
  'Origin Corridor': { ne: 'प्रस्थान मार्ग / स्थान', en: 'Origin Corridor', new: 'शुरु लँपु', mai: 'प्रस्थान रस्ता', hi: 'प्रस्थान गलियारा' },
  'Destination Corridor': { ne: 'गन्तव्य मार्ग / स्थान', en: 'Destination Corridor', new: 'गन्तव्य लँपु', mai: 'गन्तव्य रस्ता', hi: 'गंतव्य गलियारा' },
  'Test Scenarios:': { ne: 'परीक्षण परिदृश्यहरू:', en: 'Test Scenarios:', new: 'परीक्षण अवस्थाहरु:', mai: 'परीक्षण परिदृश्य:', hi: 'परीक्षण परिदृश्य:' },
  'Test Scenarios': { ne: 'परीक्षण परिदृश्यहरू', en: 'Test Scenarios', new: 'परीक्षण अवस्थाहरु', mai: 'परीक्षण परिदृश्य', hi: 'परीक्षण परिदृश्य' },
  'Baseline': { ne: 'सामान्य अवस्था', en: 'Baseline', new: 'सामान्य अवस्था', mai: 'सामान्य स्थिति', hi: 'सामान्य स्थिति' },
  'Landslide': { ne: 'पहिरो', en: 'Landslide', new: 'चलः', mai: 'पहिरो', hi: 'भूस्खलन' },
  'River Flood': { ne: 'नदी बाढी', en: 'River Flood', new: 'खुसिबाः', mai: 'नदी बाढि', hi: 'नदी बाढ़' },
  'Why This Route is Recommended:': { ne: 'यो मार्ग किन सिफारिस गरियो:', en: 'Why This Route is Recommended:', new: 'थ्व लँपु सिफारिस याःगु कारण:', mai: 'ई रस्ता किएक सिफारिस कएल गेल:', hi: 'यह मार्ग क्यों अनुशंसित है:' },
  'Hazard Avoidance AI Reasoning:': { ne: 'खतराबाट बच्ने एआई तर्क:', en: 'Hazard Avoidance AI Reasoning:', new: 'खतरा ल्यंकेगु एआई विश्लेषण:', mai: 'खतरासँ बचबाक एआई तर्क:', hi: 'खतरे से बचाव का एआई विश्लेषण:' },
  'Exit Fullscreen': { ne: 'फुलस्क्रिन बन्द गर्नुहोस्', en: 'Exit Fullscreen', new: 'फुलस्क्रिन बन्द यानादिसँ', mai: 'फुलस्क्रिन बन्द करू', hi: 'फुलस्क्रीन बंद करें' },
  'Simulate Driving': { ne: 'यात्रा सिमुलेसन सुरु गर्नुहोस्', en: 'Simulate Driving', new: 'यात्रा सिमुलेसन', mai: 'यात्रा सिमुलेसन', hi: 'यात्रा सिमुलेशन' },
  'Pause Simulation': { ne: 'सिमुलेसन रोक्नुहोस्', en: 'Pause Simulation', new: 'सिमुलेसन दिकेगु', mai: 'सिमुलेसन रोकू', hi: 'सिमुलेशन रोकें' },

  // Road & Bridge Statuses
  'OPEN': { ne: 'खुला', en: 'OPEN', new: 'चाला', mai: 'खुला', hi: 'खुला' },
  'BLOCKED': { ne: 'अवरुद्ध / बन्द', en: 'BLOCKED', new: 'बन्द', mai: 'अवरुद्ध / बन्द', hi: 'अवरुद्ध / बंद' },
  'CAUTION': { ne: 'सतर्कता / सावधानी', en: 'CAUTION', new: 'होशियार', mai: 'सावधानी', hi: 'सावधानी' },
  'RESTRICTED': { ne: 'प्रतिबन्धित', en: 'RESTRICTED', new: 'नियन्त्रित', mai: 'प्रतिबन्धित', hi: 'प्रतिबंधित' },
  'Passable with Caution': { ne: 'सावधानीपूर्वक पार गर्न सकिने', en: 'Passable with Caution', new: 'होशियारीपूर्वक वनेज्यूगु', mai: 'सावधानीपूर्वक पार कएल जा सकैत अछि', hi: 'सावधानीपूर्वक आवागमन योग्य' },
  'Debris Flow & Massive Landslide at Chainage 18+200': { ne: 'माइल १८+२०० मा ठूलो पहिरो र लेदो अवरोध', en: 'Debris Flow & Massive Landslide at Chainage 18+200', new: '१८+२०० थासय् तःधंगु चलः व लेदो अवरोध', mai: '१८+२०० स्थानमे पैघ पहिरो आ माटि अवरोध', hi: 'चेनेज १८+२०० पर भारी भूस्खलन और मलबा' },
  'Active Rockfall': { ne: 'ढुङ्गा खसिरहेको', en: 'Active Rockfall', new: 'ल्वहँ कुतुंवंगु दु', mai: 'पत्थर खसि रहल अछि', hi: 'सक्रिय चट्टान गिरना' },
  'Total Blockage': { ne: 'पूर्ण अवरोध', en: 'Total Blockage', new: 'पूरं बन्द', mai: 'पूर्ण अवरोध', hi: 'पूर्ण अवरोध' },
  'Flood Surge Above Danger Level - Structural Threat': { ne: 'खतराको स्तरभन्दा माथि बाढीको बहाव - पुल संरचनामा जोखिम', en: 'Flood Surge Above Danger Level - Structural Threat', new: 'खतरा स्तर स्वयां च्वे खुसिबाः - तां (पुल) य् खतरा', mai: 'खतरा स्तरसँ ऊपर बाढिक बहाव - पुल खतरामे', hi: 'खतरे के निशान से ऊपर बाढ़ - पुल को संरचनात्मक खतरा' },
  'Water 1.8m Above Deck': { ne: 'पुलको सतहभन्दा १.८ मिटर माथि पानी', en: 'Water 1.8m Above Deck', new: 'तां स्वयां १.८ मिटर च्वे लः', mai: 'पुलसँ १.८ मिटर ऊपर पानि', hi: 'पुल की सतह से १.८ मीटर ऊपर पानी' },
  'Pier Scour': { ne: 'पुलको पिल्लरमा क्षति', en: 'Pier Scour', new: 'तांया पिल्लर स्यंगु', mai: 'पुलक पिलर कटान', hi: 'पुल के खंभे का कटाव' },

  // Highways & Places
  'Prithvi Highway': { ne: 'पृथ्वी राजमार्ग', en: 'Prithvi Highway', new: 'पृथ्वी राजमार्ग', mai: 'पृथ्वी राजमार्ग', hi: 'पृथ्वी राजमार्ग' },
  'Tribhuvan Highway': { ne: 'त्रिभुवन राजमार्ग', en: 'Tribhuvan Highway', new: 'त्रिभुवन राजमार्ग', mai: 'त्रिभुवन राजमार्ग', hi: 'त्रिभुवन राजमार्ग' },
  'BP Highway': { ne: 'बीपी राजमार्ग', en: 'BP Highway', new: 'बीपी राजमार्ग', mai: 'बीपी राजमार्ग', hi: 'बीपी राजमार्ग' },
  'East-West Highway': { ne: 'पूर्व-पश्चिम राजमार्ग (महेन्द्र राजमार्ग)', en: 'East-West Highway', new: 'पूर्व-पश्चिम राजमार्ग', mai: 'पूर्व-पश्चिम राजमार्ग', hi: 'पूर्व-पश्चिम राजमार्ग' },
  'Mugling-Narayanghat': { ne: 'मुग्लिङ-नारायणगढ खण्ड', en: 'Mugling-Narayanghat', new: 'मुग्लिङ-नारायणगढ', mai: 'मुग्लिङ-नारायणगढ', hi: 'मुगलिंग-नारायणगढ़' },
  'Kathmandu': { ne: 'काठमाडौँ', en: 'Kathmandu', new: 'येँ देय् (काठमाडौं)', mai: 'काठमाडौं', hi: 'काठमांडू' },
  'Pokhara': { ne: 'पोखरा', en: 'Pokhara', new: 'पोखरा', mai: 'पोखरा', hi: 'पोखरा' },
  'Narayanghat': { ne: 'नारायणगढ', en: 'Narayanghat', new: 'नारायणगढ', mai: 'नारायणगढ', hi: 'नारायणगढ़' },
  'Hetauda': { ne: 'हेटौँडा', en: 'Hetauda', new: 'हेटौंडा', mai: 'हेटौंडा', hi: 'हेटौंडा' },
  'Chitwan': { ne: 'चितवन', en: 'Chitwan', new: 'चितवन', mai: 'चितवन', hi: 'चितवन' },
  'Bardibas': { ne: 'बर्दिबास', en: 'Bardibas', new: 'बर्दिबास', mai: 'बर्दिबास', hi: 'बर्दिबास' },
  'Janakpur': { ne: 'जनकपुरधाम', en: 'Janakpur', new: 'जनकपुर', mai: 'जनकपुरधाम', hi: 'जनकपुरधाम' },
  'Sindhupalchok': { ne: 'सिन्धुपाल्चोक', en: 'Sindhupalchok', new: 'सिन्धुपाल्चोक', mai: 'सिन्धुपाल्चोक', hi: 'सिंधुपाल्चोक' },
  'Biratnagar': { ne: 'विराटनगर', en: 'Biratnagar', new: 'विराटनगर', mai: 'विराटनगर', hi: 'विराटनगर' },
  'Dharan': { ne: 'धरान', en: 'Dharan', new: 'धरान', mai: 'धरान', hi: 'धरान' },
  'Butwal': { ne: 'बुटवल', en: 'Butwal', new: 'बुटवल', mai: 'बुटवल', hi: 'बुटवल' },
  'Nepalgunj': { ne: 'नेपालगन्ज', en: 'Nepalgunj', new: 'नेपालगन्ज', mai: 'नेपालगन्ज', hi: 'नेपालगंज' },
  'Bagmati': { ne: 'बागमती प्रदेश', en: 'Bagmati', new: 'बागमती प्रदेश', mai: 'बागमती प्रदेश', hi: 'बागमती प्रांत' },
  'Gandaki': { ne: 'गण्डकी प्रदेश', en: 'Gandaki', new: 'गण्डकी प्रदेश', mai: 'गण्डकी प्रदेश', hi: 'गंडकी प्रांत' },
  'Madhesh': { ne: 'मधेश प्रदेश', en: 'Madhesh', new: 'मधेश प्रदेश', mai: 'मधेश प्रदेश', hi: 'मधेश प्रांत' },
  'Koshi': { ne: 'कोशी प्रदेश', en: 'Koshi', new: 'कोशी प्रदेश', mai: 'कोशी प्रदेश', hi: 'कोशी प्रांत' },
  'Lumbini': { ne: 'लुम्बिनी प्रदेश', en: 'Lumbini', new: 'लुम्बिनी प्रदेश', mai: 'लुम्बिनी प्रदेश', hi: 'लुम्बिनी प्रांत' },
  'Karnali': { ne: 'कर्णाली प्रदेश', en: 'Karnali', new: 'कर्णाली प्रदेश', mai: 'कर्णाली प्रदेश', hi: 'कर्णाली प्रांत' },
  'Sudurpashchim': { ne: 'सुदूरपश्चिम प्रदेश', en: 'Sudurpashchim', new: 'सुदूरपश्चिम प्रदेश', mai: 'सुदूरपश्चिम प्रदेश', hi: 'सुदूरपश्चिम प्रांत' },

  // Hospital & Health
  'Government Hospital': { ne: 'सरकारी अस्पताल', en: 'Government Hospital', new: 'सरकारी अस्पताल', mai: 'सरकारी अस्पताल', hi: 'सरकारी अस्पताल' },
  'Available Beds': { ne: 'उपलब्ध बेडहरू', en: 'Available Beds', new: 'उपलब्ध खाट (बेड)', mai: 'उपलब्ध बेड', hi: 'उपलब्ध बेड' },
  'ICU Beds': { ne: 'आईसीयू बेड', en: 'ICU Beds', new: 'आईसीयू बेड', mai: 'आईसीयू बेड', hi: 'आईसीयू बेड' },
  'Ventilators': { ne: 'भेन्टिलेटर', en: 'Ventilators', new: 'भेन्टिलेटर', mai: 'भेन्टिलेटर', hi: 'वेंटिलेटर' },
  'Emergency Ward': { ne: 'आपतकालीन वार्ड', en: 'Emergency Ward', new: 'आपतकालीन वार्ड', mai: 'आपातकालीन वार्ड', hi: 'आपातकालीन वार्ड' },
  'Trauma Center': { ne: 'ट्रमा सेन्टर', en: 'Trauma Center', new: 'ट्रमा सेन्टर', mai: 'ट्रॉमा सेन्टर', hi: 'ट्रॉमा सेंटर' },
  'Matched Patients': { ne: 'सिफारिस गरिएका बिरामीहरू', en: 'Matched Patients', new: 'मिलान जूगु ल्वगीत', mai: 'मिलान कएल बिरामी', hi: 'मिलान किए गए मरीज' },
  'Patient Intake': { ne: 'बिरामी भर्ना दर्ता', en: 'Patient Intake', new: 'ल्वगी दर्ता', mai: 'बिरामी भर्ना', hi: 'मरीज दाखिला' },

  // Weather & Hydrology
  'Live Hydrology Watch': { ne: 'प्रत्यक्ष जल मापन अनुगमन', en: 'Live Hydrology Watch', new: 'प्रत्यक्ष खुसि अनुगमन', mai: 'प्रत्यक्ष नदी जलस्तर', hi: 'लाइव नदी जलस्तर निगरानी' },
  'Heavy Rainfall Alert': { ne: 'भारी वर्षा सतर्कता', en: 'Heavy Rainfall Alert', new: 'तःधंगु वा वइगु सतर्कता', mai: 'भारी वर्षाक चेतावनी', hi: 'भारी बारिश की चेतावनी' },
  'Flash Flood Danger': { ne: 'आकस्मिक बाढीको खतरा', en: 'Flash Flood Danger', new: 'आकस्मिक खुसिबाः खतरा', mai: 'अचानक बाढिक खतरा', hi: 'अचानक बाढ़ का खतरा' },
  'Rising Rapidly': { ne: 'तीव्र गतिमा बढ्दै', en: 'Rising Rapidly', new: 'याकनं अप्वयाच्वंगु', mai: 'तेजीसँ बढ़ि रहल अछि', hi: 'तेजी से बढ़ रहा है' },
  'Above Danger Level': { ne: 'खतराको तहभन्दा माथि', en: 'Above Danger Level', new: 'खतरा स्तर स्वयां च्वे', mai: 'खतराक स्तरसँ ऊपर', hi: 'खतरे के निशान से ऊपर' },
  'Below Warning Level': { ne: 'चेतावनी तहभन्दा मुनि (सुरक्षित)', en: 'Below Warning Level', new: 'चेतावनी स्तर स्वयां क्वय्', mai: 'चेतावनी स्तरसँ नीचाँ', hi: 'चेतावनी स्तर से नीचे (सुरक्षित)' },

  // Logistics & Volunteers
  'Volunteer Teams': { ne: 'स्वयंसेवक टोलीहरू', en: 'Volunteer Teams', new: 'स्वयंसेवक पुचःत', mai: 'स्वयंसेवक दलसभ', hi: 'स्वयंसेवक दल' },
  'Volunteer Teams & Coverage': { ne: 'स्वयंसेवक टोली परिचालन र रसद', en: 'Volunteer Teams & Coverage', new: 'स्वयंसेवक पुचः व सामग्री', mai: 'स्वयंसेवक दल आ राहत', hi: 'स्वयंसेवक दल व रसद' },
  'Register Team Leader': { ne: 'टोली नेता दर्ता गर्नुहोस्', en: 'Register Team Leader', new: 'पुचः नायः दर्ता यानादिसँ', mai: 'दल नेता दर्ता करू', hi: 'टीम लीडर पंजीकृत करें' },
  'Registered Teams': { ne: 'दर्ता भएका टोलीहरू', en: 'Registered Teams', new: 'दर्ता जूगु पुचःत', mai: 'दर्ता भेल दल', hi: 'पंजीकृत दल' },
  'Mobilized Responders': { ne: 'परिचालित उद्धारकर्ताहरू', en: 'Mobilized Responders', new: 'खटेजूगु उद्धारकर्तात', mai: 'खटल स्वयंसेवक', hi: 'तैनात स्वयंसेवक' },
  'Disaster Sectors Covered': { ne: 'समेटिएका विपद् क्षेत्रहरू', en: 'Disaster Sectors Covered', new: 'कार्यक्षेत्रत', mai: 'विपद् क्षेत्रसभ', hi: 'आपदा क्षेत्र' },
  'Deployment Status': { ne: 'तैनाती स्थिति', en: 'Deployment Status', new: 'तैनाती स्थिति', mai: 'तैनाती स्थिति', hi: 'तैनाती स्थिति' },
  'Allocated Operating Area': { ne: 'तोकिएको कार्य क्षेत्र', en: 'Allocated Operating Area', new: 'तोकेयानातःगु क्षेत्र', mai: 'आवंटित क्षेत्र', hi: 'आवंटित कार्य क्षेत्र' },
  'Allocated Volunteer Operating Area': { ne: 'तोकिएको स्वयंसेवक कार्य क्षेत्र', en: 'Allocated Volunteer Operating Area', new: 'तोकेयानातःगु स्वयंसेवक कार्यक्षेत्र', mai: 'तोकल स्वयंसेवक कार्य क्षेत्र', hi: 'आवंटित स्वयंसेवक कार्य क्षेत्र' },
  'Auto-Recommend Optimal Area': { ne: 'एआईद्वारा उपयुक्त क्षेत्र सिफारिस', en: 'Auto-Recommend Optimal Area', new: 'एआई सिफारिस क्षेत्र', mai: 'एआई द्वारा उपयुक्त क्षेत्र', hi: 'एआई द्वारा अनुशंसित क्षेत्र' },
  'Active Mission': { ne: 'सक्रिय जिम्मेवारी / मिसन', en: 'Active Mission', new: 'सक्रिय जिम्मेवारी', mai: 'सक्रिय मिसन', hi: 'सक्रिय मिशन' },
  'Active Operational Mission': { ne: 'सक्रिय जिम्मेवारी / मिसन', en: 'Active Operational Mission', new: 'सक्रिय जिम्मेवारी', mai: 'सक्रिय मिसन', hi: 'सक्रिय मिशन' },
  'Reassign Area': { ne: 'कार्यक्षेत्र पुन: तोक्नुहोस्', en: 'Reassign Area', new: 'मेगु क्षेत्र तोकेयानादिसँ', mai: 'पुनः क्षेत्र आवंटन करू', hi: 'कार्यक्षेत्र पुन: आवंटित करें' },
  'Leader Name': { ne: 'नेताको नाम', en: 'Leader Name', new: 'नायःया नां', mai: 'नेताक नाम', hi: 'लीडर का नाम' },
  'Team Size': { ne: 'टोली सदस्य संख्या', en: 'Team Size', new: 'पुचः दुजः ल्याः', mai: 'दल सदस्य संख्या', hi: 'दल सदस्य संख्या' },
  'Primary Skill': { ne: 'प्रमुख सीप / विशेषज्ञता', en: 'Primary Skill', new: 'मू सीप', mai: 'मुख्य सीप', hi: 'मुख्य कौशल' },
  'Medical & First Aid': { ne: 'प्राथमिक उपचार तथा स्वास्थ्य', en: 'Medical & First Aid', new: 'प्राथमिक उपचार व उसाँय्', mai: 'प्राथमिक उपचार आ स्वास्थ्य', hi: 'प्राथमिक चिकित्सा व स्वास्थ्य' },
  'Water Rescue': { ne: 'जल उद्धार (पौडी / डुङ्गा)', en: 'Water Rescue', new: 'लः उद्धार', mai: 'जल उद्धार', hi: 'जल बचाव' },
  'Debris Clearance': { ne: 'पहिरो तथा भग्नावशेष हटाउने', en: 'Debris Clearance', new: 'चलः व लेदो लिकायेगु', mai: 'मलबा हटाउब', hi: 'मलबा हटाना' },
  'Food & Supply Distribution': { ne: 'राहत सामग्री तथा खाद्यान्न वितरण', en: 'Food & Supply Distribution', new: 'राहत सामग्री व नसा वितरण', mai: 'राहत सामग्री आ भोजन वितरण', hi: 'राहत सामग्री व खाद्य वितरण' },
  'Drone Surveillance': { ne: 'ड्रोन निगरानी', en: 'Drone Surveillance', new: 'ड्रोन निगरानी', mai: 'ड्रोन निगरानी', hi: 'ड्रोन निगरानी' },
  'Search & Evacuation': { ne: 'खोजी तथा सुरक्षित स्थान स्थानान्तरण', en: 'Search & Evacuation', new: 'माला व सुरक्षित थासय् यंकेगु', mai: 'खोज आ सुरक्षित स्थान प्रेषण', hi: 'खोज व निकासी' },
  'Deployed': { ne: 'खटिएको / तैनाथ', en: 'Deployed', new: 'खटेजूगु', mai: 'खटल', hi: 'तैनात' },
  'Standby': { ne: 'तयारी अवस्थामा', en: 'Standby', new: 'तयारीइ दुगु', mai: 'तयारी स्थिति', hi: 'तैयार अवस्था' },
  'Available': { ne: 'उपलब्ध', en: 'Available', new: 'उपलब्ध', mai: 'उपलब्ध', hi: 'उपलब्ध' },
  'En Route': { ne: 'बाटोमा रहेको', en: 'En Route', new: 'लँपुइ दुगु', mai: 'रस्तामे', hi: 'रास्ते में' },
  'Rest': { ne: 'आराममा', en: 'Rest', new: 'आरामय्', mai: 'आराममे', hi: 'विश्राम' },

  // Missing Persons & Citizen Safety (NDRRMA / OPMCM)
  'Missing Persons & Citizen Safety': { ne: 'हराएका व्यक्तिहरू र नागरिक सुरक्षा', en: 'Missing Persons & Citizen Safety', new: 'तंगु मनूत व नागरिक सुरक्षा', mai: 'हेराएल व्यक्ति आ नागरिक सुरक्षा', hi: 'लापता व्यक्ति व नागरिक सुरक्षा' },
  'SEARCH & RESCUE': { ne: 'खोजी तथा उद्धार', en: 'SEARCH & RESCUE', new: 'माला व ल्हायेगु', mai: 'खोज आ उद्धार', hi: 'खोज व बचाव' },
  'AI-assisted missing-person tracing, field sighting correlation, human-verified matching, and NDRRMA / OPMCM Search & Rescue registry.': {
    ne: 'एआई-सहयोगमा हराएका व्यक्तिहरूको खोजी, प्रत्यक्ष目擊 सूचना मिलान र राष्ट्रिय उद्धार लगत।',
    en: 'AI-assisted missing-person tracing, field sighting correlation, human-verified matching, and NDRRMA / OPMCM Search & Rescue registry.',
    new: 'एआई ग्वाहालिइ तंगु मनूया माला, प्रत्यक्ष खंगु विवरण मिलान व राष्ट्रिय लगत।',
    mai: 'एआई सहयोगसँ हेराएल व्यक्तिक खोज, प्रत्यक्ष विवरण मिलान आ राष्ट्रिय उद्धार पंजी।',
    hi: 'एआई-सहायता प्राप्त लापता व्यक्ति ट्रैकिंग, प्रत्यक्ष विवरण मिलान और राष्ट्रीय बचाव रजिस्टर।'
  },
  'Role:': { ne: 'भूमिका:', en: 'Role:', new: 'भूमिका:', mai: 'भूमिका:', hi: 'भूमिका:' },
  'Public Citizen': { ne: 'सर्वसाधारण नागरिक', en: 'Public Citizen', new: 'सर्वसाधारण नागरिक', mai: 'आम नागरिक', hi: 'आम नागरिक' },
  'Authorized Officer': { ne: 'अधिकृत सुरक्षाकर्मी / उद्धार अधिकृत', en: 'Authorized Officer', new: 'अधिकृत सुरक्षा अधिकारी', mai: 'अधिकृत अधिकारी', hi: 'अधिकृत अधिकारी' },
  'Government of Nepal • OPMCM': { ne: 'नेपाल सरकार • प्रधानमन्त्री तथा मन्त्रिपरिषद्को कार्यालय', en: 'Government of Nepal • OPMCM', new: 'नेपाल सरकार • प्रधानमन्त्री ज्याकुथि', mai: 'नेपाल सरकार • प्रधानमन्त्री कार्यालय', hi: 'नेपाल सरकार • प्रधानमंत्री कार्यालय' },
  'National Disaster Search & Rescue Registry (NDRRMA)': { ne: 'राष्ट्रिय विपद् जोखिम न्यूनीकरण तथा व्यवस्थापन प्राधिकरण (NDRRMA)', en: 'National Disaster Search & Rescue Registry (NDRRMA)', new: 'राष्ट्रिय विपद् जोखिम न्यूनीकरण प्राधिकरण (NDRRMA)', mai: 'राष्ट्रिय विपद् प्राधिकरण (NDRRMA)', hi: 'राष्ट्रीय आपदा प्रबंधन प्राधिकरण (NDRRMA)' },
  'PORTAL LIVE SYNC': { ne: 'प्रत्यक्ष पोर्टल जडान', en: 'PORTAL LIVE SYNC', new: 'प्रत्यक्ष पोर्टल स्वापू', mai: 'लाइव पोर्टल सिंक', hi: 'लाइव पोर्टल सिंक' },
  'OFFLINE CACHED': { ne: 'अफलाइन सुरक्षित तथ्याङ्क', en: 'OFFLINE CACHED', new: 'अफलाइन सुरक्षित', mai: 'अफलाइन सुरक्षित', hi: 'ऑफ़लाइन सहेजा गया' },
  'National Flood & Landslide Missing Persons Registry': { ne: 'राष्ट्रिय बाढी तथा पहिरो बेपत्ता नागरिक लगत', en: 'National Flood & Landslide Missing Persons Registry', new: 'राष्ट्रिय खुसिबाः व चलः तंगु मनूया लगत', mai: 'राष्ट्रिय बाढि आ पहिरो बेपत्ता नागरिक पंजी', hi: 'राष्ट्रीय बाढ़ व भूस्खलन लापता नागरिक रजिस्टर' },
  'Real-time synchronization with the Office of the Prime Minister and Council of Ministers (OPMCM) Disaster Rescue Portal': {
    ne: 'प्रधानमन्त्री तथा मन्त्रिपरिषद्को कार्यालय (OPMCM) विपद् उद्धार पोर्टलसँग प्रत्यक्ष समन्वय।',
    en: 'Real-time synchronization with the Office of the Prime Minister and Council of Ministers (OPMCM) Disaster Rescue Portal',
    new: 'प्रधानमन्त्री ज्याकुथिया विपद् उद्धार पोर्टलनाप प्रत्यक्ष समन्वय।',
    mai: 'प्रधानमन्त्री कार्यालय विपद् उद्धार पोर्टलसँ प्रत्यक्ष समन्वय।',
    hi: 'प्रधानमंत्री कार्यालय आपदा बचाव पोर्टल के साथ रीयल-टाइम समन्वय।'
  },
  'Cross-correlated with field sighting intelligence and tactical AI matching.': {
    ne: 'फिल्डबाट प्राप्त प्रत्यक्ष目擊 सूचना र एआई मिलान प्रणालीसँग विश्लेषण गरिएको।',
    en: 'Cross-correlated with field sighting intelligence and tactical AI matching.',
    new: 'खंगु目擊 सुचं व एआई मिलान पाखें विश्लेषण यानातःगु।',
    mai: 'प्रत्यक्ष目擊 सूचना आ एआई मिलान प्रणालीसँ विश्लेषण कएल गेल।',
    hi: 'फ़ील्ड目擊 सूचना और एआई मिलान प्रणाली द्वारा विश्लेषित।'
  },
  'Last synchronized:': { ne: 'पछिल्लो पटक अद्यावधिक:', en: 'Last synchronized:', new: 'लिपांगु अद्यावधिक:', mai: 'पछिला अपडेट:', hi: 'अंतिम अपडेट:' },
  'Just now': { ne: 'भर्खरै', en: 'Just now', new: 'आ भर्खर', mai: 'एखने', hi: 'अभी-अभी' },
  'Sync Live Portal': { ne: 'पोर्टल ताजा गर्नुहोस्', en: 'Sync Live Portal', new: 'पोर्टल ताजा यानादिसँ', mai: 'पोर्टल ताजा करू', hi: 'पोर्टल सिंक करें' },
  'Official Public Link': { ne: 'आधिकारिक सार्वजनिक लिङ्क', en: 'Official Public Link', new: 'आधिकारिक जाःथाय्', mai: 'आधिकारिक लिंक', hi: 'आधिकारिक लिंक' },
  'Report Missing Person': { ne: 'बेपत्ता व्यक्ति दर्ता गर्नुहोस्', en: 'Report Missing Person', new: 'तंगु मनू दर्ता यानादिसँ', mai: 'बेपत्ता व्यक्ति दर्ता करू', hi: 'लापता व्यक्ति दर्ज करें' },
  'Report Sighting': { ne: 'देखेको जानकारी दिनुहोस्', en: 'Report Sighting', new: 'खंगु विवरण बियादिसँ', mai: 'देखल जानकारी दिअ', hi: 'देखे जाने की सूचना दें' },
  'Review Matches': { ne: 'मिलान समीक्षा गर्नुहोस्', en: 'Review Matches', new: 'मिलान स्वयादिसँ', mai: 'मिलान समीक्षा करू', hi: 'मिलान समीक्षा करें' },
  'Official Reports': { ne: 'आधिकारिक विवरण', en: 'Official Reports', new: 'आधिकारिक विवरण', mai: 'सरकारी रिपोर्ट', hi: 'आधिकारिक रिपोर्ट' },
  'Total People Tracked': { ne: 'खोजीमा रहेका नागरिक', en: 'Total People Tracked', new: 'मालाच्वंगु कुल मनूत', mai: 'कुल खोजल जा रहल', hi: 'कुल ट्रैक किए गए व्यक्ति' },
  'Rescued & Safe': { ne: 'सकुशल उद्धार भएका', en: 'Rescued & Safe', new: 'सकुशल उद्धार जूगु', mai: 'सकुशल उद्धार भेल', hi: 'सकुशल बचाए गए' },
  'Injured / In Medical Care': { ne: 'घाइते / उपचाररत', en: 'Injured / In Medical Care', new: 'घाःपाः / वासः यानाच्वंगु', mai: 'घायल / उपचाररत', hi: 'घायल / उपचाराधीन' },
  'Deceased (Confirmed)': { ne: 'मृत्यु पुष्टि भएका', en: 'Deceased (Confirmed)', new: 'मदूगु पुष्टि जूगु', mai: 'मृत्यु पुष्टि भेल', hi: 'मृत्यु (पुष्ट)' },
  'Critical Unfound': { ne: 'तत्काल खोजी आवश्यक', en: 'Critical Unfound', new: 'तुरुन्त मालेमाःगु', mai: 'तत्काल खोजबाक', hi: 'तत्काल खोज आवश्यक' },
  'Field Sighting Reports': { ne: 'प्रत्यक्ष目擊 सूचनाहरू', en: 'Field Sighting Reports', new: 'खंगु目擊 सुचं', mai: 'प्रत्यक्ष目擊 रिपोर्ट', hi: 'प्रत्यक्ष目擊 रिपोर्ट' },
  'Pending Verification': { ne: 'पुष्टि हुन बाँकी', en: 'Pending Verification', new: 'पुष्टि जुइ ल्यं', mai: 'पुष्टि बाँकी', hi: 'सत्यापन लंबित' },
  'AI Candidate Matches': { ne: 'एआई सम्भावित मिलानहरू', en: 'AI Candidate Matches', new: 'एआई सिफारिस मिलान', mai: 'एआई सम्भावित मिलान', hi: 'एआई संभावित मिलान' },
  'High-Confidence Pairs': { ne: 'उच्च विश्वसनीयता भएका जोडीहरू', en: 'High-Confidence Pairs', new: 'उच्च विश्वस्त जोडी', mai: 'उच्च विश्वस्त जोडी', hi: 'उच्च विश्वसनीयता वाले जोड़े' },
  'Filter by Name, Clothing, ID, or Location...': { ne: 'नाम, लुगा, परिचयपत्र वा स्थान खोज्नुहोस्...', en: 'Filter by Name, Clothing, ID, or Location...', new: 'नां, वसः, म्हसिका वा थाय् मालादिसँ...', mai: 'नाम, कपडा, पहचान वा स्थान खोजू...', hi: 'नाम, कपड़े, आईडी या स्थान खोजें...' },
  'Source:': { ne: 'स्रोत:', en: 'Source:', new: 'स्रोत:', mai: 'स्रोत:', hi: 'स्रोत:' },
  'All Registries': { ne: 'सबै लगतहरू', en: 'All Registries', new: 'दक्को लगत', mai: 'सब पंजी', hi: 'सभी रजिस्टर' },
  'Gov OPMCM Only': { ne: 'नेपाल सरकार (OPMCM) मात्र', en: 'Gov OPMCM Only', new: 'नेपाल सरकार जक', mai: 'नेपाल सरकार मात्र', hi: 'केवल नेपाल सरकार' },
  'Community / Local Only': { ne: 'स्थानीय / समुदाय मात्र', en: 'Community / Local Only', new: 'स्थानीय पुचः जक', mai: 'स्थानीय समुदाय मात्र', hi: 'स्थानीय / समुदाय केवल' },
  'Status:': { ne: 'स्थिति:', en: 'Status:', new: 'स्थिति:', mai: 'स्थिति:', hi: 'स्थिति:' },
  'All Statuses': { ne: 'सबै स्थितिहरू', en: 'All Statuses', new: 'दक्को स्थिति', mai: 'सब स्थिति', hi: 'सभी स्थितियां' },
  'Missing Only': { ne: 'बेपत्ता मात्र', en: 'Missing Only', new: 'तंगु जक', mai: 'बेपत्ता मात्र', hi: 'केवल लापता' },
  'Possible Matches': { ne: 'सम्भावित मिलानहरू', en: 'Possible Matches', new: 'सम्भावित मिलान', mai: 'सम्भावित मिलान', hi: 'संभावित मिलान' },
  'Found / Safe': { ne: 'भेटिएका / सुरक्षित', en: 'Found / Safe', new: 'लुयावःगु / सुरक्षित', mai: 'भेटल / सुरक्षित', hi: 'मिले / सुरक्षित' },
  'Shelter / Hospital': { ne: 'आश्रय / अस्पताल', en: 'Shelter / Hospital', new: 'शरण / अस्पताल', mai: 'आश्रय / अस्पताल', hi: 'आश्रय / अस्पताल' },
  'Urgency:': { ne: 'प्राथमिकता:', en: 'Urgency:', new: 'प्राथमिकता:', mai: 'प्राथमिकता:', hi: 'प्राथमिकता:' },
  'All Urgencies': { ne: 'सबै प्राथमिकता', en: 'All Urgencies', new: 'दक्को प्राथमिकता', mai: 'सब प्राथमिकता', hi: 'सभी प्राथमिकताएं' },
  'Age Group:': { ne: 'उमेर समूह:', en: 'Age Group:', new: 'उमेर समूह:', mai: 'उमरि समूह:', hi: 'आयु वर्ग:' },
  'All Ages': { ne: 'सबै उमेर समूह', en: 'All Ages', new: 'दक्को उमेर', mai: 'सब उमरि', hi: 'सभी आयु वर्ग' },
  'Child (0-12)': { ne: 'बालबालिका (०-१२)', en: 'Child (0-12)', new: 'मचा (०-१२)', mai: 'बच्चा (०-१२)', hi: 'बच्चे (०-१२)' },
  'Teen (13-17)': { ne: 'किशोरकिशोरी (१३-१७)', en: 'Teen (13-17)', new: 'ल्यायम्ह (१३-१७)', mai: 'किशोर (१३-१७)', hi: 'किशोर (१३-१७)' },
  'Adult (18-59)': { ne: 'वयस्क (१८-५९)', en: 'Adult (18-59)', new: 'वयस्क (१८-५९)', mai: 'वयस्क (१८-५९)', hi: 'वयस्क (१८-५९)' },
  'Senior (60+)': { ne: 'ज्येष्ठ नागरिक (६०+)', en: 'Senior (60+)', new: 'थकालि (६०+)', mai: 'बुजुर्ग (६०+)', hi: 'वरिष्ठ नागरिक (६०+)' },
  'District:': { ne: 'जिल्ला:', en: 'District:', new: 'जिल्ला:', mai: 'जिला:', hi: 'ज़िला:' },
  'All Districts': { ne: 'सबै जिल्लाहरू', en: 'All Districts', new: 'दक्को जिल्ला', mai: 'सब जिला', hi: 'सभी जिले' },
  'Clear Filters': { ne: 'फिल्टरहरू हटाउनुहोस्', en: 'Clear Filters', new: 'फिल्टर लिकायेगु', mai: 'फिल्टर हटाउ', hi: 'फ़िल्टर हटाएं' },
  'Cards View': { ne: 'कार्ड दृश्य', en: 'Cards View', new: 'कार्ड क्यनेगु', mai: 'कार्ड दृश्य', hi: 'कार्ड दृश्य' },
  'Table View': { ne: 'तालिका दृश्य', en: 'Table View', new: 'टेबुल क्यनेगु', mai: 'तालिका दृश्य', hi: 'तालिका दृश्य' },
  'Live Map': { ne: 'प्रत्यक्ष नक्सा', en: 'Live Map', new: 'प्रत्यक्ष नक्सा', mai: 'लाइव नक्शा', hi: 'लाइव मैप' },
  'Review Queue': { ne: 'समीक्षा सूची', en: 'Review Queue', new: 'जाँच धलः', mai: 'समीक्षा सूची', hi: 'समीक्षा कतार' },
  'Pending Sighting & Citizen Matches': { ne: 'पुष्टि हुन बाँकी目擊 मिलानहरू', en: 'Pending Sighting & Citizen Matches', new: 'पुष्टि जुइ ल्यं दूगु मिलान', mai: 'पुष्टि बाँकी目擊 मिलान', hi: 'लंबित目擊 मिलान' },
  'Needs Operator Action': { ne: 'अधिकृतको स्वीकृति आवश्यक', en: 'Needs Operator Action', new: 'अधिकृतया निर्णय माःगु', mai: 'अधिकारीक स्वीकृति आवश्यक', hi: 'ऑपरेटर कार्रवाई आवश्यक' },
  'Confirm Match': { ne: 'मिलान पुष्टि गर्नुहोस्', en: 'Confirm Match', new: 'मिलान पुष्टि यानादिसँ', mai: 'मिलान पुष्टि करू', hi: 'मिलान की पुष्टि करें' },
  'Reject Match': { ne: 'अस्वीकार गर्नुहोस्', en: 'Reject Match', new: 'अस्वीकार यानादिसँ', mai: 'अस्वीकार करू', hi: 'अस्वीकार करें' },
  'Request More Info': { ne: 'थप जानकारी माग्नुहोस्', en: 'Request More Info', new: 'मेगु विवरण फ्वनेगु', mai: 'आर जानकारी मागू', hi: 'अधिक जानकारी मांगें' },
  'Mark as Found': { ne: 'भेटिएको जनाउनुहोस्', en: 'Mark as Found', new: 'लुयावःगु पुष्टि यायेगु', mai: 'भेटल दर्ज करू', hi: 'मिला हुआ चिह्नित करें' },
  'Mark as Safe': { ne: 'सुरक्षित जनाउनुहोस्', en: 'Mark as Safe', new: 'सुरक्षित धकाः च्वयेगु', mai: 'सुरक्षित दर्ज करू', hi: 'सुरक्षित चिह्नित करें' },
  'Transfer to Hospital': { ne: 'अस्पताल पठाउनुहोस्', en: 'Transfer to Hospital', new: 'अस्पताल छ्वयेगु', mai: 'अस्पताल पठाउ', hi: 'अस्पताल भेजें' },
  'Last Seen Location': { ne: 'अन्तिम पटक देखिएको स्थान', en: 'Last Seen Location', new: 'अन्तिम खंगु थाय्', mai: 'अन्तिम देखल स्थान', hi: 'अंतिम बार देखा गया स्थान' },
  'Missing Since': { ne: 'बेपत्ता भएको मिति', en: 'Missing Since', new: 'तंगु दिं', mai: 'बेपत्ता भेल तारीख', hi: 'लापता होने की तारीख' },

  // Weather & DHM River Watch
  'Weather Overview': { ne: 'मौसम अवलोकन', en: 'Weather Overview', new: 'मौसम स्वयेगु', mai: 'मौसम अवलोकन', hi: 'मौसम अवलोकन' },
  'River Watch': { ne: 'नदी अनुगमन', en: 'River Watch', new: 'खुसि अनुगमन', mai: 'नदी निगरानी', hi: 'नदी निगरानी' },
  'Live River Gauges': { ne: 'प्रत्यक्ष नदी जलस्तर केन्द्रहरू', en: 'Live River Gauges', new: 'प्रत्यक्ष खुसि मापन केन्द्र', mai: 'प्रत्यक्ष नदी जलस्तर केन्द्र', hi: 'लाइव नदी जलस्तर गेज' },
  'Gauges': { ne: 'मापन केन्द्रहरू', en: 'Gauges', new: 'केन्द्रत', mai: 'केन्द्रसभ', hi: 'गेज' },
  'Official DHM Flood Watch Alert': { ne: 'जल तथा मौसम विज्ञान विभाग बाढी सतर्कता', en: 'Official DHM Flood Watch Alert', new: 'जल तथा मौसम विभाग खुसिबाः सतर्कता', mai: 'जल तथा मौसम विभाग बाढि अलर्ट', hi: 'जल एवं मौसम विभाग बाढ़ चेतावनी' },
  'Simulated River Surge Telemetry': { ne: 'सिमुलेट गरिएको नदी जलस्तर तथ्याङ्क', en: 'Simulated River Surge Telemetry', new: 'सिमुलेट यानातःगु खुसि तथ्यांक', mai: 'सिमुलेट नदी जलस्तर डेटा', hi: 'सिम्युलेटेड नदी जलस्तर डेटा' },
  'Inspect River Watch Gauges': { ne: 'नदी जलस्तर केन्द्रहरू हेर्नुहोस्', en: 'Inspect River Watch Gauges', new: 'खुसि जलस्तर केन्द्र स्वयादिसँ', mai: 'नदी जलस्तर केन्द्र देखू', hi: 'नदी जलस्तर गेज देखें' },
  'Inspect River Watch Gauges ↗': { ne: 'नदी जलस्तर केन्द्रहरू हेर्नुहोस् ↗', en: 'Inspect River Watch Gauges ↗', new: 'खुसि जलस्तर केन्द्र स्वयादिसँ ↗', mai: 'नदी जलस्तर केन्द्र देखू ↗', hi: 'नदी जलस्तर गेज देखें ↗' },
  'Base Normalization Active': { ne: 'आधारभूत सामान्यीकरण सक्रिय', en: 'Base Normalization Active', new: 'आधारभूत सामान्यीकरण चालु', mai: 'आधारभूत सामान्यीकरण सक्रिय', hi: 'बेस सामान्यीकरण सक्रिय' },
  'Confidence Threshold': { ne: 'विश्वसनीयता सीमा', en: 'Confidence Threshold', new: 'विश्वसनीयता सीमा', mai: 'विश्वसनीयता सीमा', hi: 'विश्वसनीयता सीमा' },
  'Confidence Threshold:': { ne: 'विश्वसनीयता सीमा:', en: 'Confidence Threshold:', new: 'विश्वसनीयता सीमा:', mai: 'विश्वसनीयता सीमा:', hi: 'विश्वसनीयता सीमा:' },
  'Precipitation Rate': { ne: 'वर्षा दर', en: 'Precipitation Rate', new: 'वा वइगु दर', mai: 'वर्षा दर', hi: 'वर्षा दर' },
  'Accumulated Rainfall': { ne: 'कुल वर्षा', en: 'Accumulated Rainfall', new: 'कुल वा वःगु', mai: 'कुल वर्षा', hi: 'कुल बारिश' },
  'Danger Threshold': { ne: 'खतराको सीमा', en: 'Danger Threshold', new: 'खतरा सीमा', mai: 'खतराक सीमा', hi: 'खतरे की सीमा' },
  'Warning Threshold': { ne: 'चेतावनीको सीमा', en: 'Warning Threshold', new: 'चेतावनी सीमा', mai: 'चेतावनी सीमा', hi: 'चेतावनी की सीमा' },
  'Safe Threshold': { ne: 'सुरक्षित सीमा', en: 'Safe Threshold', new: 'सुरक्षित सीमा', mai: 'सुरक्षित सीमा', hi: 'सुरक्षित सीमा' },
  'Hourly Forecast': { ne: 'प्रति घण्टा पूर्वानुमान', en: 'Hourly Forecast', new: 'घौकथं पूर्वानुमान', mai: 'प्रति घंटा पूर्वानुमान', hi: 'प्रति घंटा पूर्वानुमान' },
  'Rain Probability': { ne: 'वर्षाको सम्भावना', en: 'Rain Probability', new: 'वा वइगु सम्भावना', mai: 'वर्षाक सम्भावना', hi: 'बारिश की संभावना' },
  'Minimal / Dry': { ne: 'सुख्खा / वर्षा नहुने', en: 'Minimal / Dry', new: 'गंगु / वा मवइगु', mai: 'सुक्खा / पानि नहि पड़त', hi: 'शुष्क / बारिश नहीं' },
  'Isolated Showers': { ne: 'छिटपुट वर्षा', en: 'Isolated Showers', new: 'भचाभचा वा वइगु', mai: 'छिटपुट वर्षा', hi: 'छिटपुट बारिश' },
  'Scattered Showers': { ne: 'केही स्थानमा वर्षा', en: 'Scattered Showers', new: 'छुं थासय् वा वइगु', mai: 'किछु स्थानमे वर्षा', hi: 'कुछ स्थानों पर वर्षा' },
  'Rain Likely': { ne: 'वर्षाको सम्भावना', en: 'Rain Likely', new: 'वा वइगु सम्भावना दु', mai: 'वर्षाक भारी सम्भावना', hi: 'बारिश की संभावना' },
  'Continuous Rain': { ne: 'निरन्तर भारी वर्षा', en: 'Continuous Rain', new: 'झुरुझुरु वा वइगु', mai: 'लगातार भारी वर्षा', hi: 'लगातार भारी बारिश' },
  'Dry atmospheric profile with negligible rain risk today.': {
    ne: 'आज वर्षाको सम्भावना न्यून छ।',
    en: 'Dry atmospheric profile with negligible rain risk today.',
    new: 'थौं वा वइगु सम्भावना मदु।',
    mai: 'आइझुक वर्षाक कोनो खतरा नहि अछि।',
    hi: 'आज बारिश की संभावना नगण्य है।'
  },
  'Extreme Rain': { ne: 'अत्यधिक वर्षा', en: 'Extreme Rain', new: 'अति भारी वा', mai: 'अत्यधिक वर्षा', hi: 'अत्यधिक बारिश' },
  'Flash Flood': { ne: 'आकस्मिक बाढी', en: 'Flash Flood', new: 'आकस्मिक खुसिबाः', mai: 'अचानक बाढि', hi: 'अचानक बाढ़' },
  'Normal Conditions': { ne: 'सामान्य अवस्था', en: 'Normal Conditions', new: 'सामान्य अवस्था', mai: 'सामान्य स्थिति', hi: 'सामान्य स्थिति' },
  'Synchronized live': { ne: 'प्रत्यक्ष अद्यावधिक', en: 'Synchronized live', new: 'प्रत्यक्ष अद्यावधिक', mai: 'प्रत्यक्ष अद्यावधिक', hi: 'लाइव अपडेट' },
  'DHM Ground Telemetry': { ne: 'जल तथा मौसम विभाग प्रत्यक्ष तथ्याङ्क', en: 'DHM Ground Telemetry', new: 'जल तथा मौसम विभाग प्रत्यक्ष तथ्यांक', mai: 'जल तथा मौसम विभाग डेटा', hi: 'जल एवं मौसम विभाग डेटा' },

  // Hospital Matching
  'Hospital Bed Network Capacity': { ne: 'सरकारी अस्पताल बेड नेटवर्क क्षमता', en: 'Hospital Bed Network Capacity', new: 'अस्पताल बेड नेटवर्क क्षमता', mai: 'अस्पताल बेड नेटवर्क क्षमता', hi: 'अस्पताल बेड नेटवर्क क्षमता' },
  'Dispatch Ambulance': { ne: 'एम्बुलेन्स पठाउनुहोस्', en: 'Dispatch Ambulance', new: 'एम्बुलेन्स छ्वयेगु', mai: 'एम्बुलेन्स पठाउ', hi: 'एम्बुलेंस भेजें' },
  'Call Hospital': { ne: 'अस्पतालमा फोन गर्नुहोस्', en: 'Call Hospital', new: 'अस्पतालय् फोन यानादिसँ', mai: 'अस्पताल फोन करू', hi: 'अस्पताल फोन करें' },
  'Get Directions': { ne: 'मार्ग हेर्नुहोस्', en: 'Get Directions', new: 'लँपु स्वयादिसँ', mai: 'रस्ता देखू', hi: 'दिशा-निर्देश देखें' },
  'Patient Registry': { ne: 'बिरामी दर्ता पुस्तिका', en: 'Patient Registry', new: 'ल्वगी दर्ता', mai: 'बिरामी दर्ता', hi: 'मरीज रजिस्टर' },
  'Submit Patient': { ne: 'नयाँ बिरामी विवरण दर्ता', en: 'Submit Patient', new: 'न्हूम्ह ल्वगी दर्ता', mai: 'नव बिरामी दर्ता', hi: 'नया मरीज दर्ज करें' },
  'Match Confidence': { ne: 'मिलान प्रतिशत', en: 'Match Confidence', new: 'मिलान प्रतिशत', mai: 'मिलान प्रतिशत', hi: 'मिलान प्रतिशत' },

  // General Controls
  'Search demo data...': { ne: 'डेमो तथ्याङ्क खोज्नुहोस्...', en: 'Search demo data...', new: 'डेमो तथ्यांक मालादिसँ...', mai: 'डेमो डेटा खोजू...', hi: 'डेमो डेटा खोजें...' },
  'Change Language': { ne: 'भाषा परिवर्तन गर्नुहोस्', en: 'Change Language', new: 'भाषा हिलादिसँ', mai: 'भाषा बदलू', hi: 'भाषा बदलें' },
  'Change Language / भाषा परिवर्तन गर्नुहोस्': { ne: 'भाषा परिवर्तन गर्नुहोस्', en: 'Change Language', new: 'भाषा हिलादिसँ', mai: 'भाषा बदलू', hi: 'भाषा बदलें' },
  'Language / भाषा': { ne: 'भाषा', en: 'Language', new: 'भाषा', mai: 'भाषा', hi: 'भाषा' },
  'Language Settings / भाषा सेटिङ': { ne: 'भाषा सेटिङ', en: 'Language Settings', new: 'भाषा सेटिङ', mai: 'भाषा सेटिंग', hi: 'भाषा सेटिंग्स' },
  'Choose Language': { ne: 'भाषा चयन गर्नुहोस्', en: 'Choose Language', new: 'भाषा स्वयादिसँ', mai: 'भाषा चुनू', hi: 'भाषा चुनें' },
  'Open Detailed Language Settings': { ne: 'विस्तृत भाषा सेटिङ खोल्नुहोस्', en: 'Open Detailed Language Settings', new: 'विस्तृत भाषा सेटिङ खोलादिसँ', mai: 'विस्तृत भाषा सेटिंग खोलू', hi: 'विस्तृत भाषा सेटिंग्स खोलें' },
  'Settings': { ne: 'सेटिङ', en: 'Settings', new: 'सेटिङ', mai: 'सेटिंग', hi: 'सेटिंग्स' },
  'Selected language applies across the entire SAHAYAK portal.': { ne: 'चयन गरिएको भाषा सम्पूर्ण SAHAYAK पोर्टलमा लागू हुन्छ।', en: 'Selected language applies across the entire SAHAYAK portal.', new: 'स्वयातःगु भाषा सम्पूर्ण SAHAYAK पोर्टलय् लागू जुयाः।', mai: 'चुनल भाषा पूरा SAHAYAK पोर्टल पर लागू होइत अछि।', hi: 'चयनित भाषा पूरे SAHAYAK पोर्टल पर लागू होती है।' },
  'Select any available language. All pages, alerts, and data update instantly.': { ne: 'उपलब्ध कुनै पनि भाषा चयन गर्नुहोस्। सबै पृष्ठ, सतर्कता र तथ्याङ्क तुरुन्त अद्यावधिक हुन्छन्।', en: 'Select any available language. All pages, alerts, and data update instantly.', new: 'उपलब्ध भाषा स्वयादिसँ। दक्को पृष्ठ, सतर्कता व तथ्यांक तुरुन्त अद्यावधिक जुयाः।', mai: 'उपलब्ध कोनो भाषा चुनू। सभ पृष्ठ, अलर्ट आ डेटा तुरन्त अपडेट होइत अछि।', hi: 'कोई भी उपलब्ध भाषा चुनें। सभी पृष्ठ, अलर्ट और डेटा तुरंत अपडेट होते हैं।' },
  'Active': { ne: 'सक्रिय', en: 'Active', new: 'चालु', mai: 'सक्रिय', hi: 'सक्रिय' },
  'Select': { ne: 'चयन गर्नुहोस्', en: 'Select', new: 'स्वयादिसँ', mai: 'चुनू', hi: 'चुनें' },
  'Global multi-language synchronization enabled': { ne: 'विश्वव्यापी बहुभाषिक समक्रमण सक्षम छ', en: 'Global multi-language synchronization enabled', new: 'विश्वव्यापी बहुभाषिक समक्रमण सक्षम दु', mai: 'वैश्विक बहुभाषिक सिंक्रोनाइजेशन सक्षम अछि', hi: 'वैश्विक बहुभाषी समन्वयन सक्षम है' },
  'Done / बन्द गर्नुहोस्': { ne: 'सम्पन्न / बन्द गर्नुहोस्', en: 'Done', new: 'जुयाः / बन्द यानादिसँ', mai: 'सम्पन्न / बन्द करू', hi: 'हो गया / बंद करें' },
  'System Status': { ne: 'प्रणाली स्थिति', en: 'System Status', new: 'प्रणाली स्थिति', mai: 'प्रणाली स्थिति', hi: 'सिस्टम स्थिति' },
  'Operational': { ne: 'सञ्चालनमा', en: 'Operational', new: 'सञ्चालनय्', mai: 'चालू', hi: 'चालू' },
  'Notifications': { ne: 'सूचनाहरू', en: 'Notifications', new: 'सुचं', mai: 'सूचना', hi: 'सूचनाएं' },
  'No new notifications': { ne: 'कुनै नयाँ सूचना छैन', en: 'No new notifications', new: 'छुं नं न्हूगु सुचं मदु', mai: 'कोनो नव सूचना नहि', hi: 'कोई नई सूचना नहीं' },
  'Clear All': { ne: 'सबै हटाउनुहोस्', en: 'Clear All', new: 'दक्को लिकायेगु', mai: 'सब हटाउ', hi: 'सभी हटाएं' },
  'Demo Search Results': { ne: 'डेमो खोज परिणामहरू', en: 'Demo Search Results', new: 'खोज लिच्वः', mai: 'खोज परिणाम', hi: 'खोज परिणाम' }
};

function restoreEnglishText(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return text;

  for (const dictionary of Object.values(TRANSLATIONS)) {
    for (const [key, value] of Object.entries(dictionary)) {
      if (value === trimmed && TRANSLATIONS.en[key] !== undefined) {
        return text.replace(trimmed, TRANSLATIONS.en[key]);
      }
    }
  }

  for (const [phrase, translations] of Object.entries(COMMON_PHRASES)) {
    if (translations.en === trimmed) return text;
    for (const language of SUPPORTED_LANGUAGES) {
      if (language.code !== 'en' && translations[language.code] === trimmed) {
        return text.replace(trimmed, translations.en);
      }
    }
  }

  return text;
}

function normalizeToEnglish(text: string): string {
  if (!text || typeof text !== 'string') return text;
  for (const dictionary of Object.values(TRANSLATIONS)) {
    for (const [key, value] of Object.entries(dictionary)) {
      const english = TRANSLATIONS.en[key];
      if (value && english && value === text.trim() && value !== english) {
        return text.replace(text.trim(), english);
      }
    }
  }
  for (const [phrase, translations] of Object.entries(COMMON_PHRASES)) {
    for (const language of SUPPORTED_LANGUAGES) {
      const translated = translations[language.code];
      if (language.code !== 'en' && translated === text.trim() && translations.en && translated !== translations.en) {
        return text.replace(text.trim(), translations.en);
      }
    }
  }
  return text;
}

function hasMixedWritingSystems(text: string): boolean {
  const hasLatin = /[A-Za-z]/.test(text);
  const hasDevanagari = /[\u0900-\u097F]/.test(text);
  return hasLatin && hasDevanagari;
}

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  translateDynamic: (text: string, lang?: Language) => string;
  currentLanguageOption: LanguageOption;
  languages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'sahayak_app_language_v2';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language;
      if (stored && SUPPORTED_LANGUAGES.some(l => l.code === stored)) {
        return stored;
      }
      return 'en';
    }
    return 'en';
  });

  const setLanguage = useCallback((lang: Language) => {
    if (lang === language) return;
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
      document.documentElement.lang = lang;
      window.location.reload();
    }
  }, [language]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  // Translate dynamic content or phrase
  const translateDynamic = useCallback((text: string, targetLang?: Language): string => {
    const lang = targetLang || language;
    if (!text || typeof text !== 'string') return text;
    const canonicalText = normalizeToEnglish(text);
    if (lang === 'en') return canonicalText;

    const trimmed = canonicalText.trim();

    // 1. Direct dictionary match
    const dict = TRANSLATIONS[lang];
    if (dict && dict[trimmed]) {
      return dict[trimmed];
    }

    // 2. Common phrase dictionary match
    if (COMMON_PHRASES[trimmed] && COMMON_PHRASES[trimmed][lang]) {
      return COMMON_PHRASES[trimmed][lang];
    }

    // Case-insensitive check
    for (const [phrase, trans] of Object.entries(COMMON_PHRASES)) {
      if (phrase.toLowerCase() === trimmed.toLowerCase() && trans[lang]) {
        return trans[lang];
      }
    }

    const normalSituation = canonicalText.match(/^NORMAL SITUATION: Weather conditions in (.+) are calm and dry \(([^)]+)\)\. Baseline (flood|landslide) hazard is safe and minimal\.$/);
    if (normalSituation) {
      const [, locationName, measurements, hazard] = normalSituation;
      const hazardLabels: Record<Language, string> = { ne: hazard === 'flood' ? 'बाढी' : 'पहिरो', en: hazard, new: hazard === 'flood' ? 'खुसिबाः' : 'चलः', mai: hazard === 'flood' ? 'बाढि' : 'पहिरो', hi: hazard === 'flood' ? 'बाढ़' : 'भूस्खलन' };
      const normalLabels: Record<Language, string> = { ne: 'सामान्य अवस्था', en: 'NORMAL SITUATION', new: 'सामान्य अवस्था', mai: 'सामान्य स्थिति', hi: 'सामान्य स्थिति' };
      const weatherLabels: Record<Language, string> = { ne: `${locationName} मा मौसम शान्त र सुख्खा छ`, en: `Weather conditions in ${locationName} are calm and dry`, new: `${locationName} य् मौसम शान्त व गंगु दु`, mai: `${locationName} मे मौसम शान्त आ सुख्ख अछि`, hi: `${locationName} में मौसम शांत और शुष्क है` };
      const suffix: Record<Language, string> = { ne: `आधारभूत ${hazardLabels.ne} खतरा सुरक्षित र न्यूनतम छ।`, en: `Baseline ${hazardLabels.en} hazard is safe and minimal.`, new: `आधारभूत ${hazardLabels.new} खतरा सुरक्षित व न्यून दु।`, mai: `आधारभूत ${hazardLabels.mai} खतरा सुरक्षित आ न्यून अछि।`, hi: `आधारभूत ${hazardLabels.hi} खतरा सुरक्षित और न्यूनतम है।` };
      return `${normalLabels[lang]}: ${weatherLabels[lang]} (${measurements})। ${suffix[lang]}`;
    }

    const rainfallFactor = canonicalText.match(/^24-Hour Rainfall: ([\d.]+) mm \((.+)\)$/);
    if (rainfallFactor) {
      const [, amount, condition] = rainfallFactor;
      const conditions: Record<string, Record<Language, string>> = {
        'Well below 50 mm DHM Caution Mark': { ne: 'DHM को ५० मिमि सावधानी चिन्हभन्दा धेरै कम', en: condition, new: 'DHM ५० मिमि सावधानी चिन्हया धेरै क्वय्', mai: 'DHM ५० मिमि सावधानी चिन्हसँ बहुत कम', hi: 'DHM के ५० मिमी सावधानी चिह्न से बहुत कम' },
        'Moderate seasonal shower': { ne: 'मध्यम मौसमी वर्षा', en: condition, new: 'मध्यम मौसमी वा', mai: 'मध्यम मौसमी वर्षा', hi: 'मध्यम मौसमी बारिश' },
        'Exceeds DHM 50 mm Caution Mark': { ne: 'DHM को ५० मिमि सावधानी चिन्हभन्दा बढी', en: condition, new: 'DHM ५० मिमि सावधानी चिन्हया च्वे', mai: 'DHM ५० मिमि सावधानी चिन्हसँ अधिक', hi: 'DHM के ५० मिमी सावधानी चिह्न से अधिक' }
      };
      const translatedCondition = conditions[condition]?.[lang] || condition;
      return `${lang === 'en' ? '24-Hour Rainfall' : lang === 'hi' ? '२४ घंटे की वर्षा' : lang === 'mai' ? '२४ घंटाक वर्षा' : '२४ घण्टे वर्षा'}: ${amount} mm (${translatedCondition})`;
    }

    const fixedFactors: Record<string, Record<Language, string>> = {
      'Current Precipitation Rate:': { ne: 'हालको वर्षा दर:', en: 'Current Precipitation Rate:', new: 'हालया वा दर:', mai: 'वर्तमान वर्षा दर:', hi: 'वर्तमान वर्षा दर:' },
      'River Basins: Normal seasonal discharge within embankments': { ne: 'नदी बेसिन: बाँधभित्र सामान्य मौसमी बहाव', en: 'River Basins: Normal seasonal discharge within embankments', new: 'खुसि बेसिन: बाँधया भित्र सामान्य मौसमी बहाव', mai: 'नदी बेसिन: तटबन्धक भीतर सामान्य मौसमी बहाव', hi: 'नदी बेसिन: तटबंधों के भीतर सामान्य मौसमी बहाव' },
      'Soil Saturation: Low / Normal seasonal baseline': { ne: 'माटोको संतृप्ति: न्यून / सामान्य मौसमी आधार', en: 'Soil Saturation: Low / Normal seasonal baseline', new: 'माटो संतृप्ति: न्यून / सामान्य मौसमी आधार', mai: 'माटिक संतृप्ति: कम / सामान्य मौसमी आधार', hi: 'मिट्टी संतृप्ति: कम / सामान्य मौसमी आधार' },
      'Slope Drainage: Stable with no hydrostatic pore-pressure': { ne: 'भिरालो निकास: जलस्थैतिक दबाबबिना स्थिर', en: 'Slope Drainage: Stable with no hydrostatic pore-pressure', new: 'भिरालो निकास: जलस्थैतिक दबाब बिना स्थिर', mai: 'ढलान जलनिकास: जलस्थैतिक दबाव बिना स्थिर', hi: 'ढलान जलनिकासी: जलस्थैतिक छिद्र-दबाव के बिना स्थिर' },
      'Mountain corridors dry with normal highway transit': { ne: 'पहाडी मार्गहरू सुख्खा र सामान्य राजमार्ग आवागमन', en: 'Mountain corridors dry with normal highway transit', new: 'पहाडी लँपुत गंगु व सामान्य राजमार्ग आवागमन', mai: 'पहाड़ी मार्ग सुक्ख आ सामान्य राजमार्ग आवागमन', hi: 'पहाड़ी मार्ग सूखे और सामान्य राजमार्ग आवागमन' },
      'Plain/Valley terrain with zero slope hazard': { ne: 'मैदानी/उपत्यका भूभागमा पहिरोको खतरा छैन', en: 'Plain/Valley terrain with zero slope hazard', new: 'मैदान/उपत्यका थाय् भिरालो खतरा मदु', mai: 'मैदानी/घाटी भूभागमे ढलानक खतरा नहि', hi: 'मैदानी/घाटी क्षेत्र में ढलान का कोई खतरा नहीं' }
    };
    for (const [prefix, translations] of Object.entries(fixedFactors)) {
      if (canonicalText === prefix) return translations[lang];
    }

    const precipitationFactor = canonicalText.match(/^Current Precipitation Rate: ([\d.]+) mm\/h \((.+)\)$/);
    if (precipitationFactor) {
      const [, rate, condition] = precipitationFactor;
      const translatedCondition = condition === 'Dry / Normal' ? (lang === 'ne' ? 'सुख्खा / सामान्य' : lang === 'hi' ? 'शुष्क / सामान्य' : lang === 'mai' ? 'सुख्खा / सामान्य' : lang === 'new' ? 'गंगु / सामान्य' : condition) : condition;
      const label = lang === 'ne' ? 'हालको वर्षा दर' : lang === 'hi' ? 'वर्तमान वर्षा दर' : lang === 'mai' ? 'वर्तमान वर्षा दर' : lang === 'new' ? 'हालया वा दर' : 'Current Precipitation Rate';
      return `${label}: ${rate} mm/h (${translatedCondition})`;
    }

    const floodAlert = canonicalText.match(/^Flood warning at (.+), (.+)$/i);
    if (floodAlert) {
      const [, place, district] = floodAlert;
      const labels: Record<Language, string> = { ne: 'बाढीको चेतावनी', en: 'Flood warning at', new: 'खुसिबाः सतर्कता', mai: 'बाढिक चेतावनी', hi: 'बाढ़ की चेतावनी' };
      return `${labels[lang]} ${place}, ${district}`;
    }

    const alertSummary = canonicalText.match(/^Basin:\s*(.+?)\s+Elevation:\s*([\d.]+)\s+Warning level:\s*([\d.]+)\s+Water level:\s*([\d.]+)$/i);
    if (alertSummary) {
      const [, basin, elevation, warningLevel, waterLevel] = alertSummary;
      const labels: Record<Language, [string, string, string, string]> = {
        ne: ['जलाधार:', 'उचाइ:', 'चेतावनी तह:', 'जलस्तर:'],
        en: ['Basin:', 'Elevation:', 'Warning level:', 'Water level:'],
        new: ['खुसि बेसिन:', 'उचाइ:', 'सतर्कता स्तर:', 'लःया स्तर:'],
        mai: ['बेसिन:', 'उँचाइ:', 'चेतावनी स्तर:', 'पानिक स्तर:'],
        hi: ['बेसिन:', 'ऊंचाई:', 'चेतावनी स्तर:', 'जल स्तर:']
      };
      const [basinLabel, elevationLabel, warningLabel, waterLabel] = labels[lang];
      return `${basinLabel}${basin} ${elevationLabel}${elevation} ${warningLabel}${warningLevel} ${waterLabel}${waterLevel}`;
    }

    return canonicalText;
  }, [language]);

  // Main t function
  const t = useCallback((key: string, fallback?: string): string => {
    if (!key) return fallback || '';

    // If key exists directly in current language dict
    const dict = TRANSLATIONS[language];
    if (dict && dict[key] !== undefined) {
      return dict[key];
    }

    // If fallback is provided and in current language dict
    if (fallback && dict && dict[fallback] !== undefined) {
      return dict[fallback];
    }

    // Check if key itself is a common phrase
    if (COMMON_PHRASES[key] && COMMON_PHRASES[key][language]) {
      return COMMON_PHRASES[key][language];
    }

    // Check if fallback is a common phrase
    if (fallback && COMMON_PHRASES[fallback] && COMMON_PHRASES[fallback][language]) {
      return COMMON_PHRASES[fallback][language];
    }

    // Try dynamic translation on the text or fallback
    const targetText = normalizeToEnglish(fallback || key);
    if (language !== 'en') {
      const dyn = translateDynamic(targetText, language);
      if (dyn !== targetText) {
        return dyn;
      }
    }

    // Fallback to English dictionary if key is a code (e.g. 'nav.home')
    if (TRANSLATIONS.en && TRANSLATIONS.en[key] !== undefined) {
      return TRANSLATIONS.en[key];
    }

    return fallback || key;
  }, [language, translateDynamic]);

  // ==========================================
  // RUNTIME DOM AUTO-LOCALIZER
  // Guarantees all visible text, tooltips, placeholders, and popups change to selected language
  // ==========================================
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let isScheduled = false;

    const translateDomTree = () => {
      isScheduled = false;

      // When language is English, restore original texts
      if (language === 'en') {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
        let node: Node | null;
        while ((node = walker.nextNode())) {
          const currentText = node.nodeValue || '';
          const cachedText = (node as any).__sahayak_orig_text;
          const normalizedText = normalizeToEnglish(currentText);
          const normalizedCachedText = cachedText ? normalizeToEnglish(cachedText) : '';
          node.nodeValue = normalizedText || normalizedCachedText || currentText;
        }
        // Restore input placeholders
        document.querySelectorAll('input, textarea').forEach(el => {
          const input = el as HTMLInputElement | HTMLTextAreaElement;
          if ((input as any).__sahayak_orig_placeholder !== undefined) {
            input.placeholder = normalizeToEnglish(input.placeholder) || normalizeToEnglish((input as any).__sahayak_orig_placeholder);
          }
        });
        // Restore title and aria-label
        document.querySelectorAll('[title], [aria-label]').forEach(el => {
          const htmlEl = el as HTMLElement;
          if ((htmlEl as any).__sahayak_orig_title !== undefined) {
            htmlEl.title = normalizeToEnglish(htmlEl.title) || normalizeToEnglish((htmlEl as any).__sahayak_orig_title);
          }
          if ((htmlEl as any).__sahayak_orig_arialabel !== undefined) {
            htmlEl.setAttribute('aria-label', normalizeToEnglish(htmlEl.getAttribute('aria-label') || '') || normalizeToEnglish((htmlEl as any).__sahayak_orig_arialabel));
          }
        });
        return;
      }

      // When language is NOT English, localize text nodes
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode(node) {
            const parent = node.parentElement;
            if (!parent) return NodeFilter.FILTER_REJECT;
            const tag = parent.tagName.toLowerCase();
            if (['script', 'style', 'code', 'pre', 'noscript'].includes(tag)) {
              return NodeFilter.FILTER_REJECT;
            }
            if (parent.closest('[data-no-translate]')) {
              return NodeFilter.FILTER_REJECT;
            }
            const val = node.nodeValue?.trim();
            if (!val || val.length < 2) return NodeFilter.FILTER_REJECT;
            return NodeFilter.FILTER_ACCEPT;
          }
        }
      );

      let node: Node | null;
      while ((node = walker.nextNode())) {
        const currentVal = node.nodeValue || '';
        const baseVal = normalizeToEnglish(currentVal);

        // Skip if already predominantly in Devanagari script (range \u0900-\u097F)
        const devanagariCount = (currentVal.match(/[\u0900-\u097F]/g) || []).length;
        if (devanagariCount > currentVal.length * 0.4 && !/[A-Za-z]/.test(currentVal) && (node as any).__sahayak_orig_text === undefined) {
          continue;
        }

        const baseText = baseVal || (node as any).__sahayak_orig_text || currentVal;
        (node as any).__sahayak_orig_text = baseText;
        const translated = translateDynamic(baseText, language);

        // Only replace a complete text node. A partial replacement can splice
        // two languages into one sentence, especially around dynamic values.
        if (translated !== currentVal && translated !== baseText && !hasMixedWritingSystems(translated)) {
          node.nodeValue = translated;
        }
      }

      // Also translate input & textarea placeholders
      document.querySelectorAll('input, textarea').forEach(el => {
        const input = el as HTMLInputElement | HTMLTextAreaElement;
        if (!input.placeholder) return;
        if ((input as any).__sahayak_orig_placeholder === undefined) {
          (input as any).__sahayak_orig_placeholder = input.placeholder;
        }
        const basePlaceholder = (input as any).__sahayak_orig_placeholder || input.placeholder;
        const translated = translateDynamic(basePlaceholder, language);
        if (translated !== input.placeholder) {
          input.placeholder = translated;
        }
      });

      // Also translate button/link titles and aria-labels
      document.querySelectorAll('[title], [aria-label]').forEach(el => {
        const htmlEl = el as HTMLElement;
        if (htmlEl.title) {
          if ((htmlEl as any).__sahayak_orig_title === undefined) {
            (htmlEl as any).__sahayak_orig_title = htmlEl.title;
          }
          const base = (htmlEl as any).__sahayak_orig_title;
          const translated = translateDynamic(base, language);
          if (translated !== htmlEl.title) {
            htmlEl.title = translated;
          }
        }
        const ariaLabel = htmlEl.getAttribute('aria-label');
        if (ariaLabel) {
          if ((htmlEl as any).__sahayak_orig_arialabel === undefined) {
            (htmlEl as any).__sahayak_orig_arialabel = ariaLabel;
          }
          const base = (htmlEl as any).__sahayak_orig_arialabel;
          const translated = translateDynamic(base, language);
          if (translated !== ariaLabel) {
            htmlEl.setAttribute('aria-label', translated);
          }
        }
      });
    };

    // Run once immediately
    translateDomTree();

    // Observe subsequent DOM mutations (modals, new tabs, map popups, dynamic cards)
    const observer = new MutationObserver(() => {
      if (!isScheduled) {
        isScheduled = true;
        window.requestAnimationFrame(translateDomTree);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });

    return () => {
      observer.disconnect();
    };
  }, [language, translateDynamic]);

  const currentLanguageOption = useMemo(
    () => SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0],
    [language]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        translateDynamic,
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
