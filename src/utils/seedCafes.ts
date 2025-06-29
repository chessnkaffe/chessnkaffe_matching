// src/utils/seedCafes.ts
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from './firebase';

// Import your cafe data - remove the Cafe import since you're not using it
import { copenhagenCafes } from './cafeData';

const seedCafesDatabase = async (): Promise<void> => {
  try {
    // First check if cafes already exist
    const cafesRef = collection(db, 'cafes');
    const existingCafes = await getDocs(cafesRef);
    
    if (!existingCafes.empty) {
      console.log('Cafes already seeded in database');
      return;
    }
    
    // Add each cafe to the database
    for(const cafe of copenhagenCafes) {
      await addDoc(collection(db, 'cafes'), {
        ...cafe,
        ratings: { overall: 4.5, chessAtmosphere: 4.0 }, // Default ratings
        photos: [],
        createdAt: new Date().toISOString()
      });
    }
    
    console.log('Successfully seeded cafes database');
  } catch (error) {
    console.error('Error seeding cafes database:', error);
  }
};

export default seedCafesDatabase;