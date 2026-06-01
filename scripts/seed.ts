/**
 * KomiUnit Seed Script
 *
 * Populates the Supabase database with demo data for development.
 * Run with: npx ts-node scripts/seed.ts
 *
 * Requires EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in .env.local
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Check .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ─── Demo Users ───────────────────────────────────────────────────────────────

const DEMO_USERS = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'alice@komiunit.demo',
    full_name: 'Alice Martin',
    phone: '+1-555-000-0001',
    avatar_url: null,
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'bob@komiunit.demo',
    full_name: 'Bob Johnson',
    phone: '+1-555-000-0002',
    avatar_url: null,
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'carol@komiunit.demo',
    full_name: 'Carol Williams',
    phone: '+1-555-000-0003',
    avatar_url: null,
  },
];

// ─── KomiSend ─────────────────────────────────────────────────────────────────

const DEMO_SENDS = [
  {
    sender_id: '00000000-0000-0000-0000-000000000001',
    recipient_id: '00000000-0000-0000-0000-000000000002',
    amount: 150.00,
    status: 'completed',
    description: 'Rent payment',
  },
  {
    sender_id: '00000000-0000-0000-0000-000000000001',
    recipient_id: '00000000-0000-0000-0000-000000000003',
    amount: 75.50,
    status: 'completed',
    description: 'Dinner split',
  },
  {
    sender_id: '00000000-0000-0000-0000-000000000002',
    recipient_id: '00000000-0000-0000-0000-000000000001',
    amount: 250.00,
    status: 'pending',
    description: 'Freelance project',
  },
];

// ─── KomiSol ──────────────────────────────────────────────────────────────────

const DEMO_SOLUTION_CATEGORIES = [
  { name: 'Technical Support', description: 'App and technical issues', icon: '🔧' },
  { name: 'Account & Billing', description: 'Account and payment issues', icon: '💳' },
  { name: 'KomiSend Help', description: 'Money transfer questions', icon: '📤' },
  { name: 'KomiMarché Help', description: 'Marketplace questions', icon: '🛒' },
  { name: 'KomiLearn Help', description: 'Course and learning questions', icon: '📚' },
  { name: 'KomiVoix Help', description: 'Voice and calling questions', icon: '🎤' },
];

const DEMO_SOLUTIONS = [
  {
    title: 'How to send money using KomiSend',
    description: 'A complete guide to sending money through the KomiSend module. Learn how to add recipients, initiate transfers, and track your transaction history.',
    category: 'KomiSend Help',
    status: 'published',
    author: 'KomiUnit Team',
    views: 1240,
    likes: 98,
  },
  {
    title: 'Resolving connection issues',
    description: 'If you experience connection problems with KomiUnit, follow these troubleshooting steps to restore your connection.',
    category: 'Technical Support',
    status: 'published',
    author: 'KomiUnit Team',
    views: 890,
    likes: 72,
  },
  {
    title: 'How to track your order in KomiMarché',
    description: 'Track your KomiMarché orders from placement to delivery. Learn about order statuses and what they mean.',
    category: 'KomiMarché Help',
    status: 'published',
    author: 'KomiUnit Team',
    views: 654,
    likes: 45,
  },
  {
    title: 'Getting started with KomiLearn',
    description: 'New to KomiLearn? This guide will help you browse, enroll, and complete your first course.',
    category: 'KomiLearn Help',
    status: 'published',
    author: 'KomiUnit Team',
    views: 2100,
    likes: 185,
  },
  {
    title: 'How to update your account information',
    description: 'Update your profile, change your password, and manage your account settings in KomiUnit.',
    category: 'Account & Billing',
    status: 'published',
    author: 'KomiUnit Team',
    views: 520,
    likes: 34,
  },
];

// ─── KomiMarché ───────────────────────────────────────────────────────────────

const DEMO_PRODUCT_CATEGORIES = [
  { name: 'Electronics', description: 'Phones, laptops, and gadgets', icon: '📱' },
  { name: 'Clothing', description: 'Fashion and accessories', icon: '👕' },
  { name: 'Books', description: 'Educational and entertainment books', icon: '📖' },
  { name: 'Home & Garden', description: 'Home improvement and decor', icon: '🏠' },
  { name: 'Sports', description: 'Sports and fitness equipment', icon: '⚽' },
];

const DEMO_PRODUCTS = [
  {
    name: 'Wireless Headphones Pro',
    description: 'Premium noise-cancelling wireless headphones with 30-hour battery life.',
    price: 129.99,
    discount_price: 99.99,
    image_url: 'https://example.com/headphones.jpg',
    category: 'Electronics',
    stock: 50,
    rating: 4.8,
    reviews: 342,
  },
  {
    name: 'Python Programming Bible',
    description: 'Comprehensive guide to Python programming from beginner to advanced.',
    price: 39.99,
    discount_price: null,
    image_url: 'https://example.com/python-book.jpg',
    category: 'Books',
    stock: 200,
    rating: 4.9,
    reviews: 891,
  },
  {
    name: 'Smart Watch Series X',
    description: 'Feature-packed smartwatch with health monitoring and GPS.',
    price: 249.99,
    discount_price: 199.99,
    image_url: 'https://example.com/smartwatch.jpg',
    category: 'Electronics',
    stock: 30,
    rating: 4.6,
    reviews: 215,
  },
  {
    name: 'Organic Cotton T-Shirt',
    description: 'Comfortable and sustainable 100% organic cotton t-shirt.',
    price: 24.99,
    discount_price: null,
    image_url: 'https://example.com/tshirt.jpg',
    category: 'Clothing',
    stock: 500,
    rating: 4.4,
    reviews: 128,
  },
  {
    name: 'Yoga Mat Premium',
    description: 'Extra thick non-slip yoga mat for all types of exercise.',
    price: 49.99,
    discount_price: 39.99,
    image_url: 'https://example.com/yogamat.jpg',
    category: 'Sports',
    stock: 150,
    rating: 4.7,
    reviews: 267,
  },
  {
    name: 'LED Desk Lamp',
    description: 'Adjustable LED desk lamp with wireless charging base.',
    price: 59.99,
    discount_price: null,
    image_url: 'https://example.com/lamp.jpg',
    category: 'Home & Garden',
    stock: 80,
    rating: 4.5,
    reviews: 93,
  },
];

// ─── KomiLearn ────────────────────────────────────────────────────────────────

const DEMO_COURSE_CATEGORIES = [
  { name: 'Technology', description: 'Programming, web, and software', icon: '💻' },
  { name: 'Business', description: 'Entrepreneurship and management', icon: '💼' },
  { name: 'Finance', description: 'Personal finance and investing', icon: '💰' },
  { name: 'Health & Wellness', description: 'Physical and mental health', icon: '🏃' },
  { name: 'Languages', description: 'Learn new languages', icon: '🌍' },
];

const DEMO_COURSES = [
  {
    title: 'Complete Web Development Bootcamp',
    description: 'Learn HTML, CSS, JavaScript, React, and Node.js. Build real-world projects and launch your web development career.',
    instructor_id: '00000000-0000-0000-0000-000000000003',
    instructor_name: 'Dr. Tech Expert',
    price: 49.99,
    duration: 1200,
    level: 'beginner',
    rating: 4.9,
    enrollments: 12500,
  },
  {
    title: 'Python for Data Science & AI',
    description: 'Master Python programming for data analysis, machine learning, and artificial intelligence applications.',
    instructor_id: '00000000-0000-0000-0000-000000000003',
    instructor_name: 'Prof. Data Science',
    price: 59.99,
    duration: 900,
    level: 'intermediate',
    rating: 4.8,
    enrollments: 8900,
  },
  {
    title: 'Personal Finance Mastery',
    description: 'Take control of your money with budgeting, investing, and wealth-building strategies.',
    instructor_id: '00000000-0000-0000-0000-000000000002',
    instructor_name: 'Finance Expert',
    price: 29.99,
    duration: 360,
    level: 'beginner',
    rating: 4.7,
    enrollments: 5600,
  },
  {
    title: 'Advanced React & TypeScript',
    description: 'Build production-ready React applications with TypeScript, Redux, and modern patterns.',
    instructor_id: '00000000-0000-0000-0000-000000000003',
    instructor_name: 'Senior Developer',
    price: 69.99,
    duration: 720,
    level: 'advanced',
    rating: 4.9,
    enrollments: 3200,
  },
];

// ─── KomiVoix ─────────────────────────────────────────────────────────────────

const DEMO_CONTACTS = [
  {
    user_id: '00000000-0000-0000-0000-000000000001',
    contact_user_id: '00000000-0000-0000-0000-000000000002',
    contact_name: 'Bob Johnson',
    contact_phone: '+1-555-000-0002',
  },
  {
    user_id: '00000000-0000-0000-0000-000000000001',
    contact_user_id: '00000000-0000-0000-0000-000000000003',
    contact_name: 'Carol Williams',
    contact_phone: '+1-555-000-0003',
  },
];

const DEMO_CALL_LOGS = [
  {
    caller_id: '00000000-0000-0000-0000-000000000001',
    recipient_id: '00000000-0000-0000-0000-000000000002',
    duration: 325,
    status: 'completed',
    started_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    ended_at: new Date(Date.now() - 2 * 60 * 60 * 1000 + 325000).toISOString(),
  },
  {
    caller_id: '00000000-0000-0000-0000-000000000002',
    recipient_id: '00000000-0000-0000-0000-000000000001',
    duration: 0,
    status: 'missed',
    started_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    ended_at: null,
  },
];

// ─── Seed Function ────────────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Starting KomiUnit seed...\n');

  try {
    // Users
    console.log('👤 Seeding users...');
    const { error: usersError } = await supabase
      .from('users')
      .upsert(DEMO_USERS, { onConflict: 'id' });
    if (usersError) console.warn('  ⚠️  Users:', usersError.message);
    else console.log(`  ✅ ${DEMO_USERS.length} users seeded`);

    // Solution Categories
    console.log('\n💡 Seeding solution categories...');
    const { error: solCatError } = await supabase
      .from('solution_categories')
      .upsert(DEMO_SOLUTION_CATEGORIES, { onConflict: 'name' });
    if (solCatError) console.warn('  ⚠️  Sol categories:', solCatError.message);
    else console.log(`  ✅ ${DEMO_SOLUTION_CATEGORIES.length} solution categories seeded`);

    // Solutions
    console.log('\n💡 Seeding solutions...');
    const { error: solError } = await supabase.from('solutions').upsert(DEMO_SOLUTIONS, { onConflict: 'title' });
    if (solError) console.warn('  ⚠️  Solutions:', solError.message);
    else console.log(`  ✅ ${DEMO_SOLUTIONS.length} solutions seeded`);

    // Product Categories
    console.log('\n🛒 Seeding product categories...');
    const { error: prodCatError } = await supabase
      .from('product_categories')
      .upsert(DEMO_PRODUCT_CATEGORIES, { onConflict: 'name' });
    if (prodCatError) console.warn('  ⚠️  Product categories:', prodCatError.message);
    else console.log(`  ✅ ${DEMO_PRODUCT_CATEGORIES.length} product categories seeded`);

    // Products
    console.log('\n🛒 Seeding products...');
    const { error: prodError } = await supabase.from('products').upsert(DEMO_PRODUCTS, { onConflict: 'name' });
    if (prodError) console.warn('  ⚠️  Products:', prodError.message);
    else console.log(`  ✅ ${DEMO_PRODUCTS.length} products seeded`);

    // Course Categories
    console.log('\n📚 Seeding course categories...');
    const { error: courseCatError } = await supabase
      .from('course_categories')
      .upsert(DEMO_COURSE_CATEGORIES, { onConflict: 'name' });
    if (courseCatError) console.warn('  ⚠️  Course categories:', courseCatError.message);
    else console.log(`  ✅ ${DEMO_COURSE_CATEGORIES.length} course categories seeded`);

    // Courses
    console.log('\n📚 Seeding courses...');
    const { error: courseError } = await supabase.from('courses').upsert(DEMO_COURSES, { onConflict: 'title' });
    if (courseError) console.warn('  ⚠️  Courses:', courseError.message);
    else console.log(`  ✅ ${DEMO_COURSES.length} courses seeded`);

    // Sends
    console.log('\n📤 Seeding sends...');
    const { error: sendsError } = await supabase.from('komi_sends').insert(DEMO_SENDS);
    if (sendsError) console.warn('  ⚠️  Sends:', sendsError.message);
    else console.log(`  ✅ ${DEMO_SENDS.length} sends seeded`);

    // Contacts
    console.log('\n🎤 Seeding contacts...');
    const { error: contactsError } = await supabase.from('contacts').insert(DEMO_CONTACTS);
    if (contactsError) console.warn('  ⚠️  Contacts:', contactsError.message);
    else console.log(`  ✅ ${DEMO_CONTACTS.length} contacts seeded`);

    // Call Logs
    console.log('\n📞 Seeding call logs...');
    const { error: callsError } = await supabase.from('call_logs').insert(DEMO_CALL_LOGS);
    if (callsError) console.warn('  ⚠️  Call logs:', callsError.message);
    else console.log(`  ✅ ${DEMO_CALL_LOGS.length} call logs seeded`);

    console.log('\n🎉 Seed complete!\n');
    console.log('Demo credentials:');
    DEMO_USERS.forEach((u) => {
      console.log(`  ${u.full_name}: ${u.email} / password: Demo123!`);
    });
  } catch (error) {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
