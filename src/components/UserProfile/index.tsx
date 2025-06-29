// src/components/UserProfile/index.tsx 
import React, { FC, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Changed from useNavigate
import { auth, db } from '../../utils/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { LogOut, Loader2, Edit2 } from 'lucide-react';
import ChessMatchForm from '@/components/ChessMatchForm';
import MyMatches from '@/components/MyMatches';
import NotificationBell from '@/components/NotificationBell'; // Add this import
import './styles.css';

interface UserData {
  alias: string;
  pronoun: string;
  queer: boolean;
  email: string;
  //avgRating: number | null; // Add avgRating to interface
  chessExperience: {
    average_rating?: number | null;
    manual: {
      level: string;
      rating: number | null; // Add rating to manual experience
    } | null;
    'chess.com': {
      username: string;
      rating: number | null;
    } | null;
    lichess: {
      username: string;
      rating: number | null;
    } | null;
  };
}

interface EditFormState {
  alias: string;
  pronoun: string;
  queer: boolean;
  chessExperience: {
    manual: {
      enabled: boolean;
      level: string;
    };
    'chess.com': {
      enabled: boolean;
      username: string;
      rating: number | null;
    };
    lichess: {
      enabled: boolean;
      username: string;
      rating: number | null;
    };
  };
}


const UserProfile: FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'preferences' | 'matches' | 'profile'>('preferences');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<EditFormState | null>(null);
  const [isFetchingRating, setIsFetchingRating] = useState({
    'chess.com': false,
    lichess: false
  });
  const router = useRouter();

  const pronounOptions = [
    { value: 'she/her', label: 'she/her' },
    { value: 'they/them', label: 'they/them' },
    { value: 'he/his', label: 'he/his' },
    { value: 'any', label: 'Any pronouns' },
    { value: 'prefer-not-to-share', label: 'Prefer not to share' }
  ];

  const getManualRating = (level: string): number => {
    const ratings = {
      "beginner": 250,     // Beginner
      "apprentice": 750,   // Apprentice (changed from "novice")
      "intermediate": 1250, // Intermediate
      "advanced": 1750,    // Advanced
      "expert": 2000       // Expert
      // "pawn": 250,      // Beginner
      // "tourist": 750,   // Intermediate
      // "strategist": 1250, // Advanced
      // "ninja": 1750,    // Expert
      // "dj": 2000        // Master
    };
    return ratings[level as keyof typeof ratings] || 0;
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) {
        router.push('/');
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        
        if (userDoc.exists()) {
          const user = userDoc.data() as UserData;
          setUserData(user);
          
          // Initialize edit form with current data
          setEditForm({
            alias: user.alias || '',
            pronoun: user.pronoun || '',
            queer: user.queer || false,
            chessExperience: {
              manual: {
                enabled: !!user.chessExperience?.manual,
                level: user.chessExperience?.manual?.level || ''
              },
              'chess.com': {
                enabled: !!user.chessExperience?.['chess.com'],
                username: user.chessExperience?.['chess.com']?.username || '',
                rating: user.chessExperience?.['chess.com']?.rating || null
              },
              lichess: {
                enabled: !!user.chessExperience?.lichess,
                username: user.chessExperience?.lichess?.username || '',
                rating: user.chessExperience?.lichess?.rating || null
              }
            }
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router.push]);


  const fetchChessComRating = async (username: string) => {
    if (!username) return;
    
    setIsFetchingRating(prev => ({ ...prev, 'chess.com': true }));
    try {
      const response = await fetch(
        `https://api.chess.com/pub/player/${username}/stats`
      );
      const data = await response.json();
      
      const ratings = ['chess_rapid', 'chess_blitz', 'chess_bullet']
        .map(game => data[game]?.last?.rating)
        .filter((rating): rating is number => rating !== undefined);

      if (ratings.length > 0) {
        const maxRating = Math.max(...ratings);
        setEditForm(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            chessExperience: {
              ...prev.chessExperience,
              'chess.com': {
                ...prev.chessExperience['chess.com'],
                rating: maxRating,
                enabled: true
              }
            }
          };
        });
      }
    } catch (error) {
      console.error('Error fetching Chess.com rating:', error);
      alert('Error fetching Chess.com rating. Please check the username.');
    } finally {
      setIsFetchingRating(prev => ({ ...prev, 'chess.com': false }));
    }
  };

  const fetchLichessRating = async (username: string) => {
    if (!username) return;

    setIsFetchingRating(prev => ({ ...prev, lichess: true }));
    try {
      const response = await fetch(`https://lichess.org/api/user/${username}`);
      const data = await response.json();
      
      const ratings = ['blitz', 'rapid', 'classical']
        .map(game => data.perfs[game]?.rating)
        .filter((rating): rating is number => rating !== undefined);

      if (ratings.length > 0) {
        const maxRating = Math.max(...ratings);
        setEditForm(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            chessExperience: {
              ...prev.chessExperience,
              lichess: {
                ...prev.chessExperience.lichess,
                rating: maxRating,
                enabled: true
              }
            }
          };
        });
      }
    } catch (error) {
      console.error('Error fetching Lichess rating:', error);
      alert('Error fetching Lichess rating. Please check the username.');
    } finally {
      setIsFetchingRating(prev => ({ ...prev, lichess: false }));
    }
  };

  // Update handleChessUsernameChange to fetch ratings when username changes
  const handleChessUsernameChange = (platform: 'chess.com' | 'lichess', username: string) => {
    setEditForm(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        chessExperience: {
          ...prev.chessExperience,
          [platform]: {
            ...prev.chessExperience[platform],
            username,
            enabled: !!username
          }
        }
      };
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser || !editForm) return;

    try {
      // Calculate manual rating if enabled
      const manualRating = editForm.chessExperience.manual.enabled ? 
        getManualRating(editForm.chessExperience.manual.level) : null;

      // Get all available ratings
      const availableRatings = [
        manualRating,
        editForm.chessExperience['chess.com'].enabled ? editForm.chessExperience['chess.com'].rating : null,
        editForm.chessExperience.lichess.enabled ? editForm.chessExperience.lichess.rating : null
      ].filter((rating): rating is number => rating !== null);

      // Calculate average rating if there are any ratings available
      const avgRating = availableRatings.length > 0
        ? Math.round(availableRatings.reduce((sum, rating) => sum + rating, 0) / availableRatings.length)
        : null;

      const updateData = {
        alias: editForm.alias,
        pronoun: editForm.pronoun,
        queer: editForm.queer,
        chessExperience: {
          manual: editForm.chessExperience.manual.enabled ? {
            level: editForm.chessExperience.manual.level,
            rating: manualRating // Add manual rating
          } : null,
          'chess.com': editForm.chessExperience['chess.com'].enabled ? {
            username: editForm.chessExperience['chess.com'].username,
            rating: editForm.chessExperience['chess.com'].rating
          } : null,
          lichess: editForm.chessExperience.lichess.enabled ? {
            username: editForm.chessExperience.lichess.username,
            rating: editForm.chessExperience.lichess.rating
          } : null,
          average_rating: avgRating
        },
        updatedAt: new Date().toISOString()
      };

      await updateDoc(doc(db, 'users', auth.currentUser.uid), updateData);

      // Refresh user data
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data() as UserData);
      }

      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    }
  };


  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  


  /** const renderChessAccounts = () => {
    if (!userData?.chessExperience) return null;

    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between pb-4 border-b mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Chess Experience</h2>
        </div>
        <div className="grid gap-4">
          {userData.chessExperience.manual && (
            <div className="mb-6 bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-gray-500 font-medium">Average Rating</div>
              <div className="mt-1 text-lg font-semibold text-blue-600">{userData.avgRating}</div>
            </div>
          )}
          
          {userData.chessExperience['chess.com'] && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-sm text-gray-500 font-medium">Chess.com Username</div>
                  <div className="mt-1 text-lg font-semibold">{userData.chessExperience['chess.com'].username}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-medium">Rating</div>
                  <div className="mt-1 text-lg font-semibold">
                    {userData.chessExperience['chess.com'].rating || 'Not available'}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {userData.chessExperience.lichess && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-sm text-gray-500 font-medium">Lichess Username</div>
                  <div className="mt-1 text-lg font-semibold">{userData.chessExperience.lichess.username}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 font-medium">Rating</div>
                  <div className="mt-1 text-lg font-semibold">
                    {userData.chessExperience.lichess.rating || 'Not available'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }; */

  const renderEditForm = () => {
    if (!editForm) return null;

    return (
      <div className="profile-grid">
        <div className="profile-section">
          <form onSubmit={handleEditSubmit}>
            <div className="section-header">
              <h2 className="section-title">Edit Profile</h2>
            </div>
            
            <div className="info-grid">
              <div className="info-card">
                <label className="info-label">Alias</label>
                <input
                  type="text"
                  value={editForm.alias}
                  onChange={e => setEditForm({...editForm, alias: e.target.value})}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="info-card">
                <label className="info-label">Pronoun</label>
                <select
                  value={editForm.pronoun}
                  onChange={e => setEditForm({...editForm, pronoun: e.target.value})}
                  className="w-full p-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {pronounOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="info-card">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={editForm.queer}
                    onChange={e => setEditForm({...editForm, queer: e.target.checked})}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <label className="info-label mb-0">Queer</label>
                </div>
              </div>
            </div>

            <div className="section-header mt-6">
              <h2 className="section-title">Chess Experience</h2>
            </div>
            
            <div className="info-grid">
              <div className="info-card">
                <label className="info-label">Manual Rating Level</label>
                <select
                  value={editForm.chessExperience.manual.level}
                  onChange={e => setEditForm({
                    ...editForm,
                    chessExperience: {
                      ...editForm.chessExperience,
                      manual: {
                        ...editForm.chessExperience.manual,
                        level: e.target.value,
                        enabled: true
                      }
                    }
                  })}
                  className="w-full p-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Level</option>
                  <option value="beginner">Beginner (0-500)</option>
                  <option value="apprentice">Apprentice (500-1000)</option>
                  <option value="intermediate">Intermediate (1000-1500)</option>
                  <option value="advanced">Advanced (1500-2000)</option>
                  <option value="expert">Expert (2000+)</option>
                </select>
              </div>

              <div className="info-card">
                <label className="info-label">Chess.com Username</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={editForm.chessExperience['chess.com'].username}
                    onChange={e => handleChessUsernameChange('chess.com', e.target.value)}
                    className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => fetchChessComRating(editForm.chessExperience['chess.com'].username)}
                    disabled={!editForm.chessExperience['chess.com'].username || isFetchingRating['chess.com']}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
                  >
                    {isFetchingRating['chess.com'] ? 'Fetching...' : 'Fetch Rating'}
                  </button>
                </div>
                {editForm.chessExperience['chess.com'].rating && (
                  <div className="badge badge-blue mt-2">
                    Rating: {editForm.chessExperience['chess.com'].rating}
                  </div>
                )}
              </div>

              <div className="info-card">
                <label className="info-label">Lichess Username</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={editForm.chessExperience.lichess.username}
                    onChange={e => handleChessUsernameChange('lichess', e.target.value)}
                    className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => fetchLichessRating(editForm.chessExperience.lichess.username)}
                    disabled={!editForm.chessExperience.lichess.username || isFetchingRating.lichess}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
                  >
                    {isFetchingRating.lichess ? 'Fetching...' : 'Fetch Rating'}
                  </button>
                </div>
                {editForm.chessExperience.lichess.rating && (
                  <div className="badge badge-blue mt-2">
                    Rating: {editForm.chessExperience.lichess.rating}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="user-profile-container">
      <div className="header-gradient">
        <div className="header-content">
          <h1 className="header-title">Welcome, {userData?.alias}!</h1>
          <div className="header-actions">
            <div className="tab-container">
              <div className="tab-buttons">
                <button
                  onClick={() => setActiveTab('preferences')}
                  className={`tab-button ${activeTab === 'preferences' ? 'tab-button-active' : ''}`}
                >
                  Find Chess Partners
                </button>
                
                <button
                  onClick={() => setActiveTab('matches')}
                  className={`tab-button ${activeTab === 'matches' ? 'tab-button-active' : ''}`}
                >
                  My Matches
                </button>

                <button
                  onClick={() => setActiveTab('profile')}
                  className={`tab-button ${activeTab === 'profile' ? 'tab-button-active' : ''}`}
                >
                  Profile
                </button>                
              </div>
            </div>

            {/* Add NotificationBell here - between tabs and logout */}
            <NotificationBell />

            <button onClick={handleLogout} className="logout-button">
              <LogOut className="button-icon" />
              Logout
            </button>
          </div>
        </div>
      </div>

      

      {activeTab === 'preferences' && <ChessMatchForm />}
      {/* Add this to the conditional rendering section */}
      {activeTab === 'matches' && <MyMatches />}

      {activeTab === 'profile' && (
        <div className="profile-grid">
          {!isEditing ? (
            <>
              {/* Basic Profile Info */}
              <div className="profile-section">
                <div className="section-header">
                  <h2 className="section-title">Basic Info</h2>
                  <button onClick={() => setIsEditing(true)} className="edit-button">
                    <Edit2 className="button-icon" />
                    Edit Profile
                  </button>
                </div>
                <div className="info-grid">
                  <div className="info-card">
                    <div className="info-label">Alias</div>
                    <div className="info-value">{userData?.alias}</div>
                  </div>
                  <div className="info-card">
                    <div className="info-label">Pronoun</div>
                    <div className="info-value">{userData?.pronoun}</div>
                  </div>
                  <div className="info-card">
                    <div className="info-label">Email</div>
                    <div className="info-value">{userData?.email}</div>
                  </div>
                  {userData?.queer && (
                    <div className="info-card">
                      <div className="info-label">Identity</div>
                      <div className="badge badge-purple">🏳️‍🌈 Queer</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Chess Experience */}
              <div className="profile-section">
                <div className="section-header">
                  <h2 className="section-title">Chess Experience</h2>
                </div>
                <div className="info-grid">
                  {userData?.chessExperience?.manual && (
                    <div className="info-card">
                      <div className="info-label">Self-Rated Level</div>
                      <div className="info-value">
                        {{
                          'beginner': 'Beginner (0-500)',
                          'apprentice': 'Apprentice (500-1000)',
                          'intermediate': 'Intermediate (1000-1500)',
                          'advanced': 'Advanced (1500-2000)',
                          'expert': 'Expert (2000+)'
                        }[userData.chessExperience.manual.level] || userData.chessExperience.manual.level}
                      </div>
                    </div>
                  )}
                  {userData?.chessExperience?.['chess.com'] && (
                    <div className="info-card">
                      <div className="info-label">Chess.com</div>
                      <div className="info-value">
                        {userData.chessExperience['chess.com'].username}
                        <div className="badge badge-blue">
                          Rating: {userData.chessExperience['chess.com'].rating}
                        </div>
                      </div>
                    </div>
                  )}
                  {userData?.chessExperience?.lichess && (
                    <div className="info-card">
                      <div className="info-label">Lichess</div>
                      <div className="info-value">
                        {userData.chessExperience.lichess.username}
                        <div className="badge badge-blue">
                          Rating: {userData.chessExperience.lichess.rating}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            renderEditForm()
          )}
        </div>
      )}
    </div>
  );
};

export default UserProfile;