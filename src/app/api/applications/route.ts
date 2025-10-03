import { NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import Application from '@/lib/models/Application'; // This import should now work!

// The list of 12 steps for any new application
const initialSteps = [
    { stepNumber: 1, stepTitle: "Document for applicant (upload)" },
    { stepNumber: 2, stepTitle: "Submission of application fee" },
    { stepNumber: 3, stepTitle: "V.A.O, RI, Thasildar RDO reports" },
    { stepNumber: 4, stepTitle: "Soil test letter from AD Mines" },
    { stepNumber: 5, stepTitle: "Pay fees to Anna University" },
    { stepNumber: 6, stepTitle: "Upload soil test report" },
    { stepNumber: 7, stepTitle: "Receive Mining Plan from AD Mines" },
    { stepNumber: 8, stepTitle: "Upload affidavits from Notary" },
    { stepNumber: 9, stepTitle: "Upload Work Order & Company Details" },
    { stepNumber: 10, stepTitle: "Receive Proceedings from AD Mines" },
    { stepNumber: 11, stepTitle: "Pay final govt fees (4 fields)" },
    { stepNumber: 12, stepTitle: "Permit Issued (upload)" }
];

// This function handles POST requests to /api/applications
export async function POST(request: Request) {
    try {
        const { applicationName } = await request.json();

        if (!applicationName) {
            return NextResponse.json({ error: "Application name is required" }, { status: 400 });
        }

        await connectMongoDB();

        const newApplication = await Application.create({
            applicationName,
            processSteps: initialSteps.map(step => ({ ...step, status: 'Not Started', documents: [], notes: '' }))
        });

        return NextResponse.json(newApplication, { status: 201 });

    } catch (error) {
        console.error("Error creating application:", error);
        return NextResponse.json({ error: "Failed to create application" }, { status: 500 });
    }
}

// This function handles GET requests to /api/applications
export async function GET() {
    try {
        await connectMongoDB();
        const applications = await Application.find({});
        return NextResponse.json(applications);
    } catch (error) {
        console.error("Error fetching applications:", error);
        return NextResponse.json({ error: "Failed to fetch applications" }, { status: 500 });
    }
}