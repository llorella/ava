import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.productIngredient.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.ingredient.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Seeding database...');

  // Create ingredients
  const ingredients = [
    {
      name: "Water",
      aliases: ["Aqua", "H2O"],
      category: "Solvent",
      healthRating: 10,
      riskFactors: [],
      description: "Universal solvent, completely safe for all uses."
    },
    {
      name: "Glycerin",
      aliases: ["Glycerol"],
      category: "Humectant",
      healthRating: 9,
      riskFactors: [],
      description: "Natural moisturizing ingredient that helps skin retain moisture."
    },
    {
      name: "Phenoxyethanol",
      aliases: [],
      category: "Preservative",
      healthRating: 5,
      riskFactors: ["skin irritation", "allergic reactions"],
      description: "Synthetic preservative that can cause irritation in some individuals."
    },
    {
      name: "Sodium Lauryl Sulfate",
      aliases: ["SLS"],
      category: "Surfactant",
      healthRating: 3,
      riskFactors: ["skin irritation", "dryness", "allergic reactions"],
      description: "Strong cleansing agent that can strip natural oils and irritate skin."
    },
    {
      name: "Tocopherol",
      aliases: ["Vitamin E"],
      category: "Antioxidant",
      healthRating: 9,
      riskFactors: [],
      description: "Vitamin E derivative that protects skin from free radicals and oxidative stress."
    },
    {
      name: "Fragrance",
      aliases: ["Parfum", "Aroma"],
      category: "Fragrance",
      healthRating: 4,
      riskFactors: ["allergic reactions", "skin irritation", "hormone disruption"],
      description: "Mixture of scent chemicals that can cause allergic reactions and irritation."
    },
    {
      name: "Parabens",
      aliases: ["Methylparaben", "Propylparaben", "Butylparaben", "Ethylparaben"],
      category: "Preservative",
      healthRating: 3,
      riskFactors: ["hormone disruption", "allergic reactions"],
      description: "Preservatives that may disrupt hormone function and cause allergic reactions."
    },
    {
      name: "Retinol",
      aliases: ["Vitamin A", "Retinoic Acid"],
      category: "Anti-aging",
      healthRating: 7,
      riskFactors: ["skin irritation", "sun sensitivity"],
      description: "Vitamin A derivative that promotes cell turnover but can cause irritation."
    },
    {
      name: "Hyaluronic Acid",
      aliases: ["Sodium Hyaluronate"],
      category: "Humectant",
      healthRating: 10,
      riskFactors: [],
      description: "Natural substance that attracts and retains moisture in the skin."
    },
    {
      name: "Salicylic Acid",
      aliases: ["Beta Hydroxy Acid", "BHA"],
      category: "Exfoliant",
      healthRating: 8,
      riskFactors: ["skin irritation", "sun sensitivity"],
      description: "Exfoliating acid that helps clear pores but may cause irritation."
    },
    {
      name: "Niacinamide",
      aliases: ["Vitamin B3", "Nicotinamide"],
      category: "Vitamin",
      healthRating: 9,
      riskFactors: [],
      description: "Form of vitamin B3 that improves skin texture and reduces inflammation."
    },
    {
      name: "Titanium Dioxide",
      aliases: [],
      category: "Sunscreen",
      healthRating: 8,
      riskFactors: ["inhalation risk"],
      description: "Mineral sunscreen ingredient that physically blocks UV rays."
    },
    {
      name: "Zinc Oxide",
      aliases: [],
      category: "Sunscreen",
      healthRating: 9,
      riskFactors: [],
      description: "Mineral sunscreen ingredient with anti-inflammatory properties."
    },
    {
      name: "Aloe Vera",
      aliases: ["Aloe Barbadensis Leaf Extract"],
      category: "Soothing",
      healthRating: 10,
      riskFactors: [],
      description: "Natural plant extract with soothing and healing properties."
    },
    {
      name: "Dimethicone",
      aliases: ["Silicone"],
      category: "Emollient",
      healthRating: 6,
      riskFactors: ["pore clogging"],
      description: "Silicone-based ingredient that creates a barrier on skin and can trap debris."
    }
  ];

  for (const ingredient of ingredients) {
    await prisma.ingredient.create({
      data: {
        name: ingredient.name,
        aliases: ingredient.aliases,
        category: ingredient.category,
        healthRating: ingredient.healthRating,
        riskFactors: ingredient.riskFactors,
        description: ingredient.description
      }
    });
  }

  // Create a demo user
  await prisma.user.create({
    data: {
      email: "demo@example.com",
      passwordHash: "$2b$10$iE1Urb6Z8g5MAoDBrFOzmO6UhN62PzdZic9Jf9z7nEpm.XYK1SM.2", // Hash for "password123"
      allergies: ["Fragrance", "Parabens"],
      dietaryPreferences: ["Vegan", "Gluten-Free"],
      skinConditions: ["Sensitive Skin", "Eczema"]
    }
  });

  // Create a sample product
  const moisturizer = await prisma.product.create({
    data: {
      name: "Hydrating Face Cream",
      category: "Skincare",
      barcode: "123456789012"
    }
  });

  // Add ingredients to the product
  const moisturizerIngredients = ["Water", "Glycerin", "Phenoxyethanol", "Fragrance", "Tocopherol"];
  
  for (const ingredientName of moisturizerIngredients) {
    const ingredient = await prisma.ingredient.findFirst({
      where: { name: ingredientName }
    });
    
    if (ingredient) {
      await prisma.productIngredient.create({
        data: {
          productId: moisturizer.id,
          ingredientId: ingredient.id
        }
      });
    }
  }

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
