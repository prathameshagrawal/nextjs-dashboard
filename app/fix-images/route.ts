import postgres from 'postgres';

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' });

// Available images in public/customers directory
const availableImages = [
  '/customers/amy-burns.png',
  '/customers/balazs-orban.png',
  '/customers/delba-de-oliveira.png',
  '/customers/evil-rabbit.png',
  '/customers/lee-robinson.png',
  '/customers/michael-novotny.png',
];

// Map of customer names to available images (fallback)
const customerImageMap: Record<string, string> = {
  'Hector Simpson': '/customers/michael-novotny.png',
  'Steven Tey': '/customers/lee-robinson.png',
  'Steph Dietz': '/customers/amy-burns.png',
  'Emil Kowalski': '/customers/balazs-orban.png',
};

async function checkAndFixImages() {
  try {
    // Get all customers
    const customers = await sql`
      SELECT id, name, email, image_url
      FROM customers
      ORDER BY name;
    `;

    const issues: Array<{ id: string; name: string; current: string; fixed: string }> = [];
    const updates: Array<Promise<any>> = [];

    for (const customer of customers) {
      const imageUrl = customer.image_url;
      
      // Check if image_url is in available images
      if (!availableImages.includes(imageUrl)) {
        // Try to find a mapped image
        const fixedImage = customerImageMap[customer.name] || availableImages[0];
        
        issues.push({
          id: customer.id,
          name: customer.name,
          current: imageUrl,
          fixed: fixedImage,
        });

        // Update the database
        updates.push(
          sql`
            UPDATE customers
            SET image_url = ${fixedImage}
            WHERE id = ${customer.id}
          `
        );
      }
    }

    // Execute all updates
    if (updates.length > 0) {
      await Promise.all(updates);
    }

    return {
      totalCustomers: customers.length,
      issuesFound: issues.length,
      issues,
      fixed: updates.length > 0,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to check and fix images.');
  }
}

export async function GET() {
  try {
    const result = await checkAndFixImages();
    return Response.json(result);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to fix images' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const result = await checkAndFixImages();
    return Response.json(result);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Failed to fix images' },
      { status: 500 }
    );
  }
}

