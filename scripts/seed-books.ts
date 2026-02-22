// Script to seed books database with famous technical, inspiring, and novel books
import prisma from '../lib/prisma';

const books = [
  // Technical & Programming Books
  {
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    slug: 'clean-code-robert-martin',
    author: 'Robert C. Martin',
    description: 'Even bad code can function. But if code isn\'t clean, it can bring a development organization to its knees. Every year, countless hours and significant resources are lost because of poorly written code. This book will teach you the best practices of writing clean, readable code.',
    shortDesc: 'Master the art of writing clean, maintainable code',
    thumbnail: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400',
    price: 899,
    category: 'Programming',
    language: 'English',
    pages: 464,
    publisher: 'Prentice Hall',
    publishedYear: 2008,
    isbn: '978-0132350884',
  },
  {
    title: 'The Pragmatic Programmer: Your Journey To Mastery',
    slug: 'pragmatic-programmer',
    author: 'David Thomas, Andrew Hunt',
    description: 'The Pragmatic Programmer is one of those rare tech books you\'ll read, re-read, and read again over the years. Whether you\'re new to the field or an experienced practitioner, you\'ll come away with fresh insights each and every time.',
    shortDesc: 'Timeless lessons for software craftsmanship',
    thumbnail: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400',
    price: 1099,
    category: 'Programming',
    language: 'English',
    pages: 352,
    publisher: 'Addison-Wesley',
    publishedYear: 2019,
    isbn: '978-0135957059',
  },
  {
    title: 'Design Patterns: Elements of Reusable Object-Oriented Software',
    slug: 'design-patterns-gang-of-four',
    author: 'Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides',
    description: 'Capturing a wealth of experience about the design of object-oriented software, four top-notch designers present a catalog of simple and succinct solutions to commonly occurring design problems.',
    shortDesc: 'The classic guide to software design patterns',
    thumbnail: 'https://images.unsplash.com/photo-1509266272358-7701da638078?w=400',
    price: 1299,
    category: 'Programming',
    language: 'English',
    pages: 416,
    publisher: 'Addison-Wesley',
    publishedYear: 1994,
    isbn: '978-0201633610',
  },
  {
    title: 'You Don\'t Know JS: Scope & Closures',
    slug: 'you-dont-know-js-scope-closures',
    author: 'Kyle Simpson',
    description: 'No matter how much experience you have with JavaScript, odds are you don\'t fully understand the language. This concise yet in-depth guide takes you inside scope and closures, two core concepts you need to know to become a more efficient and effective JavaScript programmer.',
    shortDesc: 'Deep dive into JavaScript scope and closures',
    thumbnail: 'https://images.unsplash.com/photo-1524666041070-9d87656c25bb?w=400',
    price: 599,
    category: 'Programming',
    language: 'English',
    pages: 98,
    publisher: 'O\'Reilly Media',
    publishedYear: 2014,
    isbn: '978-1449335588',
  },

  // Business & Self-Help Books
  {
    title: 'Atomic Habits: An Easy & Proven Way to Build Good Habits',
    slug: 'atomic-habits-james-clear',
    author: 'James Clear',
    description: 'No matter your goals, Atomic Habits offers a proven framework for improving--every day. James Clear, one of the world\'s leading experts on habit formation, reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.',
    shortDesc: 'Transform your life through better habits',
    thumbnail: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
    price: 699,
    category: 'Self-Help',
    language: 'English',
    pages: 320,
    publisher: 'Avery',
    publishedYear: 2018,
    isbn: '978-0735211292',
  },
  {
    title: 'Think and Grow Rich',
    slug: 'think-and-grow-rich-napoleon-hill',
    author: 'Napoleon Hill',
    description: 'Think and Grow Rich has been called the "Granddaddy of All Motivational Literature." It was the first book to boldly ask, "What makes a winner?" The man who asked and listened for the answer, Napoleon Hill, is now counted in the top ranks of the world\'s winners himself.',
    shortDesc: 'Classic guide to success and wealth',
    thumbnail: 'https://images.unsplash.com/photo-1513001900722-370f803f498d?w=400',
    price: 499,
    category: 'Self-Help',
    language: 'English',
    pages: 238,
    publisher: 'Sound Wisdom',
    publishedYear: 1937,
    isbn: '978-1937879501',
  },
  {
    title: 'The 7 Habits of Highly Effective People',
    slug: '7-habits-highly-effective-people',
    author: 'Stephen R. Covey',
    description: 'One of the most inspiring and impactful books ever written, The 7 Habits of Highly Effective People has captivated readers for nearly three decades. It has transformed the lives of presidents and CEOs, educators and parents—millions of people of all ages and occupations.',
    shortDesc: 'Timeless wisdom for personal effectiveness',
    thumbnail: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400',
    price: 799,
    category: 'Self-Help',
    language: 'English',
    pages: 381,
    publisher: 'Simon & Schuster',
    publishedYear: 1989,
    isbn: '978-1982137274',
  },
  {
    title: 'The Lean Startup',
    slug: 'lean-startup-eric-ries',
    author: 'Eric Ries',
    description: 'The Lean Startup approach fosters companies that are both more capital efficient and that leverage human creativity more effectively. Inspired by lessons from lean manufacturing, it relies on "validated learning," rapid scientific experimentation, as well as a number of counter-intuitive practices that shorten product development cycles.',
    shortDesc: 'Revolutionary approach to building startups',
    thumbnail: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=400',
    price: 899,
    category: 'Business',
    language: 'English',
    pages: 336,
    publisher: 'Crown Business',
    publishedYear: 2011,
    isbn: '978-0307887894',
  },

  // Classic Novels
  {
    title: 'The Alchemist',
    slug: 'the-alchemist-paulo-coelho',
    author: 'Paulo Coelho',
    description: 'Paulo Coelho\'s masterpiece tells the mystical story of Santiago, an Andalusian shepherd boy who yearns to travel in search of a worldly treasure. His quest will lead him to riches far different—and far more satisfying—than he ever imagined.',
    shortDesc: 'Follow your dreams in this inspiring tale',
    thumbnail: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
    price: 399,
    category: 'Novel',
    language: 'English',
    pages: 208,
    publisher: 'HarperOne',
    publishedYear: 1988,
    isbn: '978-0062315007',
  },
  {
    title: '1984',
    slug: '1984-george-orwell',
    author: 'George Orwell',
    description: 'Among the seminal texts of the 20th century, Nineteen Eighty-Four is a rare work that grows more haunting as its futuristic purgatory becomes more real. Published in 1949, the book offers political satirist George Orwell\'s nightmare vision of a totalitarian, bureaucratic world.',
    shortDesc: 'Dystopian masterpiece about totalitarianism',
    thumbnail: 'https://images.unsplash.com/photo-1495640452828-3df6795cf69b?w=400',
    price: 449,
    category: 'Novel',
    language: 'English',
    pages: 328,
    publisher: 'Signet Classics',
    publishedYear: 1949,
    isbn: '978-0451524935',
  },
  {
    title: 'To Kill a Mockingbird',
    slug: 'to-kill-a-mockingbird',
    author: 'Harper Lee',
    description: 'The unforgettable novel of a childhood in a sleepy Southern town and the crisis of conscience that rocked it. "To Kill A Mockingbird" became both an instant bestseller and a critical success when it was first published in 1960.',
    shortDesc: 'Timeless story of justice and moral growth',
    thumbnail: 'https://images.unsplash.com/photo-1544716278-e513176f20b5?w=400',
    price: 499,
    category: 'Novel',
    language: 'English',
    pages: 324,
    publisher: 'Harper Perennial',
    publishedYear: 1960,
    isbn: '978-0061120084',
  },

  // Biography
  {
    title: 'Steve Jobs',
    slug: 'steve-jobs-walter-isaacson',
    author: 'Walter Isaacson',
    description: 'Based on more than forty interviews with Steve Jobs conducted over two years—as well as interviews with more than 100 family members, friends, adversaries, competitors, and colleagues—Walter Isaacson has written a riveting story of the roller-coaster life and searingly intense personality of a creative entrepreneur.',
    shortDesc: 'Definitive biography of Apple\'s visionary founder',
    thumbnail: 'https://images.unsplash.com/photo-1526243741027-444d633d7365?w=400',
    price: 999,
    category: 'Biography',
    language: 'English',
    pages: 656,
    publisher: 'Simon & Schuster',
    publishedYear: 2011,
    isbn: '978-1451648539',
  },
];

async function seedBooks() {
  console.log('🌱 Seeding books database...');

  for (const book of books) {
    try {
      const existingBook = await prisma.book.findUnique({
        where: { slug: book.slug },
      });

      if (existingBook) {
        console.log(`  ⏭️  Skipping "${book.title}" (already exists)`);
        continue;
      }

      await prisma.book.create({
        data: {
          ...book,
          rating: 4.5 + Math.random() * 0.5, // Random rating between 4.5 and 5.0
          ordersCount: Math.floor(Math.random() * 501) + 100, // Random orders between 100 and 600
          isActive: true,
          isFeatured: Math.random() > 0.7, // 30% chance of being featured
        },
      });

      console.log(`  ✅ Created "${book.title}"`);
    } catch (error) {
      console.error(`  ❌ Error creating "${book.title}":`, error);
    }
  }

  console.log('✨ Books seeding completed!');
}

seedBooks()
  .catch((error) => {
    console.error('Error seeding books:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
