import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const minBudget = searchParams.get('minBudget');
    const maxBudget = searchParams.get('maxBudget');
    const skills = searchParams.get('skills');

    let query = supabase
      .from('jobs')
      .select(`
        *,
        employer:users!jobs_employer_id_fkey(name, wallet_address),
        applications(count)
      `)
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false });

    // Apply filters
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (minBudget) {
      query = query.gte('budget', parseFloat(minBudget));
    }

    if (maxBudget) {
      query = query.lte('budget', parseFloat(maxBudget));
    }

    if (skills) {
      const skillsArray = skills.split(',').map(skill => skill.trim());
      query = query.contains('skills', skillsArray);
    }

    const { data: jobs, error } = await query;

    if (error) {
      throw error;
    }

    const formattedJobs = (jobs || []).map(job => ({
      ...job,
      applications_count: job.applications?.[0]?.count || 0
    }));

    return NextResponse.json({ jobs: formattedJobs });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, description, budget, deadline, employerWallet, skills } = await request.json();

    // Validate required fields
    if (!title || !description || !budget || !deadline || !employerWallet) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get or create user
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', employerWallet)
      .single();

    let employerId;

    if (userError || !userData) {
      // Create new user
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          wallet_address: employerWallet,
          name: `Employer-${employerWallet.slice(0, 8)}`,
        })
        .select('id')
        .single();

      if (createError) {
        throw createError;
      }
      employerId = newUser.id;
    } else {
      employerId = userData.id;
    }

    // Create job
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .insert({
        title,
        description,
        budget: parseFloat(budget),
        deadline: new Date(deadline).toISOString(),
        skills: skills ? skills.split(',').map((s: string) => s.trim()) : [],
        employer_id: employerId,
      })
      .select(`
        *,
        employer:users!jobs_employer_id_fkey(name, wallet_address)
      `)
      .single();

    if (jobError) {
      throw jobError;
    }

    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    );
  }
}