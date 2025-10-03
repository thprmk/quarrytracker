import { NextResponse } from 'next/server';
import connectMongoDB from '@/lib/mongodb';
import Application from '@/lib/models/Application';
import { Types } from 'mongoose';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const { stepNumber, fileName } = await request.json();

        // Validate input
        if (!stepNumber || !fileName) {
            return NextResponse.json({ error: 'Step number and file name are required' }, { status: 400 });
        }
        if (!Types.ObjectId.isValid(id)) {
            return NextResponse.json({ error: 'Invalid Application ID' }, { status: 400 });
        }

        await connectMongoDB();

        // Find the application and push the new document into the correct step's documents array
        const result = await Application.updateOne(
            { _id: id, "processSteps.stepNumber": stepNumber },
            { 
                // $push adds an item to an array.
                // The `$` is a positional operator that targets the array element matched in the query.
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