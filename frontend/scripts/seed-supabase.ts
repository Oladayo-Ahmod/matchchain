import { supabase } from '@/app/lib/supabase';

async function seedSupabase() {
  console.log('🌱 Seeding Supabase database...');

  try {
    // Clear existing data in correct order (respecting foreign keys)
    console.log('🗑️ Clearing existing data...');
    
    const { error: appsError } = await supabase.from('applications').delete().neq('id', '');
    if (appsError) console.error('Error clearing applications:', appsError);
    
    const { error: escrowsError } = await supabase.from('escrows').delete().neq('id', '');
    if (escrowsError) console.error('Error clearing escrows:', escrowsError);
    
    const { error: jobsError } = await supabase.from('jobs').delete().neq('id', '');
    if (jobsError) console.error('Error clearing jobs:', jobsError);
    
    const { error: usersError } = await supabase.from('users').delete().neq('id', '');
    if (usersError) console.error('Error clearing users:', usersError);

    console.log('✅ Data cleared successfully');

    // Create sample users
    console.log('👥 Creating users...');
    
    const userData = [
      {
        wallet_address: '0xEmployer1111111111111111111111111111111111',
        name: 'Web3 Startup Inc.',
        email: 'contact@web3startup.com',
        bio: 'Building the future of decentralized applications',
        skills: ['Management', 'Business Development'],
      },
      {
        wallet_address: '0xEmployer2222222222222222222222222222222222',
        name: 'DeFi Protocols Ltd.',
        email: 'hr@defiprotocols.com',
        bio: 'Leading DeFi protocol development company',
        skills: ['Finance', 'Blockchain'],
      },
      {
        wallet_address: '0xFreelancer111111111111111111111111111111111',
        name: 'Alice Developer',
        email: 'alice@developer.com',
        bio: 'Full-stack Web3 developer with 5 years of experience',
        skills: ['Solidity', 'React', 'TypeScript', 'Node.js', 'Web3'],
      },
      {
        wallet_address: '0xFreelancer222222222222222222222222222222222',
        name: 'Bob Blockchain',
        email: 'bob@blockchain.dev',
        bio: 'Blockchain engineer specializing in smart contracts',
        skills: ['Solidity', 'Rust', 'Go', 'Smart Contracts', 'Security'],
      }
    ];

    const users = [];
    for (const user of userData) {
      console.log(`Creating user: ${user.name}`);
      const { data, error } = await supabase
        .from('users')
        .insert(user)
        .select()
        .single();

      if (error) {
        console.error(`❌ Error creating user ${user.name}:`, error);
        throw error;
      }
      
      console.log(`✅ Created user: ${data.name} (ID: ${data.id})`);
      users.push(data);
    }

    const [employer1, employer2, freelancer1, freelancer2] = users;

    console.log('💼 Creating jobs...');

    // Create sample jobs
    const jobData = [
      {
        title: 'Senior Solidity Developer',
        description: 'We are looking for an experienced Solidity developer to help build our new DeFi protocol.',
        budget: 5000,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        skills: ['Solidity', 'DeFi', 'Smart Contracts', 'Hardhat', 'Security'],
        employer_id: employer1.id,
        status: 'ACTIVE'
      },
      {
        title: 'Full-Stack Web3 Developer',
        description: 'Join our team to build the next generation of Web3 applications.',
        budget: 3500,
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        skills: ['React', 'TypeScript', 'Next.js', 'Ethers.js', 'Node.js'],
        employer_id: employer2.id,
        status: 'ACTIVE'
      },
      {
        title: 'Smart Contract Auditor',
        description: 'Security-focused role for auditing smart contracts and ensuring code quality.',
        budget: 7500,
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        skills: ['Security', 'Auditing', 'Solidity', 'Testing'],
        employer_id: employer1.id,
        status: 'ACTIVE'
      }
    ];

    const jobs = [];
    for (const job of jobData) {
      console.log(`Creating job: ${job.title}`);
      const { data, error } = await supabase
        .from('jobs')
        .insert(job)
        .select()
        .single();

      if (error) {
        console.error(`❌ Error creating job ${job.title}:`, error);
        throw error;
      }
      
      console.log(`✅ Created job: ${data.title} (ID: ${data.id})`);
      jobs.push(data);
    }

    const [job1, job2, job3] = jobs;

    console.log('📝 Creating applications...');

    // Create sample applications
    const applicationData = [
      {
        job_id: job1.id,
        freelancer_id: freelancer1.id,
        cover_letter: 'I have 4 years of experience in Solidity development and have worked on multiple DeFi protocols.',
        status: 'INTERVIEWING'
      },
      {
        job_id: job2.id,
        freelancer_id: freelancer2.id,
        cover_letter: 'As a full-stack developer with React and blockchain experience, I believe I would be a great fit.',
        status: 'PENDING'
      },
      {
        job_id: job3.id,
        freelancer_id: freelancer1.id,
        cover_letter: 'With my background in security and smart contract development, I can help ensure your contracts are secure.',
        status: 'ACCEPTED'
      }
    ];

    for (const app of applicationData) {
      console.log(`Creating application for job ${app.job_id}`);
      const { data, error } = await supabase
        .from('applications')
        .insert(app)
        .select()
        .single();

      if (error) {
        console.error(`❌ Error creating application:`, error);
        throw error;
      }
      
      console.log(`✅ Created application: ${data.id}`);
    }

    console.log('💰 Creating escrow...');
    
    // Create sample escrow
    const { data: escrow, error: escrowError } = await supabase
      .from('escrows')
      .insert({
        escrow_id: 1,
        job_id: job3.id,
        employer_id: employer1.id,
        freelancer_id: freelancer1.id,
        amount: 7500,
        status: 'FUNDED'
      })
      .select()
      .single();

    if (escrowError) {
      console.error('❌ Error creating escrow:', escrowError);
    } else {
      console.log(`✅ Created escrow: ${escrow.id}`);
    }

    console.log('🎉 Supabase seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - ${users.length} users created`);
    console.log(`   - ${jobs.length} jobs created`);
    console.log(`   - ${applicationData.length} applications created`);
    console.log(`   - 1 escrow created`);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}


seedSupabase().catch(console.error);