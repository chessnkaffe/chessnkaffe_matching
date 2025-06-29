// src/utils/cafeUtils.js
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';

// Function to get cafes for a specific neighborhood
export const getCafesByNeighborhood = async (neighborhood) => {
  try {
    const cafesRef = collection(db, 'cafes');
    const q = query(cafesRef, where('neighborhood', '==', neighborhood));
    const querySnapshot = await getDocs(q);
    
    const cafes = [];
    querySnapshot.forEach((doc) => {
      cafes.push({ id: doc.id, ...doc.data() });
    });
    
    return cafes;
  } catch (error) {
    console.error('Error fetching cafes:', error);
    return [];
  }
};
