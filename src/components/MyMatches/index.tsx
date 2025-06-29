// src/components/MyMatches/index.tsx
import { FC, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { doc, collection, query, where, getDocs, updateDoc, writeBatch, getDoc } from 'firebase/firestore';
import { addDoc, Timestamp } from 'firebase/firestore'; // Add these imports
import { db } from '../../utils/firebase';
import './styles.css';
import AcceptMatchModal from './AcceptMatchModal';

interface MatchConnection {
   id?: string;
   senderId: string;
   receiverId: string;
   status: 'pending' | 'accepted' | 'declined' | 'past' | 'expired';
   expiresAt: string;
   matchScore: number;
   senderDetails: {
     displayName: string;
     pronouns: string;
     chessRating: number;
     isQueer: boolean;
   };
   receiverDetails: {
     displayName: string;
     pronouns: string;
     chessRating: number;
     isQueer: boolean;
   };
   matchingDetails: {
     area: string;
     date: string;
     timeWindow: {
       start: string;
       end: string;
     }
   };
   meetupDetails: {
     cafeAddress: string;
     meetingTime: string;
     meetingEndTime: string;
     chessSetProvider: 'self' | 'cafe' | 'opponent';
     comments?: string;
   };
   timestamps: {
     sent: string;
     responded?: string;
     completed?: string;
   }
}

interface MatchAcceptanceDetails {
  cafeAddress: string;
  meetingTime: string;
  chessSetProvider: 'self' | 'cafe' | 'opponent';
  contactInfo: string;
}

const MyMatches: FC = () => {
   const { currentUser } = useAuth();
   const [potentialMatchesSent, setPotentialMatchesSent] = useState<MatchConnection[]>([]);
   const [potentialMatchesReceived, setPotentialMatchesReceived] = useState<MatchConnection[]>([]);
   const [confirmedMatches, setConfirmedMatches] = useState<MatchConnection[]>([]);
   const [pastMatches, setPastMatches] = useState<MatchConnection[]>([]);
   const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
   const [selectedMatch, setSelectedMatch] = useState<MatchConnection | null>(null);

   // Helper function to check if a match date is in the past
   const isMatchPast = (matchDate: string): boolean => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const matchDateObj = new Date(matchDate);
      matchDateObj.setHours(0, 0, 0, 0);
      return matchDateObj < today;
   };

   // Add this new function after the state declarations
    const updateExpiredStatuses = async (matches: MatchConnection[]) => {
      const batch = writeBatch(db);
      const now = new Date();
      let hasUpdates = false;
      
      matches.forEach(match => {
        if (!match.id) return;
        
        const matchRef = doc(db, 'match_connections', match.id);
        
        // Expire pending invitations after 3 days
        if (match.status === 'pending' && match.expiresAt) {
          const expirationTime = new Date(match.expiresAt);
          if (now > expirationTime) {
            batch.update(matchRef, { status: 'expired' });
            hasUpdates = true;
          }
        }
        
        // Convert declined to declined_past after 24 hours
        if (match.status === 'declined' && match.timestamps?.responded) {
          const declineTime = new Date(match.timestamps.responded);
          const cooldownEnd = new Date(declineTime.getTime() + (24 * 60 * 60 * 1000));
          if (now > cooldownEnd) {
            batch.update(matchRef, { status: 'declined_past' });
            hasUpdates = true;
          }
        }
        
        // Convert accepted to past after match date
        if (match.status === 'accepted' && match.matchingDetails?.date) {
          const matchDate = new Date(match.matchingDetails.date);
          matchDate.setHours(23, 59, 59); // End of match day
          if (now > matchDate) {
            batch.update(matchRef, { status: 'past' });
            hasUpdates = true;
          }
        }
      });
      
      if (hasUpdates) {
        await batch.commit();
      }
    };

   // Helper function to update past matches in batch
   const updatePastMatches = async (matches: MatchConnection[], batchOp: ReturnType<typeof writeBatch>) => {
      matches.forEach(match => {
        if (match.id && match.status === 'accepted' && isMatchPast(match.matchingDetails.date)) {
          const matchRef = doc(db, 'match_connections', match.id);
          batchOp.update(matchRef, { status: 'past' });
        }
      });
   };

   // Fetch all matches for the current user
   const fetchMatches = useCallback(async () => {
      if (!currentUser) {
        console.log('No current user, returning from fetchMatches');
        return;
      }
      
      console.log('Fetching matches for user:', currentUser.uid);
      const matchesRef = collection(db, 'match_connections');
      
      try {
        // Log the queries we're about to make
        console.log('Querying sent matches for user:', currentUser.uid);
        const sentQuery = query(matchesRef, where('senderId', '==', currentUser.uid));
        console.log('Querying received matches for user:', currentUser.uid);
        const receivedQuery = query(matchesRef, where('receiverId', '==', currentUser.uid));

        const [sentSnap, receivedSnap] = await Promise.all([
          getDocs(sentQuery),
          getDocs(receivedQuery)
        ]);

        console.log('Received matches data:', 
          'Sent:', sentSnap.docs.length, 
          'Received:', receivedSnap.docs.length
        );

        // Update expired statuses BEFORE processing
        const allMatches = [...sentSnap.docs, ...receivedSnap.docs].map(doc => ({ id: doc.id, ...doc.data() } as MatchConnection));
        await updateExpiredStatuses(allMatches);

        const batch = writeBatch(db);

        const sent: MatchConnection[] = [];
        const received: MatchConnection[] = [];
        const confirmed: MatchConnection[] = [];
        const past: MatchConnection[] = [];

        // Process document snapshots and categorize matches
        const processDocs = (docs: any[]) => {
          docs.forEach(docSnapshot => {
            const match = { id: docSnapshot.id, ...docSnapshot.data() } as MatchConnection;
            
            // Check if match is expired
            if (match.status === 'pending' && match.expiresAt) {
              const expirationTime = new Date(match.expiresAt);
              if (new Date() > expirationTime) {
                // Update expired status in database
                const matchRef = doc(db, 'match_connections', match.id!);
                batch.update(matchRef, { status: 'expired' });
                return; // Skip expired matches
              }
            }
            
            if (match.status === 'pending') {
              if (match.senderId === currentUser.uid) {
                sent.push(match);
              } else {
                received.push(match);
              }
            } else if (match.status === 'accepted') {
              if (isMatchPast(match.matchingDetails.date)) {
                past.push({ ...match, status: 'past' });
              } else {
                confirmed.push(match);
              }
            }
          });
        };

        processDocs(sentSnap.docs);
        processDocs(receivedSnap.docs);

        [...confirmed, ...past].forEach(match => {
          if (match.id && match.status === 'accepted' && isMatchPast(match.matchingDetails.date)) {
            const matchRef = doc(db, 'match_connections', match.id);
            batch.update(matchRef, { status: 'past' });
          }
        });
        await batch.commit();

        setPotentialMatchesSent(sent);
        setPotentialMatchesReceived(received);
        setConfirmedMatches(confirmed);
        setPastMatches(past);

      } catch (error) {
        console.error('Error fetching matches:', error);
      }
   }, [currentUser]); // Only depend on currentUser

   // Use fetchMatches when component mounts or currentUser changes
   useEffect(() => {
    console.log('useEffect triggered, currentUser:', currentUser?.uid);
    if (!currentUser) return;
    
    // Create a reference to the current fetchMatches to avoid dependency issues
    let isMounted = true;
    const loadMatches = async () => {
      if (isMounted) {
        await fetchMatches();
      }
    };
    
    loadMatches();
    
    return () => {
      isMounted = false;
    };
  }, [fetchMatches]);

   

  const handleAcceptMatch = async (matchId: string) => {
  console.log('handleAcceptMatch called with:', { matchId });
  
  if (!matchId) {
    console.error('No matchId provided to handleAcceptMatch');
    return;
  }

  try {
    console.log('Getting match reference for ID:', matchId);
    const matchRef = doc(db, 'match_connections', matchId);
    
    // First get the match data before updating
    const matchDoc = await getDoc(matchRef);
    if (!matchDoc.exists()) {
      console.error('Match document not found');
      return;
    }
    
    const matchData = matchDoc.data();
    console.log('Match data:', matchData);
    
    const updateData = {
      status: 'accepted',
      'timestamps.responded': new Date().toISOString()
    };
    console.log('Updating match with data:', updateData);
    
    await updateDoc(matchRef, updateData);
    console.log('Match updated successfully');

    // ✅ CREATE CONFIRMATION NOTIFICATIONS
    console.log('Creating confirmation notifications...');
    try {
      // Notification for sender (match proposer)
      await addDoc(collection(db, 'notifications'), {
        userId: matchData.senderId,
        type: 'match_confirmed',
        title: '✅ Match Accepted!',
        message: `${matchData.receiverDetails.displayName} accepted your chess invitation`,
        data: {
          matchId: matchId,
          opponentName: matchData.receiverDetails.displayName,
          date: matchData.matchingDetails.date,
          location: matchData.meetupDetails.cafeAddress,
          time: `${matchData.meetupDetails.meetingTime} - ${matchData.meetupDetails.meetingEndTime}`
        },
        read: false,
        createdAt: Timestamp.now()
      });
      console.log('✅ Notification created for sender');

      // Notification for receiver (match accepter)
      await addDoc(collection(db, 'notifications'), {
        userId: matchData.receiverId,
        type: 'match_confirmed',
        title: '✅ Match Confirmed!',
        message: `Your chess match with ${matchData.senderDetails.displayName} is confirmed`,
        data: {
          matchId: matchId,
          opponentName: matchData.senderDetails.displayName,
          date: matchData.matchingDetails.date,
          location: matchData.meetupDetails.cafeAddress,
          time: `${matchData.meetupDetails.meetingTime} - ${matchData.meetupDetails.meetingEndTime}`
        },
        read: false,
        createdAt: Timestamp.now()
      });
      console.log('✅ Notification created for receiver');
    } catch (notificationError) {
      console.error('❌ Error creating confirmation notifications:', notificationError);
      // Continue anyway
    }
    
    setIsAcceptModalOpen(false);
    setSelectedMatch(null);
    
    console.log('Refreshing matches...');
    await fetchMatches();
  } catch (error) {
    console.error('Error in handleAcceptMatch:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
  }
};

  // const handleAcceptMatch = async (matchId: string, details: MatchAcceptanceDetails) => {
  //     console.log('handleAcceptMatch called with:', { matchId, details });
      
  //     if (!matchId) {
  //       console.error('No matchId provided to handleAcceptMatch');
  //       return;
  //     }

  //     try {
  //       console.log('Getting match reference for ID:', matchId);
  //       const matchRef = doc(db, 'match_connections', matchId);
        
  //       const updateData = {
  //         status: 'accepted',
  //         'timestamps.responded': new Date().toISOString(),
  //         'meetingDetails': details
  //       };
  //       console.log('Updating match with data:', updateData);
        
  //       await updateDoc(matchRef, updateData);
  //       console.log('Match updated successfully');
        
  //       setIsAcceptModalOpen(false);
  //       setSelectedMatch(null);
        
  //       console.log('Refreshing matches...');
  //       await fetchMatches();
  //     } catch (error) {
  //       console.error('Error in handleAcceptMatch:', error);
  //       // Add specific error handling
  //       if (error instanceof Error) {
  //         console.error('Error details:', error.message);
  //       }
  //     }
  //   };

  const handleDeclineMatch = async (matchId: string) => {
    console.log('handleDeclineMatch called with matchId:', matchId);
    
    if (!matchId) {
      console.error('No matchId provided to handleDeclineMatch');
      return;
    }

    try {
      console.log('Getting match reference for ID:', matchId);
      const matchRef = doc(db, 'match_connections', matchId);
      
      const updateData = {
        status: 'declined',
        'timestamps.responded': new Date().toISOString()
      };
      console.log('Updating match with data:', updateData);
      
      await updateDoc(matchRef, updateData);
      console.log('Match declined successfully');
      
      console.log('Refreshing matches...');
      await fetchMatches();
    } catch (error) {
      console.error('Error in handleDeclineMatch:', error);
      // Add specific error handling
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
    }
  };

   const renderMatchCard = (match: MatchConnection) => {
    console.log('Rendering match card for match:', match.id);
    // Add this helper function
    const getChessSetProviderShort = (provider: string): string => {
      switch(provider) {
        case 'self': return 'They will bring set';
        case 'cafe': return 'Café provides set';
        case 'opponent': return 'You bring set';
        default: return '';
      }
    };
    return(
     <div key={match.id} className="match-card">
       <div className="match-header">
         <div className="match-name">
           {currentUser?.uid === match.senderId 
             ? match.receiverDetails.displayName 
             : match.senderDetails.displayName}
         </div>
         <div className="match-rating">
           Rating: {currentUser?.uid === match.senderId 
             ? match.receiverDetails.chessRating 
             : match.senderDetails.chessRating}
         </div>
       </div>

       <div className="match-meta">
         <span className="meta-tag">
           {currentUser?.uid === match.senderId 
             ? match.receiverDetails.pronouns 
             : match.senderDetails.pronouns}
         </span>
         {(currentUser?.uid === match.senderId 
           ? match.receiverDetails.isQueer 
           : match.senderDetails.isQueer) && 
           <span className="meta-tag">🏳️‍🌈 Queer</span>}
       </div>

       <div className="match-details">
        <div>Date: {new Date(match.matchingDetails.date).toLocaleDateString()}</div>
        <div>
          Time: {match.matchingDetails.timeWindow.start} - {match.matchingDetails.timeWindow.end}
        </div>
        <div>Area: {match.matchingDetails.area}</div>
        {match.status === 'pending' && match.expiresAt && (
          <div className="expiration-warning">
            Expires: {new Date(match.expiresAt).toLocaleString()}
          </div>
        )}
      </div>

      {/* Add meetup details for accepted matches */}
      {match.status === 'accepted' && match.meetupDetails && (
        <div className="meetup-details">
          <div className="meetup-details-header">Meetup Details</div>
          <div>Location: {match.meetupDetails.cafeAddress}</div>
          <div>Time: {match.meetupDetails.meetingTime} - {match.meetupDetails.meetingEndTime}</div>
          <div>Chess Set: {getChessSetProviderShort(match.meetupDetails.chessSetProvider)}</div>
          {match.meetupDetails.comments && (
            <div className="meetup-comments">"{match.meetupDetails.comments}"</div>
          )}
        </div>
      )}
      

       {currentUser?.uid === match.receiverId && match.status === 'pending' && (
         <div className="match-actions">
           <button 
            onClick={() => {
                setSelectedMatch(match);
                setIsAcceptModalOpen(true);
              }
            } 
            className="accept-button"
           >
             Accept
           </button>
           <button 
            onClick={() => handleDeclineMatch(match.id!)} 
            className="decline-button"
           >
             Decline
           </button>
         </div>
       )}
     </div>
    );
   };

   return (
     <>
       {/* Accept Match Modal */}
       {selectedMatch && (
         <AcceptMatchModal
           isOpen={isAcceptModalOpen}
           onClose={() => {
             setIsAcceptModalOpen(false);
             setSelectedMatch(null);
           }}
           onAccept={() => handleAcceptMatch(selectedMatch.id!)}
           matchDetails={selectedMatch.matchingDetails}
           meetupDetails={selectedMatch.meetupDetails}
         />
       )}

       <div className="my-matches-container">
         <div className="matches-section">
           <h2>Potential Matches</h2>
           
           <div className="subsection">
             <h3>Invitations Received ({potentialMatchesReceived.length})</h3>
             <div className="matches-grid">
               {potentialMatchesReceived.map(match => renderMatchCard(match))}
             </div>
           </div>

           <div className="subsection">
             <h3>Invitations Sent ({potentialMatchesSent.length})</h3>
             <div className="matches-grid">
               {potentialMatchesSent.map(match => renderMatchCard(match))}
             </div>
           </div>
         </div>

         <div className="matches-section">
           <h2>Confirmed Matches ({confirmedMatches.length})</h2>
           <div className="matches-grid">
             {confirmedMatches.map(match => renderMatchCard(match))}
           </div>
         </div>

         <div className="matches-section">
           <h2>Past Matches ({pastMatches.length})</h2>
           <div className="matches-grid">
             {pastMatches.map(match => renderMatchCard(match))}
           </div>
         </div>
       </div>
     </>
   );
};

export default MyMatches;