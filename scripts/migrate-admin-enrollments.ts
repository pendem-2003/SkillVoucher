import prisma from '../lib/prisma';

async function migrateAdminEnrollments() {
    try {
        console.log('🔄 Starting admin enrollment migration...');

        // Find all admin users
        const admins = await prisma.user.findMany({
            where: { role: 'ADMIN' },
            select: { id: true, email: true },
        });

        console.log(`Found ${admins.length} admin user(s)`);

        // Get all courses
        const allCourses = await prisma.course.findMany({
            select: { id: true, title: true },
        });

        console.log(`Found ${allCourses.length} course(s)`);

        for (const admin of admins) {
            console.log(`\n👤 Processing admin: ${admin.email}`);

            // Get existing enrollments for this admin
            const existingEnrollments = await prisma.enrollment.findMany({
                where: { userId: admin.id },
                select: { courseId: true },
            });

            const existingCourseIds = new Set(existingEnrollments.map((e: any) => e.courseId));
            console.log(`  ✓ Already enrolled in ${existingEnrollments.length} course(s)`);

            // Create enrollments for courses not already enrolled
            const enrollmentsToCreate = allCourses
                .filter((course: any) => !existingCourseIds.has(course.id))
                .map((course: any) => ({
                    id: `admin-auto-${admin.id}-${course.id}`,
                    userId: admin.id,
                    courseId: course.id,
                    startDate: new Date(),
                    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year access
                    isActive: true,
                    progress: 0,
                }));

            if (enrollmentsToCreate.length > 0) {
                await prisma.enrollment.createMany({
                    data: enrollmentsToCreate,
                });
                console.log(`  ✅ Created ${enrollmentsToCreate.length} new enrollment(s)`);
            } else {
                console.log(`  ℹ️  No new enrollments needed`);
            }
        }

        console.log('\n✨ Migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

migrateAdminEnrollments();
