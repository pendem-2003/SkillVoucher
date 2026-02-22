import { PrismaClient } from '@prisma/client/extension';

const prisma: any = new (PrismaClient as any)();

async function main() {
  console.log('🌱 Seeding database with sample courses...');

  // Create sample courses
  const courses = [
    {
      title: 'Full Stack Web Development Bootcamp',
      slug: 'full-stack-web-development-bootcamp',
      shortDesc: 'Master HTML, CSS, JavaScript, React, Node.js, and MongoDB',
      description: 'Learn to build modern full-stack web applications from scratch. This comprehensive bootcamp covers everything from frontend fundamentals to backend development with databases.',
      price: 14999,
      originalPrice: 24999,
      thumbnail: 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=800',
      category: 'Web Development',
      level: 'BEGINNER',
      duration: 40,
      language: 'English',
      instructor: 'John Smith',
      status: 'PUBLISHED',
      isFeatured: true,
      whatYouLearn: [
        'Build responsive websites with HTML, CSS, and JavaScript',
        'Create dynamic web apps with React and Redux',
        'Develop REST APIs with Node.js and Express',
        'Work with MongoDB and Mongoose',
        'Deploy applications to production',
      ],
      requirements: [
        'Basic computer knowledge',
        'No prior programming experience required',
        'A computer with internet connection',
      ],
    },
    {
      title: 'Data Science and Machine Learning with Python',
      slug: 'data-science-machine-learning-python',
      shortDesc: 'Learn Python, pandas, NumPy, Matplotlib, Scikit-learn, and TensorFlow',
      description: 'Comprehensive course covering data analysis, visualization, machine learning algorithms, and deep learning with real-world projects.',
      price: 16999,
      originalPrice: 29999,
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800',
      category: 'Data Science',
      level: 'INTERMEDIATE',
      duration: 50,
      language: 'English',
      instructor: 'Dr. Sarah Johnson',
      status: 'PUBLISHED',
      isFeatured: true,
      whatYouLearn: [
        'Python programming fundamentals',
        'Data analysis with pandas and NumPy',
        'Data visualization with Matplotlib and Seaborn',
        'Machine learning algorithms with Scikit-learn',
        'Deep learning with TensorFlow and Keras',
      ],
      requirements: [
        'Basic programming knowledge helpful but not required',
        'Understanding of high school mathematics',
        'Python installed on your computer',
      ],
    },
    {
      title: 'Complete DevOps and Cloud Engineering',
      slug: 'complete-devops-cloud-engineering',
      shortDesc: 'Master Docker, Kubernetes, AWS, CI/CD, and Infrastructure as Code',
      description: 'Learn modern DevOps practices, cloud computing, containerization, and automation to become a DevOps engineer.',
      price: 18999,
      originalPrice: 34999,
      thumbnail: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800',
      category: 'DevOps',
      level: 'ADVANCED',
      duration: 45,
      language: 'English',
      instructor: 'Michael Chen',
      status: 'PUBLISHED',
      isFeatured: true,
      whatYouLearn: [
        'Containerization with Docker',
        'Container orchestration with Kubernetes',
        'AWS cloud services and architecture',
        'CI/CD pipelines with Jenkins and GitHub Actions',
        'Infrastructure as Code with Terraform',
      ],
      requirements: [
        'Linux command line experience',
        'Basic understanding of software development',
        'Familiarity with Git version control',
      ],
    },
    {
      title: 'Mobile App Development with React Native',
      slug: 'mobile-app-development-react-native',
      shortDesc: 'Build iOS and Android apps with React Native and Expo',
      description: 'Learn to create cross-platform mobile applications using React Native. Build and deploy real-world apps to App Store and Google Play.',
      price: 13999,
      originalPrice: 22999,
      thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
      category: 'Mobile Development',
      level: 'INTERMEDIATE',
      duration: 35,
      language: 'English',
      instructor: 'Emily Rodriguez',
      status: 'PUBLISHED',
      isFeatured: false,
      whatYouLearn: [
        'React Native fundamentals',
        'Navigation and routing',
        'State management with Redux',
        'Native device features (Camera, GPS, etc.)',
        'Publishing apps to app stores',
      ],
      requirements: [
        'JavaScript and React knowledge',
        'Node.js installed',
        'Mobile device or emulator for testing',
      ],
    },
    {
      title: 'Cybersecurity Fundamentals',
      slug: 'cybersecurity-fundamentals',
      shortDesc: 'Learn ethical hacking, network security, and penetration testing',
      description: 'Comprehensive cybersecurity course covering ethical hacking techniques, security best practices, and how to protect systems from attacks.',
      price: 15999,
      originalPrice: 27999,
      thumbnail: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800',
      category: 'Cybersecurity',
      level: 'BEGINNER',
      duration: 42,
      language: 'English',
      instructor: 'David Kumar',
      status: 'PUBLISHED',
      isFeatured: false,
      whatYouLearn: [
        'Network security fundamentals',
        'Ethical hacking techniques',
        'Penetration testing methodologies',
        'Security tools (Metasploit, Nmap, Wireshark)',
        'Web application security',
      ],
      requirements: [
        'Basic networking knowledge',
        'Understanding of operating systems',
        'No hacking experience required',
      ],
    },
    {
      title: 'UI/UX Design Masterclass',
      slug: 'ui-ux-design-masterclass',
      shortDesc: 'Master user interface design, user experience, and prototyping',
      description: 'Learn to design beautiful and user-friendly interfaces. Master Figma, design principles, and create stunning portfolios.',
      price: 11999,
      originalPrice: 19999,
      thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
      category: 'Design',
      level: 'BEGINNER',
      duration: 30,
      language: 'English',
      instructor: 'Lisa Thompson',
      status: 'PUBLISHED',
      isFeatured: false,
      whatYouLearn: [
        'Design principles and color theory',
        'User research and personas',
        'Wireframing and prototyping',
        'Figma and Adobe XD mastery',
        'Portfolio building',
      ],
      requirements: [
        'No design experience required',
        'Creative mindset',
        'Figma account (free)',
      ],
    },
  ];

  for (const courseData of courses) {
    const existingCourse = await prisma.course.findUnique({
      where: { slug: courseData.slug },
    });

    if (existingCourse) {
      console.log(`⏭️  Course "${courseData.title}" already exists, skipping...`);
      continue;
    }

    const course = await prisma.course.create({
      data: courseData,
    });

    console.log(`✅ Created course: ${course.title}`);

    // Create sample modules for each course
    const modules = [
      {
        title: 'Getting Started',
        description: 'Introduction and setup',
        order: 1,
        duration: 2,
      },
      {
        title: 'Core Concepts',
        description: 'Learn the fundamentals',
        order: 2,
        duration: 8,
      },
      {
        title: 'Advanced Topics',
        description: 'Deep dive into advanced concepts',
        order: 3,
        duration: 10,
      },
      {
        title: 'Final Project',
        description: 'Build a real-world project',
        order: 4,
        duration: 5,
      },
    ];

    for (const moduleData of modules) {
      await prisma.module.create({
        data: {
          ...moduleData,
          courseId: course.id,
        },
      });
    }

    console.log(`  📦 Created ${modules.length} modules for ${course.title}`);
  }

  console.log('\n✨ Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
