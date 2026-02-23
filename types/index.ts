export interface CourseCardProps {
    id: string;
    title: string;
    slug: string;
    shortDesc?: string;
    thumbnail: string;
    price: number;
    category: string;
    level: string;
    rating?: number;
    studentsCount: number;
    isFeatured?: boolean;
}

export interface EnrollmentWithCourse {
    id: string;
    startDate: Date;
    endDate: Date;
    progress: number;
    isActive: boolean;
    course: {
        id: string;
        title: string;
        thumbnail: string;
        slug: string;
    };
}

export interface PaymentDetails {
    amount: number;
    currency: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    customerCompany?: string;
    refundOption?: 'SAME_ACCOUNT' | 'MOBILE_NUMBER' | 'UPI_ID';
    refundAccount?: string;
    refundMobile?: string;
}

export interface InvoiceData {
    invoiceNumber: string;
    date: Date;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    customerCompany?: string;
    courseName: string;
    amount: number;
    currency: string;
    paymentMethod: string;
    transactionId: string;
    companyPhone?: string;
    companyName?: string;
    companyAddress?: string;
    companyEmail?: string;
}
