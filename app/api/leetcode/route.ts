import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const query = `
      query userProblemsSolved($username: String!) {
        matchedUser(username: $username) {
          submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
              submissions
            }
          }
        }
      }
    `;

    const response = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: { username },
      }),
    });

    const data = await response.json();

    if (data.errors) {
      return NextResponse.json({ error: data.errors[0].message }, { status: 400 });
    }

    if (!data.data.matchedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = data.data.matchedUser;
    const stats = userData.submitStatsGlobal.acSubmissionNum;
    const recentSolved: string[] = [];

    const processedData = {
      totalSolved: stats.find((s: unknown) => (s as any).difficulty === 'All')?.count || 0,
      easySolved: stats.find((s: unknown) => (s as any).difficulty === 'Easy')?.count || 0,
      mediumSolved: stats.find((s: unknown) => (s as any).difficulty === 'Medium')?.count || 0,
      hardSolved: stats.find((s: unknown) => (s as any).difficulty === 'Hard')?.count || 0,
      recentSolved,
    };

    return NextResponse.json(processedData);
  } catch (error) {
    console.error('LeetCode API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch LeetCode data' },
      { status: 500 }
    );
  }
} 