// /src/lib/models/Application.ts

import mongoose, { Schema, models, Document } from 'mongoose';

// Interface defining the structure of a single step
interface IProcessStep extends Document {
    stepNumber: number;
    stepTitle: string;
    status: 'Not Started' | 'In Progress' | 'Completed';
    documents: {
        fileName: string;
        filePath: string;
        uploadedAt: Date;
    }[];
    notes?: string;
}

// Interface defining the structure of the main Application document
export interface IApplication extends Document {
    applicationName: string;
    createdAt: Date;
    processSteps: IProcessStep[];
}

// Mongoose Schema for a single step
const processStepSchema = new Schema({
    stepNumber: { type: Number, required: true },
    stepTitle: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['Not Started', 'In Progress', 'Completed'], 
        default: 'Not Started' 
    },
    documents: [{
        fileName: String,
        filePath: String,
        uploadedAt: Date
    }],
    notes: String
});

// Mongoose Schema for the main Application
const applicationSchema = new Schema({
  applicationName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  processSteps: [processStepSchema]
});

// Create and export the model, preventing recompilation in Next.js dev environment
const Application = models.Application || mongoose.model<IApplication>('Application', applicationSchema);

export default Application;