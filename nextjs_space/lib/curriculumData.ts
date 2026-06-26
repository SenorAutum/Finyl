// lib/curriculumData.ts

export const initialCurriculum = [
  {
    id: "mod-1",
    moduleNumber: 1,
    moduleTitle: "Smart Budgeting for Digital Borrowers",
    lessons: [
      {
        id: "1.1",
        title: "Separating Personal and Business Cash",
        problem: "Mixing household money with business profits leads to unexpected loan defaults.",
        strategy: "Open a distinct digital wallet or secondary account solely for your business income and expenses. Pay yourself a fixed, consistent salary.",
        toolType: "cash-tracker"
      },
      {
        id: "1.2",
        title: "The Mobile-Friendly 50/30/20 Matrix",
        strategy: "Break down incoming revenue into three buckets: 50% Essential Needs (inventory, debt), 30% Wants (upgrades), and 20% Future Financial Safety (savings, cushions).",
        toolType: "budget-matrix"
      }
    ]
  },
  {
    id: "mod-2",
    moduleNumber: 2,
    moduleTitle: "Intentional Saving & Building Your Cushion",
    lessons: [
      {
        id: "2.1",
        title: "The Emergency Fund Shield",
        strategy: "Before attempting to take on larger digital credit lines, aim to build an emergency fund equivalent to 3 to 6 months of basic operating costs.",
        toolType: "savings-calculator"
      },
      {
        id: "2.2",
        title: "Automating Your Savings Goals",
        strategy: "Leverage automated features like 'round-up savings' (rounding up to the nearest KES 50) and goal-based locked accounts.",
        toolType: "none"
      }
    ]
  }
  // You can easily paste the rest of the modules from the document here later!
];
