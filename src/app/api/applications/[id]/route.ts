import { NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import Application from '@/lib/models/Application';

// The function signature is changed here.
// We get `request` as the first argument, and `{ params }` as the second.
// We don't need to destructure `params` from the second argument anymore.
export async function GET(
    request: Request, 
    { params }: { params: { id: string } }
) {
    try {
        await connectMongoDB();
        const { id } = params; // This is now safe
        const application = await Application.findById(id);

        if (!application) {
            return NextResponse.json({ error: "Application not found" }, { status: 404 });
        }

        return NextResponse.json(application);
    } catch (error) {
        console.error("Error fetching application:", error);
        return NextResponse.json({ error: "Failed to fetch application" }, { status: 500 });
    }
}

// We apply the same fix to the PUT function's signature
export async function PUT(
    request: Request, 
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params; // This is now safe
        const { stepNumber, newStatus } = await request.json();

        await connectMongoDB();
        
        const result = await Application.updateOne(
            { _id: id, "processSteps.stepNumber": stepNumber },
            { $set: { "processSteps.$.status": newStatus } }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: "Application or step not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Status updated successfully" });

    } catch (error) {
        console.error("Error updating status:", error);
        return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
    }
}