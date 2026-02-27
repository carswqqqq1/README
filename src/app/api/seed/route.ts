import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

const DTC_BRANDS = [
  // Health & Nutrition
  { name: 'AG1 (Athletic Greens)', category: 'Health & Nutrition', library_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=AG1+Athletic+Greens&search_type=keyword_unordered' },
  { name: 'Gruns', category: 'Health & Nutrition', library_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=Gruns+gummies&search_type=keyword_unordered' },
  { name: 'Magic Spoon', category: 'Food & Beverage', library_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=Magic+Spoon+cereal&search_type=keyword_unordered' },
  { name: 'Chomps', category: 'Food & Beverage', library_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=Chomps+snacks&search_type=keyword_unordered' },
  { name: 'Liquid IV', category: 'Health & Nutrition', library_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=Liquid+IV+hydration&search_type=keyword_unordered' },
  { name: 'Orgain', category: 'Health & Nutrition', library_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=Orgain+protein&search_type=keyword_unordered' },
  { name: 'Bloom Nutrition', category: 'Health & Nutrition', library_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=Bloom+Nutrition&search_type=keyword_unordered' },
  { name: 'RXBAR', category: 'Food & Beverage', library_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=RXBAR+protein+bar&search_type=keyword_unordered' },

  // Beauty & Skincare
  { name: 'Jones Road Beauty', category: 'Beauty', library_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=Jones+Road+Beauty&search_type=keyword_unordered' },
  { name: 'Glossier', category: 'Beauty', library_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=Glossier+makeup&search_type=keyword_unordered' },
  { name: 'Hero Cosmetics', category: 'Beauty', library_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=Hero+Cosmetics+acne&search_type=keyword_unordered' },
  { name: "Paula's Choice", category: 'Beauty', library_url: "https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=Paula's+Choice+skincare&search_type=keyword_unordered" },
  { name: 'ILIA Beauty', category: 'Beauty', library_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=ILIA+Beauty&search_type=keyword_unordered' },
  { name: 'Tower 28', category: 'Beauty', library_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=Tower+28+Beauty&search_type=keyword_unordered' },
  { name: 'Saie Beauty', category: 'Beauty', library_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=Saie+Beauty+makeup&search_type=keyword_unordered' },
  { name: 'Rare Beauty', category: 'Beauty', library_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=Rare+Beauty+Selena&search_type=keyword_unordered' },
  { name: 'The Ordinary', category: 'Beauty', library_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=The+Ordinary+skincare&search_type=keyword_unordered' },
  { name: 'Fenty Beauty', category: 'Beauty', library_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=Fenty+Beauty+Rihanna&search_type=keyword_unordered' },

  // Personal Care
  { name: 'Dr. Squatch', category: 'Personal Care', library_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=Dr.+Squatch+soap&search_type=keyword_unordered' },
  { name: 'Native', category: 'Personal Care', library_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=Native+deodorant&search_type=keyword_unordered' },
  { name: 'Dollar Shave Club', category: 'Personal Care', library_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=Dollar+Shave+Club&search_type=keyword_unordered' },
  { name: 'Hims', category: 'Personal Care', library_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=Hims+hair+loss&search_type=keyword_unordered' },
  { name: 'Keeps', category: 'Personal Care', library_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=Keeps+hair+loss&search_type=keyword_unordered' },
  { name: 'Roman', category: 'Personal Care', library_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=Roman+Health&search_type=keyword_unordered' },
  { name: 'Manscaped', category: 'Personal Care', library_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=Manscaped+grooming&search_type=keyword_unordered' },

  // Apparel & Fashion
  { name: 'Gymshark', category: 'Apparel', library_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=Gymshark+fitness&search_type=keyword_unordered' },
  { name: 'Vuori', category: 'Apparel', library_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=Vuori+clothing&search_type=keyword_unordered' },
  { name: 'Rhone', category: 'Apparel', library_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=Rhone+clothing&search_type=keyword_unordered' },
  { name: 'True Classic', category: 'Apparel', library_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=True+Classic+tees&search_type=keyword_unordered' },
  { name: 'Cuts Clothing', category: 'Apparel', library_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=Cuts+Clothing&search_type=keyword_unordered' },
  { name: 'Chubbies', category: 'Apparel', library_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=Chubbies+shorts&search_type=keyword_unordered' },
  { name: 'Fabletics', category: 'Apparel', library_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=Fabletics+activewear&search_type=keyword_unordered' },
  { name: 'Outdoor Voices', category: 'Apparel', library_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=Outdoor+Voices+activewear&search_type=keyword_unordered' },
  { name: 'Alo Yoga', category: 'Apparel', library_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=Alo+Yoga+clothing&search_type=keyword_unordered' },
  { name: 'SKIMS', category: 'Apparel', library_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=SKIMS+shapewear&search_type=keyword_unordered' },
  { name: 'Parade', category: 'Apparel', library_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=Parade+underwear&search_type=keyword_unordered' },
  { name: 'ThirdLove', category: 'Apparel', library_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=ThirdLove+bra&search_type=keyword_unordered' },
  { name: 'Allbirds', category: 'Footwear', library_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=Allbirds+shoes&search_type=keyword_unordered' },

  // Accessories & Watches
  { name: 'Ridge Wallet', category: 'Accessories', library_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=Ridge+Wallet&search_type=keyword_unordered' },
  { name: 'MVMT Watches', category: 'Accessories', library_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=MVMT+watches&search_type=keyword_unordered' },
  { name: 'Vincero', category: 'Accessories', library_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=Vincero+watches&search_type=keyword_unordered' },
  { name: 'Daniel Wellington', category: 'Accessories', library_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=Daniel+Wellington+watch&search_type=keyword_unordered' },
  { name: 'Quay Australia', category: 'Accessories', library_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=Quay+Australia+sunglasses&search_type=keyword_unordered' },

  // Home & Lifestyle
  { name: 'Caraway', category: 'Home & Kitchen', library_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=Caraway+cookware&search_type=keyword_unordered' },
  { name: 'Our Place', category: 'Home & Kitchen', library_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=Our+Place+cookware&search_type=keyword_unordered' },
  { name: 'Parachute Home', category: 'Home & Bedroom', library_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=Parachute+Home+bedding&search_type=keyword_unordered' },
  { name: 'Brooklinen', category: 'Home & Bedroom', library_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=Brooklinen+sheets&search_type=keyword_unordered' },

  // Sleep & Wellness
  { name: 'Casper', category: 'Sleep & Wellness', library_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=Casper+mattress&search_type=keyword_unordered' },
  { name: 'Purple Mattress', category: 'Sleep & Wellness', library_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=Purple+Mattress&search_type=keyword_unordered' },
  { name: 'Saatva', category: 'Sleep & Wellness', library_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=Saatva+mattress&search_type=keyword_unordered' },
  { name: 'Tuft & Needle', category: 'Sleep & Wellness', library_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=Tuft+Needle+mattress&search_type=keyword_unordered' },

  // Eyewear
  { name: 'Warby Parker', category: 'Eyewear', library_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=Warby+Parker+glasses&search_type=keyword_unordered' },

  // Socks & Underwear
  { name: 'Bombas', category: 'Apparel', library_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=Bombas+socks&search_type=keyword_unordered' },
  { name: 'Cuup', category: 'Apparel', library_url: 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=Cuup+bra&search_type=keyword_unordered' },
];

export async function POST() {
  try {
    const db = getDb();
    const insert = db.prepare(`
      INSERT OR IGNORE INTO brands (name, category, library_url)
      VALUES (@name, @category, @library_url)
    `);

    const insertMany = db.transaction((brands: typeof DTC_BRANDS) => {
      for (const brand of brands) insert.run(brand);
    });

    insertMany(DTC_BRANDS);

    const count = (db.prepare('SELECT COUNT(*) as c FROM brands').get() as { c: number }).c;
    return NextResponse.json({ ok: true, total_brands: count, seeded: DTC_BRANDS.length });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function GET() {
  // GET also seeds so it's easy to trigger from the browser
  return POST();
}
