import { NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import Application from '@/lib/models/Application';
import { Types } from 'mongoose';

// GET handler - params must be awaited in Next.js 15
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params; // Await params before accessing properties
        
        if (!Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid Application ID" }, { status: 400 });
        }

        await connectMongoDB();
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

// PUT handler - params must be awaited in Next.js 15
export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params; // Await params before accessing properties
        
        if (!Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: "Invalid Application ID" }, { status: 400 });
        }
        
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