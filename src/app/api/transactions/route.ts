import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { auth } from '@/lib/auth';

// GET /api/transactions
export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isUserAdmin = session.user.role === 'admin';

    let query = supabaseAdmin.from('Transaction').select('*, User(name, email)');

    if (!isUserAdmin) {
      query = query.eq('userId', session.user.id);
    }

    const { data: transactions, error } = await query.order('date', { ascending: false });

    if (error) {
      console.error('Error fetching transactions from Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Format output to match Prisma nested relation 'user'
    const formatted = (transactions || []).map((t: any) => {
      const { User, ...rest } = t;
      return {
        ...rest,
        user: User,
      };
    });

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
