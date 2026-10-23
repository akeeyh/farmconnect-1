import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CATEGORIES = [
  { name: "Vegetables", icon: "🥦" },
  { name: "Fruits", icon: "🍎" },
  { name: "Grains", icon: "🌾" },
  { name: "Spices", icon: "🌶️" },
  { name: "Dairy", icon: "🥛" },
  { name: "Eggs", icon: "🥚" },
  { name: "Honey", icon: "🍯" },
  { name: "Organic Produce", icon: "🌱" },
];

async function main() {
  console.log("Seeding categories...");

  for (const category of CATEGORIES) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: { icon: category.icon },
      create: {
        name: category.name,
        icon: category.icon,
      },
    });
  }

  console.log(`Seeded ${CATEGORIES.length} categories.`);
  console.log("No mock users or products created — register real accounts to use FarmConnect!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
