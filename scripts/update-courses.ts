// Script to update existing courses with default ratings and student counts
import { prisma } from '../lib/prisma';

async function updateCourses() {
    try {
        // Get all courses with 0 students or no rating
        const courses = await prisma.course.findMany({
            where: {
                OR: [
                    { studentsCount: 0 },
                    { rating: null },
                    { rating: 0 }
                ]
            }
        });

        console.log(`Found ${courses.length} courses to update`);

        for (const course of courses) {
            const rating = 4.8 + Math.random() * 0.2; // 4.8 - 5.0
            const studentsCount = Math.floor(Math.random() * 1001) + 2000; // 2000 - 3000

            await prisma.course.update({
                where: { id: course.id },
                data: {
                    rating,
                    studentsCount
                }
            });

            console.log(`Updated ${course.title}: ${studentsCount} students, ${rating.toFixed(1)} rating`);
        }

        console.log('✅ All courses updated successfully!');
    } catch (error) {
        console.error('Error updating courses:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateCourses();
