import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Community } from '../src/models/Community.js';
import { Post } from '../src/models/Post.js';
import { Comment } from '../src/models/Comment.js';
import { Vote } from '../src/models/Vote.js';

const seedData = async () => {
  try {
    console.log('🌱 Connecting to database for seeding...');
    await connectDB();

    console.log('🧹 Cleaning existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Community.deleteMany({}),
      Post.deleteMany({}),
      Comment.deleteMany({}),
      Vote.deleteMany({}),
    ]);

    console.log('👤 Creating demo users...');
    const defaultPassword = 'password123';
    const passwordHash = await User.hashPassword(defaultPassword);

    const usersData = [
      {
        username: 'demo_user',
        email: 'demo@circleup.dev',
        passwordHash,
        bio: 'CircleUp exploration account. Building communities and testing workflows.',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=demo_user',
      },
      {
        username: 'alex_coder',
        email: 'alex@example.com',
        passwordHash,
        bio: 'Full-stack developer building scalable web apps with React and Node.',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=alex_coder',
      },
      {
        username: 'sarah_ux',
        email: 'sarah@example.com',
        passwordHash,
        bio: 'Product designer focusing on accessible and delightful community spaces.',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=sarah_ux',
      },
      {
        username: 'marcus_gamer',
        email: 'marcus@example.com',
        passwordHash,
        bio: 'Indie game developer, retro gaming enthusiast, and pixel artist.',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=marcus_gamer',
      },
      {
        username: 'elena_tech',
        email: 'elena@example.com',
        passwordHash,
        bio: 'AI researcher and distributed systems architect. Curiosity driven.',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=elena_tech',
      },
    ];

    const users = await User.insertMany(usersData);
    const [demo, alex, sarah, marcus, elena] = users;

    console.log(`✅ Created ${users.length} users (Password for all: ${defaultPassword})`);

    console.log('🏛️ Creating communities...');
    const communitiesData = [
      {
        name: 'Technology',
        slug: 'technology',
        description: 'A dedicated space for the discussion of emerging hardware, software paradigms, and digital culture.',
        category: 'Technology',
        creator: alex._id,
        members: [alex._id, demo._id, elena._id, sarah._id],
        memberCount: 4,
        bannerColor: '#4F46E5',
      },
      {
        name: 'Web Development',
        slug: 'webdev',
        description: 'Frontend architectures, backend microservices, modern CSS, JavaScript standards, and engineering best practices.',
        category: 'Programming',
        creator: alex._id,
        members: [alex._id, demo._id, sarah._id],
        memberCount: 3,
        bannerColor: '#0EA5E9',
      },
      {
        name: 'Product Design',
        slug: 'design',
        description: 'Exploring typography, user research, UI micro-interactions, design tokens, and editorial aesthetics.',
        category: 'Design',
        creator: sarah._id,
        members: [sarah._id, demo._id, elena._id],
        memberCount: 3,
        bannerColor: '#EC4899',
      },
      {
        name: 'Indie Gaming',
        slug: 'gaming',
        description: 'Passionate discussions about independent game mechanics, art styles, speedruns, and game engine tech.',
        category: 'Gaming',
        creator: marcus._id,
        members: [marcus._id, demo._id],
        memberCount: 2,
        bannerColor: '#8B5CF6',
      },
      {
        name: 'Ask CircleUp',
        slug: 'askcircle',
        description: 'Thought-provoking questions, engineering debates, career advice, and community AMAs.',
        category: 'General',
        creator: demo._id,
        members: [demo._id, alex._id, sarah._id, marcus._id, elena._id],
        memberCount: 5,
        bannerColor: '#10B981',
      },
    ];

    const communities = await Community.insertMany(communitiesData);
    const [tech, webdev, design, gaming, askcircle] = communities;
    console.log(`✅ Created ${communities.length} communities`);

    console.log('📝 Publishing initial posts...');
    const postsData = [
      {
        title: 'Building scalable full-stack applications with clean separation of concerns',
        body: 'When designing an editorial community platform, keeping business logic out of controllers and ensuring database atomicity with compound unique indices makes scaling straightforward.',
        type: 'text',
        community: webdev._id,
        author: alex._id,
        score: 4,
        commentCount: 2,
        createdAt: new Date(Date.now() - 3 * 3600 * 1000), // 3 hours ago
      },
      {
        title: 'Why editorial typography and warm off-white surfaces feel so calming',
        body: 'High contrast pure white backgrounds can induce visual fatigue. Using warm stone tones like #F8F9FA paired with restrained indigo accents enhances reading comfort during long discussion sessions.',
        type: 'text',
        community: design._id,
        author: sarah._id,
        score: 3,
        commentCount: 2,
        createdAt: new Date(Date.now() - 5 * 3600 * 1000), // 5 hours ago
      },
      {
        title: 'Vite 6 and modern frontend tooling announcement',
        body: 'Check out the official release notes highlighting environment API improvements and rapid HMR speeds.',
        type: 'link',
        linkUrl: 'https://vite.dev',
        community: webdev._id,
        author: alex._id,
        score: 2,
        commentCount: 1,
        createdAt: new Date(Date.now() - 12 * 3600 * 1000), // 12 hours ago
      },
      {
        title: 'What programming language would you choose for a fresh greenfield project in 2026?',
        body: 'Consider developer ergonomics, type safety, ecosystem maturity, and deployment costs. Share your thoughts and trade-offs!',
        type: 'text',
        community: askcircle._id,
        author: demo._id,
        score: 5,
        commentCount: 3,
        createdAt: new Date(Date.now() - 1 * 3600 * 1000), // 1 hour ago (Trending contender)
      },
      {
        title: 'Procedural generation techniques in contemporary roguelike development',
        body: 'Cellular automata versus binary space partitioning: how we generated responsive cavern maps in under 5 milliseconds.',
        type: 'text',
        community: gaming._id,
        author: marcus._id,
        score: 2,
        commentCount: 1,
        createdAt: new Date(Date.now() - 20 * 3600 * 1000),
      },
      {
        title: 'Announcing Node.js long term support milestones and native test runner improvements',
        body: 'The official Node.js documentation details built-in mocking, coverage reporting, and faster startup performance.',
        type: 'link',
        linkUrl: 'https://nodejs.org',
        community: tech._id,
        author: elena._id,
        score: 3,
        commentCount: 0,
        createdAt: new Date(Date.now() - 8 * 3600 * 1000),
      },
      {
        title: 'How do you structure database queries to prevent concurrent vote drift?',
        body: 'We utilize atomic $inc operators paired with compound unique indexes on (user, post) to guarantee idempotent transitions.',
        type: 'text',
        community: webdev._id,
        author: demo._id,
        score: 4,
        commentCount: 2,
        createdAt: new Date(Date.now() - 2 * 3600 * 1000),
      },
    ];

    const posts = await Post.insertMany(postsData);
    console.log(`✅ Created ${posts.length} posts`);

    console.log('🗳️ Recording vote history...');
    const votesData = [
      // Post 0: 4 upvotes
      { user: alex._id, post: posts[0]._id, value: 1 },
      { user: demo._id, post: posts[0]._id, value: 1 },
      { user: sarah._id, post: posts[0]._id, value: 1 },
      { user: elena._id, post: posts[0]._id, value: 1 },

      // Post 1: 3 upvotes
      { user: sarah._id, post: posts[1]._id, value: 1 },
      { user: alex._id, post: posts[1]._id, value: 1 },
      { user: demo._id, post: posts[1]._id, value: 1 },

      // Post 2: 2 upvotes
      { user: alex._id, post: posts[2]._id, value: 1 },
      { user: elena._id, post: posts[2]._id, value: 1 },

      // Post 3: 5 upvotes
      { user: demo._id, post: posts[3]._id, value: 1 },
      { user: alex._id, post: posts[3]._id, value: 1 },
      { user: sarah._id, post: posts[3]._id, value: 1 },
      { user: marcus._id, post: posts[3]._id, value: 1 },
      { user: elena._id, post: posts[3]._id, value: 1 },

      // Post 4: 2 upvotes
      { user: marcus._id, post: posts[4]._id, value: 1 },
      { user: demo._id, post: posts[4]._id, value: 1 },

      // Post 5: 3 upvotes
      { user: elena._id, post: posts[5]._id, value: 1 },
      { user: alex._id, post: posts[5]._id, value: 1 },
      { user: demo._id, post: posts[5]._id, value: 1 },

      // Post 6: 4 upvotes
      { user: demo._id, post: posts[6]._id, value: 1 },
      { user: alex._id, post: posts[6]._id, value: 1 },
      { user: sarah._id, post: posts[6]._id, value: 1 },
      { user: elena._id, post: posts[6]._id, value: 1 },
    ];

    await Vote.insertMany(votesData);
    console.log(`✅ Recorded ${votesData.length} votes`);

    console.log('💬 Creating discussion comments...');
    const commentsData = [
      {
        content: 'Great overview! The distinction between domain models and controller presentation logic is especially crucial.',
        post: posts[0]._id,
        author: sarah._id,
        createdAt: new Date(Date.now() - 2.5 * 3600 * 1000),
      },
      {
        content: 'Completely agree. Also, running integration tests against an in-memory instance catches concurrency issues early.',
        post: posts[0]._id,
        author: demo._id,
        createdAt: new Date(Date.now() - 2 * 3600 * 1000),
      },
      {
        content: 'The slight tint of warm gray makes a huge difference compared to stark #000 on #fff. Love the typography hierarchy!',
        post: posts[1]._id,
        author: alex._id,
        createdAt: new Date(Date.now() - 4 * 3600 * 1000),
      },
      {
        content: 'Thanks Alex! We spent a lot of time testing readability on both mobile OLED screens and desktop displays.',
        post: posts[1]._id,
        author: sarah._id,
        createdAt: new Date(Date.now() - 3.8 * 3600 * 1000),
      },
      {
        content: 'Vite transformed frontend builds completely. Fast refresh is virtually instant.',
        post: posts[2]._id,
        author: sarah._id,
        createdAt: new Date(Date.now() - 10 * 3600 * 1000),
      },
      {
        content: 'For rapid web development, TypeScript or standard modern JavaScript with Node 22+ and Express is hard to beat for delivery speed.',
        post: posts[3]._id,
        author: alex._id,
        createdAt: new Date(Date.now() - 0.8 * 3600 * 1000),
      },
      {
        content: 'Go or Rust if high throughput CPU workloads are involved, but for community and content sites Node and MongoDB provide the fastest developer loop.',
        post: posts[3]._id,
        author: elena._id,
        createdAt: new Date(Date.now() - 0.5 * 3600 * 1000),
      },
      {
        content: 'Totally, developer velocity and maintainability are usually the real bottlenecks, not raw runtime speed.',
        post: posts[3]._id,
        author: marcus._id,
        createdAt: new Date(Date.now() - 0.2 * 3600 * 1000),
      },
      {
        content: 'Cellular automata produces such natural looking caverns! Did you apply smoothing passes?',
        post: posts[4]._id,
        author: alex._id,
        createdAt: new Date(Date.now() - 18 * 3600 * 1000),
      },
      {
        content: 'The atomic $inc method is bulletproof because MongoDB processes it sequentially on the document lock.',
        post: posts[6]._id,
        author: alex._id,
        createdAt: new Date(Date.now() - 1.5 * 3600 * 1000),
      },
      {
        content: 'Exactly, combining that with the compound unique index prevents race conditions even with simultaneous clicks.',
        post: posts[6]._id,
        author: elena._id,
        createdAt: new Date(Date.now() - 1 * 3600 * 1000),
      },
    ];

    await Comment.insertMany(commentsData);
    console.log(`✅ Created ${commentsData.length} comments`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('--------------------------------------------------');
    console.log('Demo Credentials for testing:');
    console.log('  Username: demo_user');
    console.log('  Email:    demo@circleup.dev');
    console.log('  Password: password123');
    console.log('--------------------------------------------------');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    await disconnectDB();
    process.exit(1);
  }
};

seedData();
