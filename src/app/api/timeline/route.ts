import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import type { TimelineComment } from '@/types';

export async function GET(request: Request) {
  try {
    console.log('GET /api/timeline invoked');

    // 1) Fetch all dealers and their comments
    console.log('Fetching dealer documents...');
    const dealersSnapshot = await getDocs(collection(db, 'dealers'));
    console.log(`Fetched ${dealersSnapshot.size} dealers`);

    const dealerComments: TimelineComment[] = [];
    for (const docSnap of dealersSnapshot.docs) {
      const data = docSnap.data();
      if (!Array.isArray(data.comments)) {
        console.log(`Dealer ${docSnap.id} has no comments array`);
        continue;
      }
      console.log(`Processing ${data.comments.length} comments for dealer ${docSnap.id}`);
      for (const comment of data.comments) {
        try {
          const dateValue = comment.date instanceof Timestamp
            ? comment.date.toDate().toISOString()
            : typeof comment.date === 'string'
            ? new Date(comment.date).toISOString()
            : new Date().toISOString();

          dealerComments.push({
            id: `${docSnap.id}-${dateValue}`,
            userName: comment.userName || 'Unknown User',
            text: comment.text || '',
            date: dateValue,
            prospectionStatusAtEvent: comment.prospectionStatusAtEvent,
          });
        } catch (innerErr) {
          console.error(`Error parsing comment for dealer ${docSnap.id}:`, innerErr, comment);
        }
      }
    }

    // 2) Fetch all methanisation sites and their comments
    console.log('Fetching methanisation site documents...');
    const sitesSnapshot = await getDocs(collection(db, 'methanisationSites'));
    console.log(`Fetched ${sitesSnapshot.size} sites`);

    const siteComments: TimelineComment[] = [];
    for (const docSnap of sitesSnapshot.docs) {
      const data = docSnap.data();
      if (!Array.isArray(data.comments)) {
        console.log(`Site ${docSnap.id} has no comments array`);
        continue;
      }
      console.log(`Processing ${data.comments.length} comments for site ${docSnap.id}`);
      for (const comment of data.comments) {
        try {
          const dateValue = comment.date instanceof Timestamp
            ? comment.date.toDate().toISOString()
            : typeof comment.date === 'string'
            ? new Date(comment.date).toISOString()
            : new Date().toISOString();

          siteComments.push({
            id: `${docSnap.id}-${dateValue}`,
            userName: comment.userName || 'Unknown User',
            text: comment.text || '',
            date: dateValue,
            prospectionStatusAtEvent: comment.prospectionStatusAtEvent,
          });
        } catch (innerErr) {
          console.error(`Error parsing comment for site ${docSnap.id}:`, innerErr, comment);
        }
      }
    }

    // 3) Combine and sort all comments chronologically
    const allComments = [...dealerComments, ...siteComments];
    console.log(`Total comments collected: ${allComments.length}`);
    const sortedComments = allComments.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return NextResponse.json(sortedComments, { status: 200 });
  } catch (err) {
    console.error('Unexpected error in GET /api/timeline:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}