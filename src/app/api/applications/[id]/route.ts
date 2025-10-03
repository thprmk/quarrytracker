import { NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import Application from '@/lib/models/Application';
import { Types } from 'mongoose';

// The function signature must accept a `context` object as the second argument.
export async function GET(
    request: Request,
    context: { params: { id: string } }
) {
    try {
        const { params } = context; // Get params from the context
        const { id } = params;      // Then get the id from params
        
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

// The PUT function must also accept the `context` object.
export async function PUT(
    request: Request,
    context: { params: { id: string } }
) {
    try {
        const { params } = context;
        const { id } = params;
        
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