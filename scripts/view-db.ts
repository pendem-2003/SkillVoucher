import prisma from '../lib/prisma';

async function main() {
    console.log('\n📊 DATABASE TABLES AND DATA\n');
    console.log('='.repeat(60));

    try {
        // Check Users
        console.log('\n👥 USERS TABLE:');
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                company: true,
                designation: true,
                role: true,
                createdAt: true,
            },
        });
        console.log(`Total users: ${users.length}`);
        users.forEach((user: any) => {
            console.log(`  - ${user.name} (${user.email}) - ${user.role}`);
            if (user.company) console.log(`    Company: ${user.company}`);
        });

        // Check Courses
        console.log('\n📚 COURSES TABLE:');
        const courses = await prisma.course.findMany({
            select: {
                id: true,
                title: true,
                slug: true,
                price: true,
                isActive: true,
                _count: {
                    select: {
                        enrollments: true,
                    },
                },
            },
        });
        console.log(`Total courses: ${courses.length}`);
        courses.forEach((course: any) => {
            console.log(`  - ${course.title} ($${course.price}) - ${course.isActive ? 'Active' : 'Inactive'}`);
            console.log(`    Enrollments: ${course._count.enrollments}`);
        });

        // Check Enrollments
        console.log('\n📝 ENROLLMENTS TABLE:');
        const enrollments = await prisma.enrollment.findMany({
            include: {
                user: {
                    select: { name: true, email: true },
                },
                course: {
                    select: { title: true },
                },
            },
        });
        console.log(`Total enrollments: ${enrollments.length}`);
        enrollments.forEach((enrollment: any) => {
            console.log(
                `  - ${enrollment.user.name} enrolled in "${enrollment.course.title}"`
            );
            console.log(`    Progress: ${enrollment.progress}% - Status: ${enrollment.isActive ? 'Active' : 'Inactive'}`);
        });

        // Check Course Requests
        console.log('\n💡 COURSE REQUESTS TABLE:');
        const requests = await prisma.courseRequest.findMany({
            include: {
                user: {
                    select: { name: true, email: true },
                },
            },
        });
        console.log(`Total requests: ${requests.length}`);
        requests.forEach((request: any) => {
            console.log(`  - "${request.courseName}" by ${request.user.name}`);
            console.log(`    Status: ${request.status}`);
            console.log(`    Description: ${request.description.substring(0, 60)}...`);
        });

        // Check Payments
        console.log('\n💳 PAYMENTS TABLE:');
        const payments = await prisma.payment.findMany({
            include: {
                user: {
                    select: { name: true },
                },
            },
        });
        console.log(`Total payments: ${payments.length}`);
        payments.forEach((payment: any) => {
            console.log(
                `  - ${payment.user.name}: $${payment.amount} - ${payment.status}`
            );
            console.log(`    Method: ${payment.paymentMethod} | Invoice: ${payment.invoiceNumber}`);
        });

        console.log('\n' + '='.repeat(60));
        console.log('✅ Database query completed successfully!\n');
    } catch (error) {
        console.error('\n❌ Error querying database:', error);
    }
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
