'use client';

import { useState, useEffect, FormEvent, useMemo } from 'react';
import Link from 'next/link';
import { Plus, FolderKanban, Loader2, Search, X, List, LayoutGrid, ArrowUpDown, MoreHorizontal } from 'lucide-react';
import ProjectCardSkeleton from '../components/ProjectCardSkeleton';
import toast from 'react-hot-toast';

// --- ENHANCED INTERFACE: Now includes the full step details for smarter cards ---
interface ProcessStep {
  status: string;
  stepTitle: string;
}
interface Application {
  _id: string;
  applicationName: string;
  processSteps: ProcessStep[];
}

export default function HomePage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [newAppName, setNewAppName] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  // --- NEW STATE ---
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortOption, setSortOption] = useState('name-asc');

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
        setShowCreateModal(false); // Hide the modal on success
        fetchApplications();
        return <b>Project created successfully!</b>;
      },
      error: () => {
        setIsSubmitting(false);
        return <b>Could not create project.</b>;
      },
    });
  };

  // --- NEW: Memoized sorting and filtering for performance ---
  const processedApplications = useMemo(() => {
    return applications
      .filter(app => app.applicationName.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        if (sortOption === 'name-asc') {
          return a.applicationName.localeCompare(b.applicationName);
        }
        if (sortOption === 'name-desc') {
          return b.applicationName.localeCompare(a.applicationName);
        }
        if (sortOption === 'progress-desc') {
          const progressA = a.processSteps.filter(s => s.status === 'Completed').length;
          const progressB = b.processSteps.filter(s => s.status === 'Completed').length;
          return progressB - progressA;
        }
        return 0;
      });
  }, [applications, searchTerm, sortOption]);

  return (
    <div className="animate-slide-in">
      {/* --- REFINED PAGE HEADER --- */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground mt-1">Manage and track all your quarry applications.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 bg-primary text-primary-foreground font-semibold py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>New Project</span>
        </button>
      </div>

      {/* --- NEW: Modal for creating a project --- */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-fade-in">
          <div className="bg-card p-6 rounded-lg border w-full max-w-lg m-4">
              <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-foreground">Start a New Project</h2>
                  <button onClick={() => setShowCreateModal(false)} className="p-1 rounded-full hover:bg-accent">
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
      )}

      {/* --- REFINED PROJECTS LIST SECTION --- */}
      <div className="bg-card p-6 rounded-lg border">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 pb-4 border-b">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-3 py-2 w-full md:w-80 bg-background border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
            </div>
            <div className='flex items-center gap-2'>
                {/* Sort Dropdown */}
                <select onChange={(e) => setSortOption(e.target.value)} value={sortOption} className="py-2 pl-3 pr-8 bg-background border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="name-asc">Sort by Name (A-Z)</option>
                    <option value="name-desc">Sort by Name (Z-A)</option>
                    <option value="progress-desc">Sort by Progress</option>
                </select>
                {/* View Toggle */}
                <div className='flex items-center border rounded-md bg-background p-1'>
                    <button onClick={() => setViewMode('list')} className={`p-1 rounded ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}><List className="h-4 w-4" /></button>
                    <button onClick={() => setViewMode('grid')} className={`p-1 rounded ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}><LayoutGrid className="h-4 w-4" /></button>
                </div>
            </div>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ProjectCardSkeleton /> <ProjectCardSkeleton /> <ProjectCardSkeleton />
            </div>
          ) : processedApplications.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-block p-4 bg-accent rounded-full"><FolderKanban className="h-8 w-8 text-muted-foreground" /></div>
              <p className="font-semibold text-foreground mt-4">No Projects Found</p>
              <p className="text-sm text-muted-foreground mt-1">{searchTerm ? "Try adjusting your search criteria." : "Click 'New Project' to get started."}</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {processedApplications.map((app) => <ProjectCard key={app._id} app={app} />)}
            </div>
          ) : (
            <div className="space-y-4">
              {processedApplications.map((app) => <ProjectListItem key={app._id} app={app} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- NEW: Project Card Component for Grid View ---
function ProjectCard({ app }: { app: Application }) {
    const completedSteps = app.processSteps.filter(s => s.status === 'Completed').length;
    const progress = app.processSteps.length > 0 ? (completedSteps / app.processSteps.length) * 100 : 0;
    const nextStep = app.processSteps.find(s => s.status === 'In Progress' || s.status === 'Not Started');

    return (
        <Link href={`/applications/${app._id}`} className="block group">
            <div className="bg-card p-6 rounded-lg border group-hover:border-primary group-hover:shadow-xl transition-all h-full flex flex-col justify-between">
                <div>
                    <div className="flex items-start justify-between mb-4">
                        <div className="bg-accent p-3 rounded-lg"><FolderKanban className="h-6 w-6 text-accent-foreground" /></div>
                        <p className="text-sm font-semibold text-primary">{Math.round(progress)}%</p>
                    </div>
                    <h3 className="font-bold text-base text-foreground mb-1 truncate">{app.applicationName}</h3>
                    <p className="text-sm text-muted-foreground">{completedSteps} of {app.processSteps.length} steps complete</p>
                    {nextStep && <p className="text-xs text-muted-foreground mt-2">Next: {nextStep.stepTitle}</p>}
                </div>
                <div className="mt-6">
                    <div className="w-full bg-muted rounded-full h-1.5"><div className="bg-primary h-1.5 rounded-full" style={{ width: `${progress}%` }}></div></div>
                </div>
            </div>
        </Link>
    );
}

// --- NEW: Project List Item Component for List View ---
function ProjectListItem({ app }: { app: Application }) {
    const completedSteps = app.processSteps.filter(s => s.status === 'Completed').length;
    const progress = app.processSteps.length > 0 ? (completedSteps / app.processSteps.length) * 100 : 0;
    const nextStep = app.processSteps.find(s => s.status === 'In Progress' || s.status === 'Not Started');

    return (
        <Link href={`/applications/${app._id}`} className="block group">
            <div className="flex items-center justify-between p-4 rounded-lg border bg-card group-hover:bg-accent group-hover:border-primary transition-colors">
                <div className="flex items-center gap-4">
                    <div className="w-2 h-10 rounded-full" style={{ backgroundColor: `hsl(var(--primary), ${progress/100})`}}></div>
                    <div>
                        <h3 className="font-semibold text-foreground truncate">{app.applicationName}</h3>
                        {nextStep && <p className="text-sm text-muted-foreground">Next: {nextStep.stepTitle}</p>}
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <div className="hidden md:block w-32 text-right">
                        <p className="text-sm font-semibold text-foreground">{Math.round(progress)}%</p>
                        <div className="w-full bg-muted rounded-full h-1 mt-1"><div className="bg-primary h-1 rounded-full" style={{ width: `${progress}%` }}></div></div>
                    </div>
                    <button className="p-2 rounded-md hover:bg-muted-foreground/10"><MoreHorizontal className="h-4 w-4 text-muted-foreground" /></button>
                </div>
            </div>
        </Link>
    );
}