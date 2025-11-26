import { notFound } from 'next/navigation';
import { JobDetails } from '../components/JobDetails';
import { ApplySection } from '../components/ApplySection';

import { supabase } from "@/app/lib/supabase";

async function getJob(id: string) {
  const { data, error } = await supabase
    .from("jobs")
    .select("*, users(*)")
    .eq("id", id)
    .single();

  if (error) return null;

  return { job: data };
}


export default async function JobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;  // ⬅️ FIX
  const data = await getJob(id);

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
