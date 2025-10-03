'use client';

import { useState, useEffect, FormEvent } from 'react';
import Link from 'next/link';
import { Plus, FolderKanban, Loader2, Search, X } from 'lucide-react';
import ProjectCardSkeleton from '../components/ProjectCardSkeleton';
import toast from 'react-hot-toast';

// Defines the shape of our application data, including steps for the progress bar
interface Application {
  _id: string;
  applicationName: string;
  processSteps: { status: string }[];
}

export default function HomePage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [newAppName, setNewAppName] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  // --- NEW STATE: Controls the visibility of the "Create Project" form ---
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/applications');
      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();
      setApplications(data);
    } catch (error) {
      toast.error("Could not load projects.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newAppName) {
      toast.error("Please enter a project name.");
      return;
    }
    
    setIsSubmitting(true);
    const promise = fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationName: newAppName }),
    });

    toast.promise(promise, {
      loading: 'Creating project...',
      success: () => {
        setNewAppName('');
        setIsSubmitting(false);
        setShowCreateForm(false); // Hide the form on success
        fetchApplications();
        return <b>Project created successfully!</b>;
      },
      error: () => {
        setIsSubmitting(false);
        return <b>Could not create project.</b>;
      },
    });
  };

  const filteredApplications = applications.filter(app =>
    app.applicationName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-slide-in">
      {/* --- NEW, REFINED PAGE HEADER --- */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground mt-1">Manage and track all your quarry applications.</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>New Project</span>
        </button>
      </div>

      {/* --- NEW, COLLAPSIBLE CREATE FORM --- */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showCreateForm ? 'max-h-96' : 'max-h-0'}`}>
        <div className="bg-card p-6 rounded-lg border mb-8">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Start a New Project</h2>
                <button onClick={() => setShowCreateForm(false)} className="p-1 rounded-full hover:bg-accent">
                    <X className="h-4 w-4 text-muted-foreground" />
                </button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
                type="text"
                value={newAppName}
                onChange={(e) => setNewAppName(e.target.value)}
                placeholder="E.g., 'Green Valley Quarry Application'"
                className="flex-grow p-2 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-2 px-4 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <span>Create Project</span>}
            </button>
            </form>
        </div>
      </div>


      {/* --- REFINED PROJECTS LIST SECTION --- */}
      <div className="bg-card p-6 rounded-lg border">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 pb-4 border-b">
            <h2 className="text-lg font-semibold text-foreground">All Projects ({filteredApplications.length})</h2>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-3 py-2 w-full md:w-64 bg-background border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
            </div>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
              <ProjectCardSkeleton />
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-block p-4 bg-accent rounded-full">
                <FolderKanban className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="font-semibold text-foreground mt-4">No Projects Found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {searchTerm ? "Try adjusting your search criteria." : "Click 'New Project' to get started."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredApplications.map((app) => {
                const completedSteps = app.processSteps.filter(s => s.status === 'Completed').length;
                const progress = app.processSteps.length > 0 ? (completedSteps / app.processSteps.length) * 100 : 0;

                return (
                  <Link key={app._id} href={`/applications/${app._id}`} className="block group">
                    <div className="bg-card p-6 rounded-lg border group-hover:border-primary group-hover:shadow-lg transition-all h-full flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between mb-4">
                          <div className="bg-accent p-3 rounded-lg">
                            <FolderKanban className="h-6 w-6 text-accent-foreground" />
                          </div>
                          <p className="text-sm font-semibold text-primary">{Math.round(progress)}%</p>
                        </div>
                        <h3 className="font-bold text-base text-foreground mb-1 truncate">{app.applicationName}</h3>
                        <p className="text-sm text-muted-foreground">{completedSteps} of {app.processSteps.length} steps complete</p>
                      </div>
                      <div className="mt-6">
                        <div className="w-full bg-muted rounded-full h-1.5">
                            <div className="bg-primary h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}