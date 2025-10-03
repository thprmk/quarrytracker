'use client';

import { useState, useEffect, use, useCallback } from 'react'; // FIX #1: Import the 'use' hook
import Link from 'next/link';
import { ArrowLeft, Check, Loader2, UploadCloud, Paperclip, Clock, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

// --- Type Definitions ---
type ProcessStatus = 'Not Started' | 'In Progress' | 'Completed';
interface Document { _id: string; fileName: string; }
interface ProcessStep { _id: string; stepNumber: number; stepTitle: string; status: ProcessStatus; documents: Document[]; }
interface ApplicationData { _id: string; applicationName: string; processSteps: ProcessStep[]; }
interface ApplicationTrackerPageProps {  params: Promise<{ id: string }>;  }

const StatusIcon = ({ status }: { status: ProcessStep['status'] }) => {
  if (status === 'Completed') return <Check className="h-4 w-4 text-white" />;
  if (status === 'In Progress') return <Clock className="h-4 w-4 text-yellow-800" />;
  return <div className="h-2 w-2 rounded-full bg-muted-foreground"></div>;
};

export default function ApplicationTrackerPage({ params }: ApplicationTrackerPageProps) {
    // FIX #2: Unwrap the promise-like params object using React.use()
    const { id } = use(params);

    const [application, setApplication] = useState<ApplicationData | null>(null);
    const [loading, setLoading] = useState(true);
    const [openStep, setOpenStep] = useState<number | null>(null);

    const fetchApplication = useCallback(async (isInitialLoad = false) => {
        try {
            // Now we use the unwrapped 'id' variable
            const res = await fetch(`/api/applications/${id}`);
            if (!res.ok) throw new Error("Failed to fetch application data");
            const data: ApplicationData = await res.json();
            setApplication(data);

            if (isInitialLoad) {
                const activeStep = data.processSteps.find(s => s.status === 'In Progress') || data.processSteps.find(s => s.status === 'Not Started');
                if (activeStep) {
                    setOpenStep(activeStep.stepNumber);
                }
            }
        } catch (error) {
            console.error(error);
            toast.error("Could not load project details.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchApplication(true);
    }, [fetchApplication]);

    // ... The rest of your functions (handleStatusChange, handleFileUpload, etc.) remain unchanged ...
    const handleStatusChange = async (stepNumber: number, newStatus: string) => {
        if (!application) return;
        const step = application.processSteps.find(s => s.stepNumber === stepNumber);
        if (!step) return;

        const originalApplication = JSON.parse(JSON.stringify(application));
        const updatedSteps = application.processSteps.map(s =>
            s.stepNumber === stepNumber ? { ...s, status: newStatus as ProcessStatus } : s
        );
        setApplication({ ...application, processSteps: updatedSteps });

        try {
            const res = await fetch(`/api/applications/${application._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stepNumber, newStatus }),
            });
            if (!res.ok) throw new Error("Failed to update status");
            toast.success(<span><b>{step.stepTitle}</b> updated to <b>{newStatus}</b>.</span>);
        } catch (error) {
            console.error("Failed to update status:", error);
            toast.error(`Failed to update ${step.stepTitle}.`);
            setApplication(originalApplication);
        }
    };

    const handleFileUpload = async (stepNumber: number, file: File) => {
        if (!file || !application) return;
        const step = application.processSteps.find(s => s.stepNumber === stepNumber);
        if (!step) return;

        const promise = fetch(`/api/applications/${application._id}/documents`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stepNumber, fileName: file.name }),
        });

        toast.promise(promise, {
            loading: `Uploading ${file.name}...`,
            success: (res) => {
                if (!res.ok) throw new Error("Upload failed");
                fetchApplication();
                return <span><b>{file.name}</b> uploaded to <b>{step.stepTitle}</b>.</span>;
            },
            error: <b>Upload failed for {file.name}.</b>
        });
    };

    const handleToggleStep = (stepNumber: number) => {
        setOpenStep(openStep === stepNumber ? null : stepNumber);
    };

    // ... The rest of your JSX remains unchanged ...
    if (loading) return (
      <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
    );
    if (!application) return (
      <div className="text-center py-12"><p className="font-semibold text-foreground">Project Not Found</p><Link href="/" className="text-primary hover:underline mt-2 inline-block">Return to Dashboard</Link></div>
    );
    const activeStepInfo = application.processSteps.find(s => s.stepNumber === openStep);
    return (
        <div className="animate-slide-in">
            <div className="mb-8">
                <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-semibold text-sm">
                    <ArrowLeft className="h-4 w-4" />
                    Back to All Projects
                </Link>
                <h1 className="text-3xl font-bold text-foreground mt-4">{application.applicationName}</h1>
                {activeStepInfo && (
                    <p className="text-muted-foreground mt-1">
                        Current Step: <span className="font-semibold text-foreground">{activeStepInfo.stepTitle}</span>
                    </p>
                )}
            </div>
            <div className="relative">
                <div className="absolute left-4 top-0 h-full w-0.5 bg-border"></div>
                <div className="space-y-8">
                    {application.processSteps.sort((a, b) => a.stepNumber - b.stepNumber).map((step) => {
                        const isOpen = openStep === step.stepNumber;
                        return (
                            <div key={step._id} className="relative pl-12">
                                <div className={`absolute top-0 -left-0.5 flex items-center justify-center w-9 h-9 rounded-full ${
                                    step.status === 'Completed' ? 'bg-green-600' :
                                    step.status === 'In Progress' ? 'bg-yellow-400' : 'bg-card border-2'
                                }`}>
                                    <StatusIcon status={step.status} />
                                </div>
                                <div className="group cursor-pointer" onClick={() => handleToggleStep(step.stepNumber)}>
                                    <div className="flex items-center justify-between">
                                        <h3 className={`font-semibold text-lg ${isOpen ? 'text-primary' : 'text-foreground'} group-hover:text-primary transition-colors`}>
                                            {step.stepTitle}
                                        </h3>
                                        <div className="flex items-center gap-4">
                                            <p className="text-sm text-muted-foreground">Step {step.stepNumber}</p>
                                            <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                        </div>
                                    </div>
                                </div>
                                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] mt-4' : 'max-h-0'}`}>
                                    <div className="bg-card p-6 rounded-lg border">
                                        <div>
                                            <h4 className="text-sm font-semibold text-foreground mb-3">Documents</h4>
                                            <div className="space-y-2">
                                                {step.documents.length > 0 ? (
                                                    step.documents.map(doc => (
                                                        <div key={doc._id} className="flex items-center gap-2 p-2 bg-accent rounded-md text-sm">
                                                            <Paperclip className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                            <span className="text-foreground font-medium truncate">{doc.fileName}</span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <p className="text-xs text-muted-foreground italic">No documents uploaded for this step.</p>
                                                )}
                                                <label className="flex items-center gap-2 text-sm text-primary font-semibold cursor-pointer hover:underline pt-2">
                                                    <UploadCloud className="h-4 w-4" />
                                                    <span>Upload Document</span>
                                                    <input type="file" className="hidden" onChange={(e) => e.target.files && handleFileUpload(step.stepNumber, e.target.files[0])} />
                                                </label>
                                            </div>
                                        </div>
                                        <div className="mt-6">
                                            <h4 className="text-sm font-semibold text-foreground mb-2">Update Status</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {(['Not Started', 'In Progress', 'Completed'] as const).map(statusValue => (
                                                    <button
                                                    key={statusValue}
                                                    onClick={() => handleStatusChange(step.stepNumber, statusValue)}
                                                    className={`text-xs font-semibold py-1 px-3 rounded-full border transition-colors ${
                                                        step.status === statusValue
                                                        ? 'bg-primary text-primary-foreground border-primary'
                                                        : 'bg-transparent text-muted-foreground hover:bg-accent hover:border-muted'
                                                    }`}
                                                    >
                                                    {statusValue}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}