import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 1. Seed Admin Users
  const adminHash = await bcrypt.hash('johndoe123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@finlit.com' },
    update: {},
    create: {
      email: 'admin@finlit.com',
      name: 'Platform Admin',
      passwordHash: adminHash,
      role: Role.ADMIN,
    },
  });

  // 2. Create Learning Tracks
  const tracks = [
    {
      id: 'track-foundations',
      title: 'Financial Foundations',
      description: 'Master daily cash flows, smart budgeting, and building your digital cushion.',
      icon: 'Wallet',
      color: '#10B981',
      sortOrder: 1,
    },
    {
      id: 'track-protection',
      title: 'Consumer Protection & Security',
      description: 'Understand your borrowing rights, defend against scammers, and navigate disputes safely.',
      icon: 'ShieldCheck',
      color: '#3B82F6',
      sortOrder: 2,
    },
    {
      id: 'track-growth',
      title: 'Business Resilience & Growth',
      description: 'Scale your business securely with strategic micro-investments and digital insurance.',
      icon: 'TrendingUp',
      color: '#8B5CF6',
      sortOrder: 3,
    },
  ];

  for (const t of tracks) {
    await prisma.track.upsert({
      where: { id: t.id },
      update: { title: t.title, description: t.description, icon: t.icon, color: t.color, sortOrder: t.sortOrder },
      create: t,
    });
  }

  // 3. Create Modules
  const modules = [
    // Track 1
    { id: 'mod-1', trackId: 'track-foundations', title: 'Smart Budgeting for Digital Borrowers', description: 'Master the 50/30/20 rule and separate personal from business cash.', sortOrder: 1, price: 0, isFree: true },
    { id: 'mod-2', trackId: 'track-foundations', title: 'Intentional Saving & Building Your Cushion', description: 'Move away from reactive borrowing by automating your savings goals.', sortOrder: 2, price: 0, isFree: true },
    
    // Track 2
    { id: 'mod-3', trackId: 'track-protection', title: 'Responsible Borrowing & Your Rights', description: 'Demystify the KFS, understand repayment distress, and know your rights.', sortOrder: 1, price: 0, isFree: true },
    { id: 'mod-4', trackId: 'track-protection', title: 'Digital Security & Beating Scammers', description: 'Secure your digital wallet and learn how to reverse mistaken transactions.', sortOrder: 2, price: 0, isFree: true },
    { id: 'mod-7', trackId: 'track-protection', title: 'Resolving Disputes', description: 'Navigate app complaints and understand external redress pathways via CBK.', sortOrder: 3, price: 0, isFree: true },

    // Track 3
    { id: 'mod-5', trackId: 'track-growth', title: 'Strategic Investing for Growth', description: 'Transition from micro-savings to accessible digital investment vehicles.', sortOrder: 1, price: 0, isFree: true },
    { id: 'mod-6', trackId: 'track-growth', title: 'Insurance for Business Continuity', description: 'Demystify commercial insurance tying and digital claim handling.', sortOrder: 2, price: 0, isFree: true },
  ];

  for (const m of modules) {
    await prisma.module.upsert({
      where: { id: m.id },
      update: { title: m.title, description: m.description, sortOrder: m.sortOrder, price: m.price, isFree: m.isFree },
      create: m,
    });
  }

  // 4. Create Lessons (Curriculum Integration)
  const lessons = [
    // Module 1: Smart Budgeting
    {
      id: 'les-1-1', moduleId: 'mod-1', title: 'Separating Personal and Business Cash',
      hook: 'Mixing household money with business profits leads to unexpected loan defaults.',
      content: '## The Golden Rule\n\nMixing household money with business profits is a common trap. To succeed, you must open a distinct digital wallet or secondary account solely for your business income and expenses.\n\n### Actionable Strategy\nPay yourself a fixed, consistent "salary" from your business wallet to cover personal needs, rather than dipping into the daily cash register.',
      sortOrder: 1,
      quizData: JSON.stringify([
        { question: 'What is the best way to handle business and personal cash?', options: ['Keep it all in one wallet for easy access', 'Open distinct digital wallets for each', 'Only use cash for business', 'Use business loans for personal groceries'], correctIndex: 1 }
      ]),
    },
    {
      id: 'les-1-2', moduleId: 'mod-1', title: 'The Mobile-Friendly 50/30/20 Matrix',
      hook: 'Build resilience before your next digital loan by breaking your revenue into three simple buckets.',
      content: '## The 50/30/20 Rule\n\nTo build resilience, allocate your revenue safely:\n\n* **50% - Essential Needs:** Operational expenses (inventory, electricity) and existing debt obligations.\n* **30% - Wants:** Business upgrades and non-essential spending.\n* **20% - Future Financial Safety:** Savings, emergency cushions, and proactive investments.',
      sortOrder: 2,
      quizData: JSON.stringify([
        { question: 'Under the 50/30/20 rule, what percentage goes to Future Financial Safety?', options: ['50%', '30%', '20%', '10%'], correctIndex: 2 }
      ]),
    },

    // Module 3: Responsible Borrowing
    {
      id: 'les-3-1', moduleId: 'mod-3', title: 'Demystifying the Key Facts Statement (KFS)',
      hook: 'Never click "Accept" blindly. Your right to know the true cost of credit is protected by law.',
      content: '## Understanding the APR\n\nYou are entitled to a clean, standardized KFS summary before committing to a loan. Do not just look at a daily interest rate of 1% or a monthly rate of 5%.\n\n### The Master Calculation\nLook at the Annual Percentage Rate (APR) displayed. The APR shows the total cost of your credit, including processing fees, insurance premiums, and interest charges rolled into a single yearly rate.',
      sortOrder: 1,
      quizData: JSON.stringify([
        { question: 'What does the APR include that a standard interest rate might hide?', options: ['Only the daily rate', 'Total cost including fees and insurance', 'Just the principal amount', 'Future credit limits'], correctIndex: 1 }
      ]),
    },
    {
      id: 'les-3-2', moduleId: 'mod-3', title: 'Protection Against Harsh Debt Collection',
      hook: 'Digital Credit Representatives are explicitly forbidden from using intimidation or public shaming.',
      content: '## Knowing Your Boundaries\n\nUnder the Consumer Protection Framework, you have strict rights:\n\n* **Zero-Tolerance for Harassment:** No physical force or public shaming.\n* **Contact Scraping Prohibitions:** Loan apps cannot legally scrape your phone contact book, read private SMS logs, or message your friends to shame you.\n* **Regulated Communication:** Providers cannot call you at unreasonable hours.',
      sortOrder: 2,
      quizData: JSON.stringify([
        { question: 'Can a digital loan app message your phone contacts if you default?', options: ['Yes, if it is in the terms', 'Only family members', 'No, this is legally prohibited contact scraping', 'Yes, but only once a day'], correctIndex: 2 }
      ]),
    },

    // Module 7: Resolving Disputes
    {
      id: 'les-7-1', moduleId: 'mod-7', title: 'Navigating External Redress',
      hook: 'If your provider ignores your complaint, you are not powerless. You have the right to escalate.',
      content: '## Your Legal Right to Escalate\n\nIf an app glitches, overcharges you, or acts unfairly, the provider must issue a Unique Reference Number for your internal complaint. \n\n### The CBK Pathway\nIf they fail to resolve it within regulated timelines, you have the full right to escalate the matter. As a digital credit client, you can submit your formal appeal directly to the Central Bank of Kenya (CBK) or use formal Alternative Dispute Resolution (ADR) frameworks.',
      sortOrder: 1,
      quizData: JSON.stringify([
        { question: 'Where can you escalate a dispute if your digital provider fails to resolve it fairly?', options: ['Local police station', 'The Central Bank of Kenya (CBK)', 'Social media', 'Nowhere'], correctIndex: 1 }
      ]),
    }
  ];

  for (const l of lessons) {
    await prisma.lesson.upsert({
      where: { id: l.id },
      update: {
        title: l.title, hook: l.hook, content: l.content,
        sortOrder: l.sortOrder, quizData: l.quizData,
      },
      create: l,
    });
  }

  console.log('DCP Curriculum Seeded Successfully!');
}

main()
  .catch((e: any) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });