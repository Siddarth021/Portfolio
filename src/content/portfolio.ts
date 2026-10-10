import type { Profile, Stop } from './types';

/*
 * All portfolio content lives here for now.
 * In the next step this file is replaced by data from Supabase,
 * edited through the private /admin page.
 */

const gh = (repo: string) => `https://github.com/Siddarth021/${repo}`;
const drive = (id: string) => `https://drive.google.com/file/d/${id}/view?usp=sharing`;

export const profile: Profile = {
  name: 'Siddarth Gundeti',
  roles: [
    { label: 'AI/ML Engineer', kind: 'primary' },
    { label: 'Designer', kind: 'secondary' },
    { label: 'SDE · learning', kind: 'learning' },
  ],
};

export const stops: Stop[] = [
  {
    slug: 'intro',
    title: 'Intro',
    part: 'cpu',
    partName: 'CPU',
    file: 'intro.sys',
    cta: 'Dive in',
    blocks: [
      { type: 'checks', items: [
        { label: 'Curiosity', status: 'OK' },
        { label: 'Neural networks', status: 'OK' },
        { label: 'Chess instincts', status: 'OK' },
        { label: 'Design eye', status: 'OK' },
      ] },
      { type: 'lead', text: "Hello, world. I'm Siddarth." },
      { type: 'text', text: 'I teach machines to see, and I think three moves ahead.' },
    ],
  },
  {
    slug: 'about',
    title: 'About me',
    part: 'motherboard',
    partName: 'Motherboard',
    file: 'about_me.sys',
    cta: 'Explore',
    blocks: [
      { type: 'lead', text: "I'm a Computer Science student at IIIT Sri City, growing into an AI/ML engineer." },
      { type: 'text', text: 'I love building applications that take over repetitive work, so people can spend their time on things that need a human.' },
      { type: 'facts', items: [
        { label: 'The Knights', value: 'Board 4/5' },
        { label: 'chess.com rating', value: '~1100' },
        { label: 'Side role', value: 'Team designer' },
      ] },
    ],
  },
  {
    slug: 'skills',
    title: 'Skills',
    part: 'cores',
    partName: 'CPU cores',
    file: 'skills.sys',
    cta: 'Open',
    blocks: [
      { type: 'text', text: 'One core per skill set. Hover a skill to flip it.' },
      { type: 'skills', groups: [
        { name: 'Machine learning', skills: [
          { name: 'PyTorch', icon: 'pytorch' }, { name: 'TensorFlow', icon: 'tensorflow' },
          { name: 'scikit-learn', icon: 'scikitlearn' }, { name: 'NumPy', icon: 'numpy' },
          { name: 'Pandas', icon: 'pandas' }, { name: 'Matplotlib' },
        ] },
        { name: 'Languages', skills: [
          { name: 'Python', icon: 'python' }, { name: 'C', icon: 'c' },
          { name: 'C++', icon: 'cplusplus' }, { name: 'Java', icon: 'openjdk' },
        ] },
        { name: 'Data and tools', skills: [
          { name: 'MySQL', icon: 'mysql' }, { name: 'SQLite', icon: 'sqlite' }, { name: 'MongoDB', icon: 'mongodb' },
          { name: 'Docker', icon: 'docker' }, { name: 'Git', icon: 'git' }, { name: 'GitHub', icon: 'github' },
          { name: 'Postman', icon: 'postman' },
        ] },
        { name: 'Design', skills: [
          { name: 'Figma', icon: 'figma' }, { name: 'Canva', icon: 'canva' },
        ] },
        { name: 'Boost', note: 'learning', skills: [
          { name: 'HTML', icon: 'html5' }, { name: 'CSS', icon: 'css3' },
          { name: 'JavaScript', icon: 'javascript' }, { name: 'Flask', icon: 'flask' },
        ] },
      ] },
    ],
  },
  {
    slug: 'projects',
    title: 'Projects',
    part: 'ram',
    partName: 'RAM',
    file: 'projects.sys',
    cta: 'Inspect',
    blocks: [
      { type: 'text', text: 'Six sticks loaded, one per project. Open any repo.' },
      { type: 'cards', items: [
        { title: 'Network Security', meta: 'DIMM 1', url: gh('Network-Security'), linkLabel: 'View repo' },
        { title: 'End-to-End ML Pipeline', meta: 'DIMM 2', url: gh('End-to-End-ML-Project'), linkLabel: 'View repo' },
        { title: 'Signature Verification', meta: 'DIMM 3 · ~98% accuracy', url: gh('secure-signature-verification'), linkLabel: 'View repo' },
        { title: 'Nasiko README Generator', meta: 'DIMM 4', url: gh('nasiko'), linkLabel: 'View repo' },
        { title: 'Xploreo', meta: 'DIMM 5 · team project', url: 'https://github.com/IIIT-Sricity-FSD-2024-2028/23_Xploreo', linkLabel: 'View repo' },
        { title: 'ATM System', meta: 'DIMM 6 · Java, MVC', url: gh('ATM_MVC'), linkLabel: 'View repo' },
      ] },
    ],
  },
  {
    slug: 'experience',
    title: 'Experience',
    part: 'cache',
    partName: 'Cache',
    file: 'experience.sys',
    cta: 'Load',
    blocks: [
      { type: 'role', title: 'Research Intern', org: 'COGSI Lab, IIIT Hyderabad', period: 'Jun – Aug 2026', points: [
        'Reproduced LRH-Net and IMLE-Net within 1% of the original results.',
        'Designed and implemented a novel deep-learning architecture for self-supervised learning.',
      ] },
    ],
  },
  {
    slug: 'education',
    title: 'Education',
    part: 'ssd',
    partName: 'SSD',
    file: 'education.sys',
    cta: 'Enter',
    blocks: [
      { type: 'role', title: 'B.Tech, Computer Science and Engineering', org: 'IIIT Sri City', period: '2024 – present', points: [] },
      { type: 'facts', items: [{ label: 'GPA', value: '8.74 / 10' }] },
      { type: 'tags', label: 'Coursework', items: [
        'DSA', 'Operating Systems', 'DBMS', 'Computer Organization', 'Theory of Computation',
        'Discrete Math', 'Linear Algebra', 'Probability and Statistics',
      ] },
    ],
  },
  {
    slug: 'research',
    title: 'Research',
    part: 'coprocessor',
    partName: 'AI co-processor',
    file: 'research.sys',
    cta: 'Run',
    blocks: [
      { type: 'cards', items: [
        { title: 'ECGAN++', body: 'Edge-guided GANs for semantic image synthesis, extended with hierarchical graph contrastive learning.', tags: ['GANs', 'Contrastive learning'], url: gh('ECGAN'), linkLabel: 'View repo' },
        { title: 'RHG-CLIP', meta: '92.65% base accuracy · CIFAR-100', body: 'CLIP + GNN with Riemannian Hamiltonian dynamics for few-shot class-incremental learning.', tags: ['CLIP', 'GNN', 'Few-shot'], url: gh('FSCIL_Improved'), linkLabel: 'View repo' },
      ] },
    ],
  },
  {
    slug: 'creative',
    title: 'Creative',
    part: 'gpu',
    partName: 'GPU',
    file: 'creative.gpu',
    cta: 'Render',
    blocks: [
      { type: 'lead', text: "I design because I enjoy it, and I'm growing it as a second path." },
      { type: 'cards', label: 'Made for The Knights, IIIT Sri City', items: [
        { title: 'Chess invitation poster', meta: 'Poster' },
        { title: 'Heritage jersey', meta: 'Jersey · SIDD 14' },
        { title: 'Knights jersey', meta: 'Jersey · 01' },
      ] },
    ],
  },
  {
    slug: 'achievements',
    title: 'Achievements',
    part: 'psu',
    partName: 'Power supply',
    file: 'achievements.sys',
    cta: 'Unlock',
    blocks: [
      { type: 'stats', items: [
        { value: 'Top 600', label: 'Amazon ML Challenge 2026' },
        { value: 'Finalist', label: 'BitNBuild 2026, final round' },
      ] },
      { type: 'cards', label: 'Certifications', items: [
        { title: 'AIML', meta: 'iHub-Data', url: drive('1GIH2nUX-uXCoAP8BNAg_X_lNIs1BRe-H'), linkLabel: 'Certificate' },
        { title: 'Data Science Bootcamp', url: drive('10USylqbgEhyCEfQRlpZ9xst3voSDP55Y'), linkLabel: 'Certificate' },
        { title: 'Blockchain Hackathon', url: drive('1EhVOPXLdZ7a0TBusrSn2BP-HEJixJzdV'), linkLabel: 'Certificate' },
        { title: 'Python', meta: 'HackerRank', url: drive('1128CAdAypY8S856OsQo8Qltwyv7uOOH0'), linkLabel: 'Certificate' },
        { title: 'Python Bootcamp', url: drive('1ICME3f8Ibvu63E7NRtKRiNMn_Yc4H7hI'), linkLabel: 'Certificate' },
        { title: 'RTIH NeuroGuard', url: null },
      ] },
    ],
  },
  {
    slug: 'contact',
    title: 'Contact',
    part: 'io',
    partName: 'I/O ports',
    file: 'contact.io',
    cta: 'Connect',
    blocks: [
      { type: 'lead', text: "Port open. Let's connect." },
      { type: 'contact', items: [
        { kind: 'email', label: 'gundetisiddarth@gmail.com', url: 'mailto:gundetisiddarth@gmail.com' },
        { kind: 'phone', label: '7032629023', url: 'tel:7032629023' },
        { kind: 'linkedin', label: 'siddarth-gundeti', url: 'https://www.linkedin.com/in/siddarth-gundeti-08b36731b/' },
        { kind: 'github', label: 'Siddarth021', url: 'https://github.com/Siddarth021' },
      ] },
    ],
  },
];
