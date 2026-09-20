import fs from 'fs';

const mockFile = 'src/data/mock.ts';
let mockData = fs.readFileSync(mockFile, 'utf8');

const newNews = `
  { id: 'nw-4', title: 'Viral Video: Landslide buries entire village in Rasuwa', source: 'Social Media', timestamp: '30 mins ago', locationId: 'loc-3', category: 'Rumor', severity: 'WARNING', verified: false, verificationStatus: 'MISLEADING', verificationExplanation: 'Video is from a 2019 incident in a different region. No current reports of landslides in that specific area.', summary: 'A viral video claiming to show a massive landslide burying homes.' }
`;

mockData = mockData.replace(
  /\{ id: 'nw-3', title: 'Rumor: KTM Airport Closed', source: 'Social Media', timestamp: '1 hour ago', locationId: 'loc-1', category: 'Infrastructure', severity: 'WARNING', verified: false, summary: 'Unverified claims of runway flooding\.' \}/,
  `{ id: 'nw-3', title: 'Rumor: KTM Airport Closed', source: 'Social Media', timestamp: '1 hour ago', locationId: 'loc-1', category: 'Infrastructure', severity: 'WARNING', verified: false, verificationStatus: 'LIKELY FALSE', verificationExplanation: 'Civil Aviation Authority confirms runways are clear and operational. Supporting claims are from unverified accounts.', summary: 'Unverified claims of runway flooding.' },${newNews}`
);

fs.writeFileSync(mockFile, mockData);
console.log('Updated mock news');
