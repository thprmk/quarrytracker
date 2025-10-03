import { NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import Application from '@/lib/models/Application';
import { Types } from 'mongoose';

// The function signature MUST accept a 'context' object as the second argument.
export async function PUT(
    request: Request,
    context: { params: { id: string } }
) {
    try {
        const { params } = context; // Get params FROM the context object
        const { id } = params;      // Then get the id FROM params
        
        const { stepNumber, fileName } = await request.json();

        if (!stepNumber || !fileName) {
            return NextResponse.json({ error: 'Step number and file name are required' }, { status: 400 });
        }
        if (!Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Invalid Application ID' }, { status: 400 });
        }

        await connectMongoDB();

        const result = await Application.updateOne(
            { _id: id, "processSteps.stepNumber": stepNumber },
            { 
                $push: { 
                    "processSteps.$.documents": { fileName } 
                } 
            }
        );

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: "Application or specific step not found" }, { status: 404 });
        }
        
        return NextResponse.json({ message: 'Document added successfully' });

    } catch (error) {
        console.error("Error adding document:", error);
        return NextResponse.json({ error: 'Failed to add document' }, { status: 500 });
    }
}