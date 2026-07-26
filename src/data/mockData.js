// Mock Users Database
export const mockUsers = {
  'sarah': {
    id: 'sarah',
    type: 'creator',
    name: 'Sarah Johnson',
    username: '@sarahcreates',
    email: 'sarah@email.com',
    avatar: '👩‍🦰',
    category: 'Lifestyle & Tutorials',
    bio: 'Lifestyle content creator focused on sustainable fashion and wellness.',
    reach: '120k',
    engagement: '4.2%',
    joinDate: 'January 15, 2024',
    totalEarnings: 45250,
    activeProjects: 8,
    matches: ['ecofashion', 'techbrand'],
    indaBalance: 150, // INDA tokens for unlocking posts
    stats: {
      followers: 120000,
      posts: 342,
      engagement: 4.2
    }
  },
  'ecofashion': {
    id: 'ecofashion',
    type: 'brand',
    name: 'EcoFashion Co.',
    username: '@ecofashion',
    email: 'hello@ecofashion.com',
    avatar: '🏢',
    category: 'Sustainable Fashion',
    bio: 'Leading sustainable fashion brand committed to eco-friendly practices.',
    reach: '500k',
    avgROI: '3.2x',
    joinDate: 'December 1, 2023',
    totalInvestment: 158000,
    activeCampaigns: 5,
    matches: ['sarah', 'alex'],
    indaBalance: 250, // INDA tokens for unlocking posts
    stats: {
      followers: 500000,
      campaigns: 24,
      avgROI: 3.2
    }
  },
  'alex': {
    id: 'alex',
    type: 'creator',
    name: 'Alex Chen',
    username: '@alextech',
    email: 'alex@email.com',
    avatar: '👨',
    category: 'Tech & Innovation',
    bio: 'Tech reviewer and innovation enthusiast. Exploring the future of technology.',
    reach: '80k',
    engagement: '5.8%',
    joinDate: 'March 20, 2024',
    totalEarnings: 28500,
    activeProjects: 3,
    matches: ['ecofashion'],
    indaBalance: 100, // INDA tokens for unlocking posts
    stats: {
      followers: 80000,
      posts: 156,
      engagement: 5.8
    }
  }
};

// Available Brands/Creators for matching
export const availableBrands = [
  { id: 1, name: 'GoHighLevel', description: 'Automatización de marketing', industry: 'Marketing', color: 'from-purple-500 to-indigo-600', icon: '🎯' },
  { id: 2, name: 'ChainGPT', description: 'Inteligencia artificial', industry: 'Tecnología', color: 'from-cyan-500 to-blue-600', icon: '🤖' },
  { id: 3, name: 'CopyGen', description: 'Contenido creativo', industry: 'Marketing', color: 'from-purple-600 to-pink-600', icon: '✍️' },
  { id: 4, name: 'BlockchainX', description: 'Blockchain solutions', industry: 'Tecnología', color: 'from-purple-500 to-blue-600', icon: '⛓️' },
  { id: 5, name: 'Copyen', description: 'AI Content', industry: 'Marketing', color: 'from-pink-500 to-rose-600', icon: '📝' },
  { id: 6, name: 'Indara', description: 'Desarrollo digital', industry: 'Tecnología', color: 'from-blue-500 to-cyan-600', icon: '💻' }
];

export const availableCreators = [
  { id: 1, name: 'Maria Garcia', category: 'Fashion', reach: '95k', avatar: '👩', color: 'from-pink-500 to-rose-600' },
  { id: 2, name: 'James Wilson', category: 'Tech Reviews', reach: '150k', avatar: '👨‍💼', color: 'from-blue-500 to-cyan-600' },
  { id: 3, name: 'Lisa Park', category: 'Lifestyle', reach: '200k', avatar: '👩‍🦱', color: 'from-purple-500 to-pink-600' },
  { id: 4, name: 'David Brown', category: 'Gaming', reach: '180k', avatar: '🎮', color: 'from-green-500 to-emerald-600' },
  { id: 5, name: 'Sophie Miller', category: 'Beauty', reach: '220k', avatar: '💄', color: 'from-orange-500 to-amber-600' }
];

// Notifications
export const mockNotifications = [
  { id: 1, type: 'match', title: 'New Match', message: 'You matched with EcoFashion Co.!', time: 'Just now', read: false },
  { id: 2, type: 'proposal', title: 'Proposal Received', message: 'Weecoin sent you a project proposal - $5,000', time: '2h ago', read: false },
  { id: 3, type: 'follower', title: 'New Follower', message: 'Alex started following you', time: '1 day ago', read: true },
  { id: 4, type: 'payment', title: 'Payment Received', message: 'You received $4,250 from EcoFashion Co.', time: '1 day ago', read: true },
  { id: 5, type: 'engagement', title: 'Post Engagement', message: 'Your post reached 500 likes!', time: '2 days ago', read: true }
];

// Blog Posts
export const mockBlogPosts = [
  {
    id: 1,
    title: 'Building Sustainable Fashion Communities',
    excerpt: 'How to create authentic connections with eco-conscious brands...',
    author: 'Sarah Johnson',
    authorAvatar: '👩‍🦰',
    authorBio: 'Lifestyle Creator • 120k',
    date: 'Feb 18, 2026',
    category: 'sustainability',
    readTime: '5 min',
    gradient: 'from-green-500 to-emerald-600',
    views: '1.2k',
    likes: 89,
    comments: 12,
    featured: true
  },
  {
    id: 2,
    title: 'The Future of Creator Economy',
    excerpt: 'Blockchain technology is revolutionizing how creators earn...',
    author: 'Alex Chen',
    authorAvatar: '👨',
    authorBio: 'Tech Expert',
    date: 'Feb 15, 2026',
    category: 'innovation',
    readTime: '8 min',
    gradient: 'from-purple-500 to-indigo-600',
    views: '2.5k',
    likes: 156,
    comments: 24,
    featured: true
  },
  {
    id: 3,
    title: 'How to Price Your Services',
    excerpt: 'A comprehensive guide to calculating your worth as a creator...',
    author: 'Maria Garcia',
    authorAvatar: '👩',
    authorBio: 'Business Coach',
    date: 'Feb 12, 2026',
    category: 'business',
    readTime: '6 min',
    gradient: 'from-orange-500 to-amber-600',
    views: '3.1k',
    likes: 234,
    comments: 45
  }
];

// Revenue Data
export const mockRevenueData = [
  { month: 'Jan', value: 15, amount: 12500 },
  { month: 'Feb', value: 25, amount: 15000 },
  { month: 'Mar', value: 35, amount: 18000 },
  { month: 'Apr', value: 50, amount: 22000 },
  { month: 'May', value: 70, amount: 28000 },
  { month: 'Jun', value: 85, amount: 35000 }
];

// Projects/Campaigns
export const mockProjects = [
  { id: 1, name: 'Osvi.Tech', status: 'Ongoing', amount: 5200, date: 'Jun 2026' },
  { id: 2, name: 'Code Nexus', status: 'Completed', amount: 4250, date: 'May 2026' },
  { id: 3, name: 'Vila World', status: 'Pending', amount: 3800, date: 'Jun 2026' }
];
