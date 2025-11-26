/**
 * Fully rewritten, clean & RLS-safe Supabase seeding script.
 * - Uses service_role key → bypasses all RLS
 * - Deletes tables in correct foreign-key order
 * - Inserts users → jobs → applications → escrows
 * - Beautiful logging + error handling
 */

import {supabase} from '@/app/lib/supabase';



// const supabase = createClient(
//   supabaseUrl,
//   roles, // 🟢 bypass RLS
//   { auth: { persistSession: false } }
// );

async function clearTable(table: string) {
  console.log(`🗑️ Clearing ${table}...`);

  // Safe universal delete for UUID tables
  const { error } = await supabase
    .from(table)
    .delete()
    .gt('id', '00000000-0000-0000-0000-000000000000');

  if (error) throw new Error(`Failed clearing ${table}: ${error.message}`);
  
  console.log(`✔️ Cleared ${table}`);
}


async function seed() {
  try {
    console.log('🌱 Seeding Supabase...');

    // ----------------------------------------
    // 1. DELETE ALL DATA IN CORRECT ORDER
    // ----------------------------------------
    await clearTable('applications');
    await clearTable('escrows');
    await clearTable('jobs');
    await clearTable('users');

    console.log('✅ All tables cleared\n');

    // ----------------------------------------
    // 2. INSERT USERS
    // ----------------------------------------
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

    const { data: users, error: userInsertError } = await supabase
      .from('users')
      .insert(userData)
      .select();

    if (userInsertError) throw userInsertError;
    console.log(`✔️ ${users.length} users created\n`);

    const [employer1, employer2, freelancer1, freelancer2] = users;

    // ----------------------------------------
    // 3. INSERT JOBS
    // ----------------------------------------
    console.log('💼 Creating jobs...');

    const jobData = [
      {
        title: 'Senior Solidity Developer',
        description: 'We are looking for an experienced Solidity developer to help build our new DeFi protocol.',
        budget: 5000,
        deadline: new Date(Date.now() + 30 * 86400000).toISOString(),
        skills: ['Solidity', 'DeFi', 'Smart Contracts', 'Hardhat', 'Security'],
        employer_id: employer1.id,
        status: 'ACTIVE'
      },
      {
        title: 'Full-Stack Web3 Developer',
        description: 'Join our team to build the next generation of Web3 applications.',
        budget: 3500,
        deadline: new Date(Date.now() + 14 * 86400000).toISOString(),
        skills: ['React', 'TypeScript', 'Next.js', 'Ethers.js', 'Node.js'],
        employer_id: employer2.id,
        status: 'ACTIVE'
      },
      {
        title: 'Smart Contract Auditor',
        description: 'Security-focused role for auditing smart contracts and ensuring code quality.',
        budget: 7500,
        deadline: new Date(Date.now() + 45 * 86400000).toISOString(),
        skills: ['Security', 'Auditing', 'Solidity', 'Testing'],
        employer_id: employer1.id,
        status: 'ACTIVE'
      }
    ];

    const { data: jobs, error: jobInsertError } = await supabase
      .from('jobs')
      .insert(jobData)
      .select();

    if (jobInsertError) throw jobInsertError;
    console.log(`✔️ ${jobs.length} jobs created\n`);

    const [job1, job2, job3] = jobs;

    // ----------------------------------------
    // 4. INSERT APPLICATIONS
    // ----------------------------------------
    console.log('📝 Creating applications...');

    const applicationData = [
      {
        job_id: job1.id,
        freelancer_id: freelancer1.id,
        cover_letter:
          'I have 4 years of experience in Solidity development and have worked on multiple DeFi protocols.',
        status: 'INTERVIEWING'
      },
      {
        job_id: job2.id,
        freelancer_id: freelancer2.id,
        cover_letter:
          'As a full-stack developer with React and blockchain experience, I believe I would be a great fit.',
        status: 'PENDING'
      },
      {
        job_id: job3.id,
        freelancer_id: freelancer1.id,
        cover_letter:
          'With my background in security and smart contract development, I can help ensure your contracts are secure.',
        status: 'ACCEPTED'
      }
    ];

    const { data: applications, error: appInsertError } = await supabase
      .from('applications')
      .insert(applicationData)
      .select();

    if (appInsertError) throw appInsertError;
    console.log(`✔️ ${applications.length} applications created\n`);

    // ----------------------------------------
    // 5. INSERT ESCROW
    // ----------------------------------------
    console.log('💰 Creating escrow...');

    const { error: escrowError } = await supabase
      .from('escrows')
      .insert({
        escrow_id: 1,
        job_id: job3.id,
        employer_id: employer1.id,
        freelancer_id: freelancer1.id,
        amount: 7500,
        status: 'FUNDED'
      });

    if (escrowError) throw escrowError;

    console.log('✔️ Escrow created\n');

    // ----------------------------------------
    // FINISHED
    // ----------------------------------------
    console.log('🎉 Seeding complete!');
    console.log('📊 Summary:');
    console.log(`   - ${users.length} users`);
    console.log(`   - ${jobs.length} jobs`);
    console.log(`   - ${applications.length} applications`);
    console.log(`   - 1 escrow`);
    process.exit(0);

  } catch (err: any) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
}

seed();
