import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/app/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { jobId, freelancerWallet, coverLetter } = await request.json();

    // Check if application already exists
    const { data: existingApp, error: checkError } = await supabase
      .from("applications")
      .select("id")
      .eq("job_id", jobId)
      .eq(
        "freelancer:users!applications_freelancer_id_fkey(wallet_address)",
        freelancerWallet
      )
      .single();

    if (existingApp) {
      return NextResponse.json(
        { error: "You have already applied for this job" },
        { status: 400 }
      );
    }

    // Get or create freelancer
    const { data: freelancerData, error: freelancerError } = await supabase
      .from("users")
      .select("id")
      .eq("wallet_address", freelancerWallet)
      .single();

    let freelancerId;

    if (freelancerError || !freelancerData) {
      const { data: newFreelancer, error: createError } = await supabase
        .from("users")
        .insert({
          wallet_address: freelancerWallet,
          name: `Freelancer-${freelancerWallet.slice(0, 8)}`,
        })
        .select("id")
        .single();

      if (createError) {
        throw createError;
      }
      freelancerId = newFreelancer.id;
    } else {
      freelancerId = freelancerData.id;
    }

    // Create application
    const { data: application, error: applicationError } = await supabase
      .from("applications")
      .insert({
        job_id: jobId,
        freelancer_id: freelancerId,
        cover_letter: coverLetter,
      })
      .select(
        `
        *,
        job:jobs(title),
        freelancer:users!applications_freelancer_id_fkey(name, wallet_address)
      `
      )
      .single();

    if (applicationError) {
      throw applicationError;
    }

    return NextResponse.json({ application }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating application:", error);

    // Unique constraint violation (already applied)
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "You have already applied to this job." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const freelancerWallet = searchParams.get("freelancerWallet");

    if (!freelancerWallet) {
      return NextResponse.json(
        { error: "Freelancer wallet address is required" },
        { status: 400 }
      );
    }

    const { data: freelancer, error: freelancerError } = await supabase
      .from("users")
      .select("id")
      .eq("wallet_address", freelancerWallet)
      .single();

    if (freelancerError || !freelancer) {
      return NextResponse.json(
        { error: "Freelancer not found" },
        { status: 404 }
      );
    }

    const freelancerId = freelancer.id;

    const { data: applications, error } = await supabase
      .from("applications")
      .select(`
        *,
        job:jobs(
          *,
          employer:users!jobs_employer_id_fkey(name, wallet_address)
        ),
        freelancer:users!applications_freelancer_id_fkey(name, wallet_address)
      `)
      .eq("freelancer_id", freelancerId)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ applications: applications || [] });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

