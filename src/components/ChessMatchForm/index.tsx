// src/components/ChessMatchForm/index.tsx
import { FC, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { doc, setDoc, getDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { addDoc as addDocument, Timestamp } from 'firebase/firestore';
import { db } from '../../utils/firebase';
import './styles.css';
import ProposalMatchModal from './ProposalMatchModal';

//import { copenhagenCafes, Cafe } from '../../utils/cafeData';

interface Coordinates {
  lat: number;
  lng: number;
}

interface TimeWindow {
  startTime: string;
  endTime: string;
}

interface MatchScore {
  userId: string;
  userDocId: string;
  matchScore: number;
  ratingScore: number;
  queerScore: number;
  pronounScore: number;
  distanceScore: number;
  dateScore: number;
  timeScore: number;
  missingFields: string[];
  displayName: string;
  pronouns: string;
  isQueer: boolean;
  chessRating: number;
  availability: {
    dates: string[];
    startTime: string;
    endTime: string;
  };
  preferredAreas: string[];
  bestMatchingArea: string;
  bestMatchingDate: string;
  connectionStatus: string | null;
  connectionId?: string | null;
}

interface FormState {
  selectedAreas: string[];
  selectedDates: string[];
  startTime: string;
  endTime: string;
}

interface FormErrors {
  areas?: string;
  dates?: string;
  time?: string;
}

interface MatchScoreCalculation {
  totalScore: number;
  ratingScore: number;
  queerScore: number;
  pronounScore: number;
  distanceScore: number;
  dateScore: number;
  timeScore: number;
  bestArea: string;
  bestDate: string;
  missingFields: string[];
}

// Define interfaces for score calculation
interface UserProfile {
  queer?: boolean;
  pronoun?: string;
  preferredAreas: string[];
  availability: {
    dates: string[];
    startTime: string;
    endTime: string;
  };
  chessExperience?: {
    average_rating?: number;
    manual?: {
      level: string;
      rating: number;
    } | null;
    'chess.com'?: {
      username: string;
      rating: number | null;
    } | null;
    lichess?: {
      username: string;
      rating: number | null;
    } | null;
  };
}

interface PotentialMatch {
  userId: string,
  avgRating: number;
  queer?: boolean;
  pronoun?: string | null;
  preferredAreas: string[];
  availability: {
    dates: string[];
    startTime: string | null;
    endTime: string | null;
  };
}

// Add to your interfaces
interface MatchProposalDetails {
  cafeAddress: string;
  meetingTime: string;
  meetingEndTime: string;
  chessSetProvider: 'self' | 'cafe' | 'opponent';
  comments: string;
}

const ChessMatchForm: FC = () => {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [potentialMatches, setPotentialMatches] = useState<MatchScore[]>([]);
  //NEW 1JUN
  const [connectionStatuses, setConnectionStatuses] = useState<Record<string, {
    status: string;
    connectionId: string;
  }>>({});
  // ✅ ADD THESE TWO LINES:
  const [receiverIds, setReceiverIds] = useState<Record<string, string>>({});
  const [sentConnectionIds, setSentConnectionIds] = useState<Set<string>>(new Set());

  const [currentPreferences, setCurrentPreferences] = useState<FormState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add these state variables for the proposal modal
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [selectedMatchForProposal, setSelectedMatchForProposal] = useState<MatchScore | null>(null);
  // ADD THESE RIGHT AFTER THE useState DECLARATIONS:
  // useEffect(() => {
  //   console.log('🎯 isProposalModalOpen changed to:', isProposalModalOpen);
  // }, [isProposalModalOpen]);
  // useEffect(() => {
  //   console.log('🎯 selectedMatchForProposal changed to:', selectedMatchForProposal?.displayName);
  // }, [selectedMatchForProposal]);

  const [showUpdateForm, setShowUpdateForm] = useState(false); //to hide or show the update preferences section


  const [formState, setFormState] = useState<FormState>({
    selectedAreas: [],
    selectedDates: [],
    startTime: '',
    endTime: '',
  });

  // List of available areas
  const areas = [
    "1050 Copenhagen K",
    "2000 Frederiksberg",
    "2100 Østerbro",
    "2200 Nørrebro",
    "2300 Amagerbro",
    "2400 Nordvest",
    "2450 Sydhavnen",
    "2450 Vesterbro",
    "2500 Valby",
    "2700 Brønshøj",
    "2720 Vanløse",
    "2791 Dragør"
  ];

  // Fetch current preferences
  useEffect(() => {
    const fetchCurrentPreferences = async () => {
      if (!currentUser) {
        router.push('/');
        return;
      }

      try {
        const docRef = doc(db, 'matches', currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const preferences = {
            selectedAreas: data.areas || [],
            selectedDates: data.dates || [],
            startTime: data.startTime || '',
            endTime: data.endTime || '',
          };
          setCurrentPreferences(preferences);
          setFormState(preferences); // Pre-fill the form with current preferences
        }
      } catch (error) {
        console.error('Error fetching preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentPreferences();
  }, [currentUser, router]);

  // Add coordinates mapping
  const areaCoordinates: Record<string, Coordinates> = {
    "1050 Copenhagen K": { lat: 55.6786, lng: 12.5919 },
    "2000 Frederiksberg": { lat: 55.6786, lng: 12.5346 },
    "2100 Østerbro": { lat: 55.7076, lng: 12.5766 },
    "2200 Nørrebro": { lat: 55.6971, lng: 12.5429 },
    "2300 Amagerbro": { lat: 55.6615, lng: 12.6018 },
    "2400 Nordvest": { lat: 55.7107, lng: 12.5346 },
    "2450 Sydhavnen": { lat: 55.6497, lng: 12.5616 },
    "2450 Vesterbro": { lat: 55.6682, lng: 12.5463 },
    "2500 Valby": { lat: 55.6614, lng: 12.5147 },
    "2700 Brønshøj": { lat: 55.7089, lng: 12.4981 },
    "2720 Vanløse": { lat: 55.6875, lng: 12.4843 },
    "2791 Dragør": { lat: 55.5941, lng: 12.6741 }
  };

  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        })
      });
    }
    return dates;
  };

  const generateTimes = () => {
    const times = [];
    for (let hour = 9; hour <= 22; hour++) {
      times.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 22) {
        times.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    return times;
  };

  const handleAreaChange = (selectedOptions: HTMLSelectElement['selectedOptions']) => {
    const selectedValues = Array.from(selectedOptions).map(option => option.value);
    setFormState(prev => ({
      ...prev,
      selectedAreas: selectedValues
    }));
    setErrors(prev => ({ ...prev, areas: '' }));
  };

  const validateTimeRange = (start: string, end: string): boolean => {
    if (!start || !end) return true;
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);
    
    if (startHour > endHour) return false;
    if (startHour === endHour && startMinute >= endMinute) return false;
    return true;
  };

  const handleTimeChange = (type: 'start' | 'end', value: string) => {
    setFormState(prev => ({
      ...prev,
      [type === 'start' ? 'startTime' : 'endTime']: value
    }));

    const newStartTime = type === 'start' ? value : formState.startTime;
    const newEndTime = type === 'end' ? value : formState.endTime;

    if (!validateTimeRange(newStartTime, newEndTime)) {
      setErrors(prev => ({ ...prev, time: 'End time must be after start time' }));
    } else {
      setErrors(prev => ({ ...prev, time: '' }));
    }
  };
  
  // Helper function to calculate time overlap percentage
  const calculateTimeOverlap = (time1: TimeWindow, time2: TimeWindow): number => {
    const getMinutes = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const start1 = getMinutes(time1.startTime);
    const end1 = getMinutes(time1.endTime);
    const start2 = getMinutes(time2.startTime);
    const end2 = getMinutes(time2.endTime);

    const overlapStart = Math.max(start1, start2);
    const overlapEnd = Math.min(end1, end2);
    
    if (overlapEnd <= overlapStart) return 0;
    
    const overlapDuration = overlapEnd - overlapStart;
    const totalDuration = Math.min(end1 - start1, end2 - start2);
    
    return (overlapDuration / totalDuration) * 100;
  };

  const findBestMatchingDate = (userDates: string[], matchDates: string[]): {
    date: string;
    score: number;
  } => {
    // Convert all dates to Date objects for easier comparison
    const userDateObjects = userDates.map(d => new Date(d));
    const matchDateObjects = matchDates.map(d => new Date(d));
  
    // Helper function to get day priority (higher number = higher priority)
    const getDayPriority = (dayOfWeek: number): number => {
      // Sunday = 0, Monday = 1, ..., Saturday = 6
      const priorities = [7, 1, 2, 3, 4, 5, 6]; // Sunday has highest priority (7)
      return priorities[dayOfWeek];
    };
  
    // Helper function to find days difference between two dates
    const getDaysDifference = (date1: Date, date2: Date): number => {
      const diffTime = Math.abs(date2.getTime() - date1.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };
  
    // Step 1: Check for perfect matches
    const perfectMatches = matchDateObjects.filter(matchDate => 
      userDateObjects.some(userDate => 
        userDate.getFullYear() === matchDate.getFullYear() &&
        userDate.getMonth() === matchDate.getMonth() &&
        userDate.getDate() === matchDate.getDate()
      )
    );
  
    if (perfectMatches.length > 0) {
      // If multiple perfect matches, prefer weekend/later weekdays
      const bestPerfectMatch = perfectMatches.sort((a, b) => 
        getDayPriority(b.getDay()) - getDayPriority(a.getDay())
      )[0];
      
      return {
        date: bestPerfectMatch.toISOString().split('T')[0],
        score: 10
      };
    }
  
    // Step 2: Check for same day of week matches
    const weekdayMatches = matchDateObjects.filter(matchDate =>
      userDateObjects.some(userDate => userDate.getDay() === matchDate.getDay())
    );
  
    if (weekdayMatches.length > 0) {
      // If multiple weekday matches, prefer weekend/later weekdays
      const bestWeekdayMatch = weekdayMatches.sort((a, b) =>
        getDayPriority(b.getDay()) - getDayPriority(a.getDay())
      )[0];
  
      return {
        date: bestWeekdayMatch.toISOString().split('T')[0],
        score: 8
      };
    }
  
    // Step 3: Check for weekend dates
    const weekendMatches = matchDateObjects.filter(date => 
      date.getDay() === 0 || date.getDay() === 6  // Sunday or Saturday
    );
  
    if (weekendMatches.length > 0) {
      // Sort by priority (Sunday > Saturday)
      const bestWeekendMatch = weekendMatches.sort((a, b) =>
        getDayPriority(b.getDay()) - getDayPriority(a.getDay())
      )[0];
  
      return {
        date: bestWeekendMatch.toISOString().split('T')[0],
        score: 6
      };
    }
  
    // Step 4: Find the closest date
    let bestMatch = matchDateObjects[0];
    let smallestDiff = Infinity;
  
    for (const matchDate of matchDateObjects) {
      for (const userDate of userDateObjects) {
        const diff = getDaysDifference(matchDate, userDate);
        
        if (diff < smallestDiff || 
            (diff === smallestDiff && getDayPriority(matchDate.getDay()) > getDayPriority(bestMatch.getDay()))) {
          smallestDiff = diff;
          bestMatch = matchDate;
        }
      }
    }
  
    // Score based on days difference (max 5 points for closest dates)
    const score = Math.max(2, 5 - (smallestDiff * 0.5));
  
    return {
      date: bestMatch.toISOString().split('T')[0],
      score: score
    };
  };

  // Helper function to find the shortest distance between two sets of areas
  const findShortestDistance = (
    userAreas: string[],
    matchAreas: string[],
    areaCoordinates: Record<string, { lat: number; lng: number }>
  ): { area: string; distance: number } => {
    let shortestDistance = Infinity;
    let closestArea = matchAreas[0] || '';
    
    // For each combination of areas, find the shortest distance
    for (const userArea of userAreas) {
      for (const matchArea of matchAreas) {
        // If areas are the same, return immediately
        if (userArea === matchArea) {
          return { area: matchArea, distance: 0 };
        }
        
        // Calculate distance between coordinates
        const coord1 = areaCoordinates[userArea];
        const coord2 = areaCoordinates[matchArea];
        
        if (coord1 && coord2) {
          const R = 6371; // Earth's radius in kilometers
          const dLat = ((coord2.lat - coord1.lat) * Math.PI) / 180;
          const dLon = ((coord2.lng - coord1.lng) * Math.PI) / 180;
          
          const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((coord1.lat * Math.PI) / 180) * 
            Math.cos((coord2.lat * Math.PI) / 180) * 
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
          
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = R * c;
          
          if (distance < shortestDistance) {
            shortestDistance = distance;
            closestArea = matchArea;
          }
        }
      }
    }
    
    return { area: closestArea, distance: shortestDistance };
  };

  // ✅ FIXED: New 1JUN function to fetch connection statuses
  const fetchConnectionStatuses = async () => {
    if (!currentUser) return;
    
    try {
      const connectionsRef = collection(db, 'match_connections');
      
      // Get connections where current user is sender
      const sentQuery = query(
        connectionsRef,
        where('senderId', '==', currentUser.uid)
      );
      
      // Get connections where current user is receiver  
      const receivedQuery = query(
        connectionsRef,
        where('receiverId', '==', currentUser.uid)
      );
      
      const [sentSnap, receivedSnap] = await Promise.all([
        getDocs(sentQuery),
        getDocs(receivedQuery)
      ]);
      
      const statusMap: Record<string, { status: string; connectionId: string }> = {};
      
      // Process sent connections
      sentSnap.docs.forEach(doc => {
        const data = doc.data();
        const receiverEmail = data.receiverDetails?.displayName; // You might need to adjust this based on how you store the receiver identifier
        
        // Get receiver email from users collection if needed
        const receiverUserId = data.receiverId;
        statusMap[receiverUserId] = {
          status: data.status,
          connectionId: doc.id
        };
      });
      
      // Process received connections
      receivedSnap.docs.forEach(doc => {
        const data = doc.data();
        const senderUserId = data.senderId;
        statusMap[senderUserId] = {
          status: data.status,
          connectionId: doc.id
        };
      });
      
      setConnectionStatuses(statusMap);
    } catch (error) {
      console.error('Error fetching connection statuses:', error);
    }
  };

  // Modify the findPotentialMatches function to be less strict
  const findPotentialMatches = async () => {
    if (!currentUser) return;
   
    try {
      // First fetch connection statuses
      await fetchConnectionStatuses();

      const [userDoc, userMatchDoc] = await Promise.all([
        getDoc(doc(db, 'users', currentUser.uid)),
        getDoc(doc(db, 'matches', currentUser.uid))
      ]);
   
      if (!userDoc.exists() || !userMatchDoc.exists()) {
        console.error('User profile or match preferences not found');
        return;
      }
   
      const userProfile = userDoc.data();
      const userMatchPrefs = userMatchDoc.data();
   
      // Filter out past dates for current user
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const filteredDates = Array.isArray(userMatchPrefs.dates) 
        ? userMatchPrefs.dates.filter(date => new Date(date) >= today)
        : [];
   
      // Fetch potential matches
      const matchingUsers = await getDocs(
        query(collection(db, 'users'), 
        where('email', '!=', currentUser.email))
      );

      //NEW MATCHES IN PARALLEL
      const matchPromises = matchingUsers.docs.map(async (userDoc) => {
        const potentialMatchUser = userDoc.data();
        const potentialMatchUserId = userDoc.id;
        
        // ✅ FIXED: Check connection status for this user
        const connectionStatus = connectionStatuses[potentialMatchUserId];
        
        // ✅ FIXED: Filter based on connection status
        if (connectionStatus) {
          const { status } = connectionStatus;
          
          // Don't show users with these statuses
          if (status === 'accepted' || status === 'declined') {
            return null;
          }
        }
        const matchPrefsDoc = await getDoc(doc(db, 'matches', userDoc.id));
        
        if (!matchPrefsDoc.exists()) return null;
        
        const matchPrefs = matchPrefsDoc.data();
        const matchDates = Array.isArray(matchPrefs.dates) 
          ? matchPrefs.dates.filter(date => new Date(date) >= today)
          : [];
          
        if (matchDates.length === 0) return null;



   
      // Process matches in parallel
      // Fetch existing connections first
      // const connectionsRef = collection(db, 'match_connections');
      // const sentQuery = query(
      //   connectionsRef,
      //   where('senderId', '==', currentUser.uid)
      // );
      // const sentConnections = await getDocs(sentQuery);
      // const existingReceiverIds = new Map(
      //   sentConnections.docs.map(doc => [doc.data().receiverId, doc.data().status])
      // );

      // Process matches in parallel, excluding only pending/confirmed connections
      // const matchPromises = matchingUsers.docs
      //   .filter(userDoc => {
      //     const status = existingReceiverIds.get(userDoc.id);
          
      //     // Only hide 'declined' status
      //     return status !== 'declined';
      //   })
      //   .map(async (userDoc) => {
      //     const potentialMatchUser = userDoc.data();
      //     const matchPrefsDoc = await getDoc(doc(db, 'matches', userDoc.id));
        
      //   if (!matchPrefsDoc.exists()) return null;
        
      //   const matchPrefs = matchPrefsDoc.data();
      //   // Filter out past dates for potential match
      //   const matchDates = Array.isArray(matchPrefs.dates) 
      //     ? matchPrefs.dates.filter(date => new Date(date) >= today)
      //     : [];
      //   // Skip if no valid future dates
      //   if (matchDates.length === 0) return null;

        const mappedMatch = {
          userId: potentialMatchUser.email,
          displayName: potentialMatchUser.alias || 'Anonymous',
          queer: typeof potentialMatchUser.queer === 'boolean' ? 
                 potentialMatchUser.queer : 
                 potentialMatchUser.queer === 'Yes',
          avgRating: potentialMatchUser.chessExperience?.average_rating || null,
          pronoun: potentialMatchUser.pronoun || null,
          availability: {
            dates: matchPrefs.dates || [],
            startTime: matchPrefs.startTime || null,
            endTime: matchPrefs.endTime || null
          },
          preferredAreas: matchPrefs.areas || []
        };
        // // Add this debug code right after:
        // console.log('DEBUG - Mapped match object:', {
        //   userId: mappedMatch.userId,
        //   avgRating: mappedMatch.avgRating,
        //   rawRatingPath: `chessExperience.average_rating from user ${potentialMatchUser.email}`,
        //   rawRatingValue: potentialMatchUser.chessExperience?.average_rating,
        //   isAvgRatingDefined: mappedMatch.avgRating !== undefined && mappedMatch.avgRating !== null
        // });
   
        const scores = calculateSimpleMatchScore({
          ...userProfile,
          availability: {
            dates: filteredDates,
            startTime: userMatchPrefs.startTime,
            endTime: userMatchPrefs.endTime
          },
          preferredAreas: userMatchPrefs.areas
        } as UserProfile, mappedMatch as PotentialMatch);

        // Add this debug log right here
        console.log('Preparing final match object:', {
          mappedMatch,
          willUseDefault: (mappedMatch.avgRating === undefined || mappedMatch.avgRating === null) && mappedMatch.avgRating !== 0
        });
   
        return {
          userId: mappedMatch.userId,
          userDocId: potentialMatchUserId, // ✅ This should always be a string
          displayName: mappedMatch.displayName,
          pronouns: mappedMatch.pronoun || 'not specified',
          isQueer: mappedMatch.queer,
          chessRating: mappedMatch.avgRating ?? 800,
          availability: {
            dates: mappedMatch.availability.dates,
            startTime: mappedMatch.availability.startTime || '16:00',
            endTime: mappedMatch.availability.endTime || '21:00'
          },
          preferredAreas: mappedMatch.preferredAreas,
          matchScore: scores.totalScore,
          ratingScore: scores.ratingScore,
          queerScore: scores.queerScore,
          pronounScore: scores.pronounScore,
          distanceScore: scores.distanceScore,
          dateScore: scores.dateScore,
          timeScore: scores.timeScore,
          missingFields: scores.missingFields,
          bestMatchingArea: scores.bestArea,
          bestMatchingDate: scores.bestDate,
          connectionStatus: connectionStatus?.status ?? null,
          connectionId: connectionStatus?.connectionId ?? null
        };
        // Add this debug code right before the return statement:
        // console.log('DEBUG - Final match object:', {
        //   userId: mappedMatch.userId,
        //   originalAvgRating: mappedMatch.avgRating,
        //   finalChessRating: mappedMatch.avgRating || 800,
        //   isUsingDefault: mappedMatch.avgRating === undefined || mappedMatch.avgRating === null
        // });
      });
   
      // ✅ FIXED CODE:
      const allMatches = await Promise.all(matchPromises);

      // First filter out nulls
      const nonNullMatches = allMatches.filter((match): match is NonNullable<typeof match> => match !== null);

      // Then filter for valid matches and cast to MatchScore
      const validMatches: MatchScore[] = nonNullMatches
        .filter((match) => 
          match.matchScore > 0 &&
          !match.missingFields.some(field =>
            ['Available Dates', 'Preferred Areas', 'Time Preference'].includes(field)
          )
        )
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 10) as MatchScore[];

      setPotentialMatches(validMatches);
    } catch (error) {
      console.error('Error finding matches:', error);
    }
  };

  // Simplified match score calculation based on available fields
  const calculateSimpleMatchScore = (currentUser: UserProfile, potentialMatch: PotentialMatch): MatchScoreCalculation => {
    console.log('========= MATCH CALCULATION START =========');
    
    const missingFields: string[] = [];
    
    // Check for required fields first
    if (!potentialMatch.availability?.dates?.length) {
      missingFields.push('Available Dates');
      return {
        totalScore: 0,
        ratingScore: 0,
        queerScore: 0,
        pronounScore: 0,
        distanceScore: 0,
        dateScore: 0,
        timeScore: 0,
        bestArea: '',
        bestDate: '',
        missingFields
      };
    }

    if (!potentialMatch.preferredAreas?.length) {
      missingFields.push('Preferred Areas');
      return {
        totalScore: 0,
        ratingScore: 0,
        queerScore: 0,
        pronounScore: 0,
        distanceScore: 0,
        dateScore: 0,
        timeScore: 0,
        bestArea: '',
        bestDate: '',
        missingFields
      };
    }

    if (!potentialMatch.availability?.startTime || !potentialMatch.availability?.endTime) {
      missingFields.push('Time Preference');
      return {
        totalScore: 0,
        ratingScore: 0,
        queerScore: 0,
        pronounScore: 0,
        distanceScore: 0,
        dateScore: 0,
        timeScore: 0,
        bestArea: '',
        bestDate: '',
        missingFields
      };
    }
    // First, add detailed logging at the beginning of the function
    console.log('Raw match data for calculation:', {
      // Use email or other available identifier instead of userId
      currentUserData: currentUser,
      currentUserAvgRating: currentUser.chessExperience?.average_rating,
      potentialMatch: potentialMatch,
      potentialMatchAvgRating: potentialMatch.avgRating,
    });
    // Calculate rating score
    let ratingScore = 0;
    // Add this debug code right before checking the rating:

    if (potentialMatch.avgRating === null || potentialMatch.avgRating === undefined) {
      console.log(`Adding Chess Rating to missing fields`, { potentialMatch });
      missingFields.push('Chess Rating');
    } else if (currentUser.chessExperience?.average_rating !== undefined) {
      const userRating = currentUser.chessExperience.average_rating;
      const matchRating = potentialMatch.avgRating;
      console.log(`Calculating rating score:`, {
        userRating,
        matchRating,
        difference: Math.abs(userRating - matchRating)
      });
      const ratingDiff = Math.abs(userRating - matchRating);
      ratingScore = Math.max(0, 10 - (ratingDiff / 200));
      console.log(`Final rating score: ${ratingScore}`);
    }
    
    // Calculate queer score
    let queerScore = 0;
    if (potentialMatch.queer === null || potentialMatch.queer === undefined) {
      missingFields.push('Queer Status');
    } else if (currentUser.queer !== undefined) {
      queerScore = currentUser.queer === potentialMatch.queer ? 10 : 1;
    }
    
    // Calculate pronoun score
    let pronounScore = 0;
    if (!potentialMatch.pronoun) {
      missingFields.push('Pronouns');
    } else if (currentUser.pronoun) {
      if (currentUser.pronoun.toLowerCase() === potentialMatch.pronoun.toLowerCase()) {
        pronounScore = 10;
      }
      // Handle "Any pronouns" cases
      else if (potentialMatch.pronoun.toLowerCase() === 'any pronouns') {
        pronounScore = 8;
      }
      // Handle when current user has "Any pronouns"
      else if (currentUser.pronoun.toLowerCase() === 'any pronouns') {
        pronounScore = 6;
      }
      // Handle "Prefer not to share" cases for either user
      else if (potentialMatch.pronoun.toLowerCase() === 'prefer not to share' || 
                currentUser.pronoun.toLowerCase() === 'prefer not to share') {
        pronounScore = 0;
      }
      // No match but both have specified pronouns
      else {
        pronounScore = 0;
      }
    }
    
    // Find best matching area and calculate distance score
    const { area: bestArea, distance } = findShortestDistance(
      currentUser.preferredAreas,
      potentialMatch.preferredAreas,
      areaCoordinates
    );
    
    // Calculate distance score
    const distanceScore = calculateDistanceScore(distance);
    
    // Calculate date score and find best date
    const { date: bestDate, score: dateScore } = findBestMatchingDate(
      currentUser.availability.dates,
      potentialMatch.availability.dates
    );
    
    // Calculate time overlap score
    const timeScore = calculateTimeOverlapScore(
      {
        startTime: currentUser.availability.startTime,
        endTime: currentUser.availability.endTime
      },
      {
        startTime: potentialMatch.availability.startTime || '',
        endTime: potentialMatch.availability.endTime || ''
      }
    );
    
    // Calculate total score (average of all scores)
    const totalScore = (
      ratingScore +
      queerScore +
      pronounScore +
      distanceScore +
      dateScore +
      timeScore
    ) / 6;
    
    console.log('\nFINAL SCORES:', {
      totalScore: Math.round(totalScore * 100) / 100,
      ratingScore,
      queerScore,
      pronounScore,
      distanceScore,
      dateScore,
      timeScore,
      bestArea,
      bestDate,
      missingFields
    });
    
    return {
      totalScore: Math.round(totalScore * 100) / 100,
      ratingScore,
      queerScore,
      pronounScore,
      distanceScore,
      dateScore,
      timeScore,
      bestArea,
      bestDate,
      missingFields
    };
  };
  
  // Helper function for distance score calculation
  const calculateDistanceScore = (distance: number): number => {
    if (distance === 0) return 10;
    if (distance <= 2) return 9;
    if (distance <= 4) return 8;
    if (distance <= 6) return 7;
    if (distance <= 8) return 6;
    if (distance <= 10) return 5;
    if (distance <= 12) return 4;
    if (distance <= 14) return 3;
    if (distance <= 16) return 2;
    if (distance <= 20) return 1;
    return 0;
  };
  
  // Helper function for time overlap score calculation
  const calculateTimeOverlapScore = (
    userAvailability: { startTime: string; endTime: string },
    matchAvailability: { startTime: string; endTime: string }
  ): number => {
    const overlap = calculateTimeOverlap(
      userAvailability,
      matchAvailability
    );
    return overlap / 10;
  };

  // ✅ NEW 1JUN - FIXED: Helper function to get button config
  const getButtonConfig = (match: MatchScore) => {
    const status = match.connectionStatus;
    
    switch(status) {
      case 'pending':
        return { 
          text: 'Pending', 
          canClick: false, 
          className: 'pending-button' 
        };
      case 'accepted':
        return { 
          text: 'Connected', 
          canClick: false, 
          className: 'connected-button' 
        };
      case 'declined':
        return { 
          text: 'Declined', 
          canClick: false, 
          className: 'declined-button' 
        };
      case 'expired':
      case 'declined_past':
      case null:
      case undefined:
        return { 
          text: 'Connect', 
          canClick: true, 
          className: 'connect-button' 
        };
      default:
        return { 
          text: 'Connect', 
          canClick: true, 
          className: 'connect-button' 
        };
    }
  };

  // ✅ FIXED: Load connection statuses on component mount
  useEffect(() => {
    const fetchCurrentPreferences = async () => {
      if (!currentUser) {
        router.push('/');
        return;
      }

      try {
        // Fetch connection statuses first
        await fetchConnectionStatuses();
        
        const docRef = doc(db, 'matches', currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const preferences = {
            selectedAreas: data.areas || [],
            selectedDates: data.dates || [],
            startTime: data.startTime || '',
            endTime: data.endTime || '',
          };
          setCurrentPreferences(preferences);
          setFormState(preferences);
        }
      } catch (error) {
        console.error('Error fetching preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentPreferences();
  }, [currentUser, router]);


  const validateForm = () => {
    const newErrors: FormErrors = {};

    // Check if area is selected
    if (formState.selectedAreas.length === 0) {
      newErrors.areas = 'Please select at least one area';
    }

    // Check if date is selected
    if (formState.selectedDates.length === 0) {
      newErrors.dates = 'Please select at least one date';
    }

    // Check if start time is selected
    if (!formState.startTime) {
      newErrors.time = 'Please select a start time';
    }

    // Check if end time is selected
    else if (!formState.endTime) {
      newErrors.time = 'Please select an end time';
    }

    // Check if end time is after start time
    if (!validateTimeRange(formState.startTime, formState.endTime)) {
      newErrors.time = 'End time must be after start time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Update the handleSubmit function to use the new matching system
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !currentUser) return;
  
    setIsSubmitting(true);
    try {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      console.log('Current user data:', userDoc.data());
      const docRef = doc(db, 'matches', currentUser.uid);
      
      const areasWithCoordinates = formState.selectedAreas.map(area => ({
        name: area,
        coordinates: areaCoordinates[area]
      }));
  
      const matchData = {
        userId: currentUser.uid,
        areas: formState.selectedAreas,
        areaCoordinates: areasWithCoordinates,
        dates: formState.selectedDates,
        startTime: formState.startTime,
        endTime: formState.endTime,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
  
      await setDoc(docRef, matchData);
      
      // Update currentPreferences after successful save
      setCurrentPreferences({
        selectedAreas: formState.selectedAreas,
        selectedDates: formState.selectedDates,
        startTime: formState.startTime,
        endTime: formState.endTime,
      });
      
      await findPotentialMatches();
      setShowUpdateForm(false); // Close the form after saving
    } catch (error) {
      console.error('Error saving match data:', error);
      alert('Error saving match preferences');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add this to your existing state declarations
  //const [sentConnectionIds, setSentConnectionIds] = useState<Set<string>>(new Set());
  //const [connectionStatuses, setConnectionStatuses] = useState<Record<string, string>>({});
  
  // Add this useEffect to fetch existing connections
  useEffect(() => {
    const fetchExistingConnections = async () => {
      if (!currentUser) return;
      
      try {
        const connectionsRef = collection(db, 'match_connections');
        const sentQuery = query(
          connectionsRef,
          where('senderId', '==', currentUser.uid)
        );
        
        const querySnapshot = await getDocs(sentQuery);
        const existingIds = new Set(
          querySnapshot.docs.map(doc => doc.data().receiverId)
        );
        setSentConnectionIds(existingIds);
      } catch (error) {
        console.error('Error fetching existing connections:', error);
      }
    };

    fetchExistingConnections();
  }, [currentUser]);

  // const canSendConnection = (receiverId: string): boolean => {
  //   const status = connectionStatuses[receiverId];
  //   return !status || status === 'past' || status === 'declined';
  // };

  const handleConnect = async (match: MatchScore) => {
    // console.log('🔥 handleConnect called for:', match.displayName); //debug
    // console.log('🔥 Current modal state:', isProposalModalOpen); //debug
    // console.log('🔥 Selected match state:', selectedMatchForProposal); //debug
    // Open the proposal modal instead of immediately connecting
    
    // ✅ FIXED: Check if connection is allowed
    if (match.connectionStatus && 
        ['pending', 'accepted', 'declined'].includes(match.connectionStatus)) {
      console.log('Cannot connect to user with status:', match.connectionStatus);
      return;
    }
    setSelectedMatchForProposal(match);
    setIsProposalModalOpen(true);
    console.log('🔥 After setting state - should open modal now'); //debug
  };

  const handleSendProposal = async (match: MatchScore, details: MatchProposalDetails) => {
  if (!currentUser) return;
  
  try {
    const usersRef = collection(db, 'users');
    const receiverQuery = query(usersRef, where('email', '==', match.userId));
    const receiverDocs = await getDocs(receiverQuery);
    
    if (receiverDocs.empty) {
      console.error('Receiver user not found');
      alert('Error: Unable to find matching user');
      return;
    }
    
    const receiverDoc = receiverDocs.docs[0];
    const receiverId = receiverDoc.id;
    setReceiverIds(prev => ({...prev, [match.userId]: receiverId}));
    
    if (sentConnectionIds.has(receiverId)) {
      alert("Connection request already sent to this user!");
      return;
    }
    
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    const userData = userDoc.data();

    if (!userData) {
      console.error('User data not found');
      return;
    }

    // Calculate expiration time
    const matchDate = new Date(match.bestMatchingDate);
    const threeHoursBeforeMatch = new Date(matchDate);
    threeHoursBeforeMatch.setHours(threeHoursBeforeMatch.getHours() - 3);
    
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    const expirationTime = new Date(Math.min(
      threeHoursBeforeMatch.getTime(),
      threeDaysFromNow.getTime()
    )).toISOString();

    // Create the match connection
    console.log('Creating match connection...');
    const matchConnectionRef = await addDoc(collection(db, 'match_connections'), {
      senderId: currentUser.uid,
      receiverId: receiverId,
      status: 'pending',
      expiresAt: expirationTime,
      matchScore: match.matchScore,
      senderDetails: {
        displayName: userData.alias || 'Anonymous',
        pronouns: userData.pronoun || 'Not specified',
        chessRating: userData.chessExperience?.average_rating || 0,
        isQueer: userData.queer || false
      },
      receiverDetails: {
        displayName: match.displayName,
        pronouns: match.pronouns,
        chessRating: match.chessRating,
        isQueer: match.isQueer
      },
      matchingDetails: {
        area: match.bestMatchingArea,
        date: match.bestMatchingDate,
        timeWindow: {
          start: match.availability.startTime,
          end: match.availability.endTime
        }
      },
      meetupDetails: {
        cafeAddress: details.cafeAddress,
        meetingTime: details.meetingTime,
        meetingEndTime: details.meetingEndTime,
        chessSetProvider: details.chessSetProvider,
        comments: details.comments
      },
      timestamps: {
        sent: new Date().toISOString()
      }
    });
    console.log('Match connection created with ID:', matchConnectionRef.id);

    // ✅ CREATE NOTIFICATION FOR THE RECEIVER
    console.log('Creating notification for receiver:', receiverId);
    try {
      await addDoc(collection(db, 'notifications'), {
        userId: receiverId,
        type: 'match_invitation',
        title: '♟️ New Chess Match Invitation!',
        message: `${userData.alias || 'Someone'} wants to play chess with you`,
        data: {
          matchId: matchConnectionRef.id,
          senderName: userData.alias || 'Anonymous',
          date: match.bestMatchingDate,
          location: details.cafeAddress,
          time: `${details.meetingTime} - ${details.meetingEndTime}`
        },
        read: false,
        createdAt: Timestamp.now()
      });
      console.log('✅ Notification created successfully!');
    } catch (notificationError) {
      console.error('❌ Error creating notification:', notificationError);
      // Continue anyway - don't block the match creation
    }

    setSentConnectionIds(prev => {
      const newSet = new Set(prev);
      newSet.add(receiverId);
      return newSet;
    });
    setConnectionStatuses(prev => ({ 
      ...prev, 
      [receiverId]: { 
        status: 'pending', 
        connectionId: matchConnectionRef.id 
      } 
    }));
    alert('Connection request sent successfully!');
    
  } catch (error) {
    console.error('Error creating match connection:', error);
    alert('Error sending connection request');
  }
};

  return (
    <div className="chess-match-container">
      <div className="chess-match-content">
        {/* Current Preferences Section */}
        <div className="preferences-section">
          <h2 className="preferences-title">My Chess Preferences</h2>
          <p className="no-matches-helper">Set your preferences to discover compatible chess players around you!</p>
          {isLoading ? (
            <div className="loading-state">Loading your preferences...</div>
          ) : currentPreferences ? (
            <div className="current-preferences">
              <div className="preference-card">
                <div className="preference-group">
                  <h3>Preferred Areas</h3>
                  <div className="preference-tags">
                    {currentPreferences.selectedAreas.length > 0 ? (
                      currentPreferences.selectedAreas.map((area) => (
                        <span key={area} className="preference-tag">{area}</span>
                      ))
                    ) : (
                      <span className="no-preference">No areas selected</span>
                    )}
                  </div>
                </div>

                <div className="preference-group">
                  <h3>Available Dates</h3>
                  <div className="preference-tags">
                    {currentPreferences.selectedDates.length > 0 ? (
                      currentPreferences.selectedDates.map((date) => (
                        <span key={date} className="preference-tag">
                          {new Date(date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      ))
                    ) : (
                      <span className="no-preference">No dates selected</span>
                    )}
                  </div>
                </div>

                <div className="preference-group">
                  <h3>Time Preference</h3>
                  <div className="preference-tags">
                    {currentPreferences.startTime && currentPreferences.endTime ? (
                      <span className="preference-tag">
                        {currentPreferences.startTime} - {currentPreferences.endTime}
                      </span>
                    ) : (
                      <span className="no-preference">No time preference set</span>
                    )}
                  </div>
                </div>
                {/* Add button to show/hide update form */}
                <div className="preference-actions mt-4">
                  <button 
                    onClick={() => setShowUpdateForm(true)}
                    className="update-button"
                  >
                    Update Preferences
                  </button>
                  
                  {/* <button 
                    onClick={() => findPotentialMatches()}
                    className="submit-button"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Finding Matches...' : 'Find Matches'}
                  </button> */}

                  <button 
                    onClick={() => {
                      setIsSubmitting(true);
                      findPotentialMatches()
                        .then(() => {
                          console.log("Find Matches completed, potentialMatches:", potentialMatches.length);
                        })
                        .catch(error => {
                          console.error("Error in findPotentialMatches:", error);
                        })
                        .finally(() => {
                          setIsSubmitting(false);
                        });
                    }}
                    className="submit-button"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Finding Matches...' : 'Find Matches'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-preferences">
              <p>You haven't set any preferences yet.</p>
              <button 
                onClick={() => setShowUpdateForm(true)}
                className="submit-button mt-4"
              >
                Set Up Preferences
              </button>
            </div>
          )}
        </div>

        {/* Update Preferences Form Section*/}
        {showUpdateForm && (
          <div className="chess-match-form">
            <h2 className="form-title">
              {currentPreferences ? "Update Preferences" : "Set Your Preferences"}
            </h2>
            
            <form onSubmit={handleSubmit}>
              
                {/* Areas Selection */}
                <div className="form-section">
                  <div className="section-title">Preferred Areas</div>
                  <p className="field-helper">Choose areas where you'd like to meet for a chess game (hold Ctrl/Cmd for multiple selection)</p>

                  <select
                    multiple
                    className="area-select"
                    value={formState.selectedAreas}
                    onChange={(e) => handleAreaChange(e.target.selectedOptions)}
                  >
                    {areas.map(area => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                  {errors.areas && <div className="error-message">{errors.areas}</div>}
                </div>

                {/* Date Selection */}
                <div className="form-section">
                  <div className="section-title">Available Dates</div>
                  <p className="field-helper">Pick the days you're free to play chess (hold Ctrl/Cmd for multiple days)</p>
                  <select
                    multiple
                    className="date-select"
                    value={formState.selectedDates}
                    onChange={(e) => {
                      const selectedDates = Array.from(e.target.selectedOptions, option => option.value);
                      setFormState(prev => ({
                        ...prev,
                        selectedDates
                      }));
                      setErrors(prev => ({ ...prev, dates: '' }));
                    }}
                  >
                    {generateDates().map(date => (
                      <option key={date.value} value={date.value}>
                        {date.label}
                      </option>
                    ))}
                  </select>
                  {errors.dates && <div className="error-message">{errors.dates}</div>}
                </div>
              
              {/* Time Selection */}
              <div className="form-section">
                <div className="section-title">Time Preference</div>
                <p className="field-helper">What time window usually works best for you?</p>
                <div className="time-selection">
                  <div className="time-input">
                    <label>Start Time</label>
                    <select
                      value={formState.startTime}
                      onChange={(e) => handleTimeChange('start', e.target.value)}
                    >
                      <option value="">Select start time</option>
                      {generateTimes().map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                  <div className="time-input">
                    <label>End Time</label>
                    <select
                      value={formState.endTime}
                      onChange={(e) => handleTimeChange('end', e.target.value)}
                    >
                      <option value="">Select end time</option>
                      {generateTimes().map(time => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>
                {errors.time && <div className="error-message">{errors.time}</div>}
              </div>

              {/* new button CHANGED */}
              {/* <button 
                type="submit" 
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Finding Matches...' : 'Find Matches'}
              </button> */}

              <div className="button-group">
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Preferences'}
                </button>
                
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => setShowUpdateForm(false)}
                >
                  Cancel
                </button>
              </div>

              {/* <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => setShowUpdateForm(false)}
                >
                  Cancel
              </button> */}

            </form>
          </div>
        )}
        {/* hereeeee*/}


        {/* Potential Matches Section */}
        <div className="potential-matches">
          <h2>Potential Matches</h2>
          {potentialMatches.length > 0 ? (
            potentialMatches.map((match) => {
              const buttonConfig = getButtonConfig(match);

              return (
                <div key={match.userId} className="match-card">
                  <div className="match-header">
                    <div className="match-name">{match.displayName}</div>
                    <div className="match-rating">
                      Rating: {match.chessRating}
                    </div>
                  </div>

                  <div className="match-meta">
                    <span className="meta-tag">{match.pronouns}</span>
                    {match.isQueer && <span className="meta-tag">🏳️‍🌈 Queer</span>}
                  </div>
                  
                  {/* <div className="match-scores"> */}
                    {/* <div className="compatibility-score">
                      Compatibility: {Math.round(match.matchScore * 10)}%
                    </div> */}

                    {/* <div className="score-item">
                      <span className="score-label">Total Score:</span>
                      <span className="score-value">{Math.round(match.matchScore)}</span>
                    </div>
                    <div className="score-item">
                      <span className="score-label">Rating Difference:</span>
                      <span className="score-value">{Math.round(match.ratingScore)}</span>
                    </div>
                    <div className="score-item">
                      <span className="score-label">Queer Match:</span>
                      <span className="score-value">{Math.round(match.queerScore)}</span>
                    </div>
                    <div className="score-item">
                      <span className="score-label">Pronouns Match:</span>
                      <span className="score-value">{Math.round(match.pronounScore)}</span>
                    </div>
                    <div className="score-item">
                      <span className="score-label">Distance Score:</span>
                      <span className="score-value">{Math.round(match.distanceScore)}</span>
                    </div>
                    <div className="score-item">
                      <span className="score-label">Date Score:</span>
                      <span className="score-value">{Math.round(match.dateScore)}</span>
                    </div>
                    <div className="score-item">
                      <span className="score-label">Time Score:</span>
                      <span className="score-value">{Math.round(match.timeScore)}</span>
                    </div> */}
                  {/* </div> */}

                  <div className="match-details">
                    <div>Potential Date: {new Date(match.bestMatchingDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}</div>
                    <div>Time: {match.availability.startTime} - {match.availability.endTime}</div>
                    <div>Area: {match.bestMatchingArea}</div>
                  </div>

                  <div className="match-action">
                    <button 
                      className={buttonConfig.className}
                      onClick={() => buttonConfig.canClick ? handleConnect(match) : null}
                      disabled={!buttonConfig.canClick}
                    >
                      {buttonConfig.text}
                    </button>
                  </div>
                  
                  {match.missingFields.length > 0 && (
                    <div className="missing-fields-warning">
                      <p>Missing information:</p>
                      <ul>
                        {match.missingFields.map((field, index) => (
                          <li key={index}>{field}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="no-matches">
              <p>No potential matches found yet</p>
              <p className="no-matches-helper">Try adjusting your preferences and click "Find Matches", or check back later for new players!</p>
            </div>
          )}
        </div>
      </div>

      {(() => {
        console.log('🚀 Rendering modal section:', { isProposalModalOpen, selectedMatchForProposal: selectedMatchForProposal?.displayName });
        return null;
      })()}

      {isProposalModalOpen && selectedMatchForProposal && (
        <ProposalMatchModal
          isOpen={isProposalModalOpen}
          onClose={() => {
            console.log('🚀 Modal onClose called');
            setIsProposalModalOpen(false);
            setSelectedMatchForProposal(null);
          }}

          onSend={(details) => handleSendProposal(selectedMatchForProposal, details)}
          matchDetails={{
            date: selectedMatchForProposal.bestMatchingDate,
            timeWindow: {
              start: selectedMatchForProposal.availability.startTime,
              end: selectedMatchForProposal.availability.endTime
            },
            area: selectedMatchForProposal.bestMatchingArea
          }}
        />
      )}


    </div>
  );
};

export default ChessMatchForm;
