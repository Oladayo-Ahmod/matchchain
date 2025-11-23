import { notFound } from 'next/navigation';
import { JobDetails } from '../components/JobDetails';
import { ApplySection } from '../components/ApplySection';

async function getJob(id: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/jobs/${id}`, {
      next: { revalidate: 60 }
    });
    
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    return null;
  }
}

export default async function JobPage({ params }: { params: { id: string } }) {
  const data = await getJob(params.id);
  
  if (!data?.job) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <JobDetails job={data.job} />
        </div>
        
        <div className="lg:col-span-1">
          <ApplySection job={data.job} />
        </div>
      </div>
    </div>
  );
}