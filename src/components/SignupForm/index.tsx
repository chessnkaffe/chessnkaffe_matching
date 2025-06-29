// src/components/SignupForm/index.tsx
import { FC, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth, db } from '../../utils/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import './styles.css';

interface ChessAccounts {
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
}

const SignupForm: FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [alias, setAlias] = useState('');
  const [pronoun, setPronoun] = useState('');
  const [queer, setQueer] = useState('');
  const [chessAccounts, setChessAccounts] = useState<ChessAccounts>({
    manual: {
      enabled: false,
      level: ''
    },
    'chess.com': {
      enabled: false,
      username: '',
      rating: null
    },
    lichess: {
      enabled: false,
      username: '',
      rating: null
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Chess Categories for manual rating changed 
  const manualRatingOptions = [
    { label: "Beginner (0-500)", range: "0 - 500", value: "beginner" },
    { label: "Apprentice (500-1000)", range: "500 - 1000", value: "apprentice" }, 
    { label: "Intermediate (1000-1500)", range: "1000 - 1500", value: "intermediate" },
    { label: "Advanced (1500-2000)", range: "1500 - 2000", value: "advanced" },
    { label: "Expert (2000+)", range: "over 2000", value: "expert" }
  ];
  // const manualRatingOptions = [
  //   { label: "Beginner ♟️", range: "0 - 500", value: "pawn" },
  //   { label: "Intermediate ♞", range: "500 - 1000", value: "tourist" },
  //   { label: "Advanced ♝", range: "1000 - 1500", value: "strategist" },
  //   { label: "Expert ♜", range: "1500 - 2000", value: "ninja" },
  //   { label: "Master ♛", range: "over 2000", value: "dj" }
  // ];

  const fetchChessComRating = async () => {
    if (!chessAccounts['chess.com'].username) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.chess.com/pub/player/${chessAccounts['chess.com'].username}/stats`
      );
      const data = await response.json();
      
      const ratings = ['chess_rapid', 'chess_blitz', 'chess_bullet']
        .map(game => data[game]?.last?.rating)
        .filter((rating): rating is number => rating !== undefined);

      if (ratings.length > 0) {
        const maxRating = Math.max(...ratings);
        setChessAccounts(prev => ({
          ...prev,
          'chess.com': {
            ...prev['chess.com'],
            rating: maxRating
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching Chess.com rating:', error);
      alert('Error fetching Chess.com rating. Please check the username.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLichessRating = async () => {
    if (!chessAccounts.lichess.username) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`https://lichess.org/api/user/${chessAccounts.lichess.username}`);
      const data = await response.json();
      
      const ratings = ['blitz', 'rapid', 'classical']
        .map(game => data.perfs[game]?.rating)
        .filter((rating): rating is number => rating !== undefined);

      if (ratings.length > 0) {
        const maxRating = Math.max(...ratings);
        setChessAccounts(prev => ({
          ...prev,
          lichess: {
            ...prev.lichess,
            rating: maxRating
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching Lichess rating:', error);
      alert('Error fetching Lichess rating. Please check the username.');
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
  
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Calculate manual rating if enabled
      const manualRating = chessAccounts.manual.enabled ? getManualRating(chessAccounts.manual.level) : null;
  
      // Get all available ratings
      const availableRatings = [
        manualRating,
        chessAccounts['chess.com'].enabled ? chessAccounts['chess.com'].rating : null,
        chessAccounts.lichess.enabled ? chessAccounts.lichess.rating : null
      ].filter((rating): rating is number => rating !== null);
  
      // Calculate average rating if there are any ratings available
      const avgRating = availableRatings.length > 0
        ? Math.round(availableRatings.reduce((sum, rating) => sum + rating, 0) / availableRatings.length)
        : null;
  
      const userData = {
        alias,
        pronoun,
        queer: queer === 'yes',
        email: email.toLowerCase(), // Store email in lowercase for consistent lookups
        chessExperience: {
          manual: chessAccounts.manual.enabled ? {
            level: chessAccounts.manual.level,
            rating: manualRating
          } : null,
          'chess.com': chessAccounts['chess.com'].enabled ? {
            username: chessAccounts['chess.com'].username,
            rating: chessAccounts['chess.com'].rating
          } : null,
          lichess: chessAccounts.lichess.enabled ? {
            username: chessAccounts.lichess.username,
            rating: chessAccounts.lichess.rating
          } : null,
          average_rating: avgRating
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
  
      await setDoc(doc(db, 'users', user.uid), userData);
      router.push('/profile');
    } catch (error) {
      console.error('Signup error:', error);
      alert('Error creating account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
      <Link href="/" style={{ 
        color: '#E67F0F', 
        textDecoration: 'none',
        fontSize: '0.9rem',
        fontWeight: '600'
      }}>
        ← Back to Home
      </Link>
    </div>
      <div className="brand-header">
        <h1 className="brand-title">ChessnKaffe Signup</h1>
        <p className="brand-slogan">Chess connections over coffee</p>
      </div>
    
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Alias"
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
          required
        />
        <select
          value={pronoun}
          onChange={(e) => setPronoun(e.target.value)}
          required
        >
          <option value="">Select Pronoun</option>
          <option value="she">she/her</option>
          <option value="they">they/them</option>
          <option value="he">he/him</option>
          <option value="all">any pronouns</option>
          <option value="none">prefer not to share</option>
        </select>
        <select
          value={queer}
          onChange={(e) => setQueer(e.target.value)}
          required
        >
          <option value="">Are you Queer?</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>

        {/* Chess Experience Section */}
        <div className="chess-experience-section">
          <h3>Chess Experience</h3>
          
          {/* Manual Rating */}
          <div className="rating-option">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={chessAccounts.manual.enabled}
                onChange={(e) => setChessAccounts(prev => ({
                  ...prev,
                  manual: {
                    ...prev.manual,
                    enabled: e.target.checked
                  }
                }))}
              />
              Manual Rating
            </label>
            {chessAccounts.manual.enabled && (
              <select
                className="rating-select"
                value={chessAccounts.manual.level}
                onChange={(e) => setChessAccounts(prev => ({
                  ...prev,
                  manual: {
                    ...prev.manual,
                    level: e.target.value
                  }
                }))}
              >
                <option value="">Select your level</option>
                {manualRatingOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label} ({option.range})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Chess.com Rating */}
          <div className="rating-option">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={chessAccounts['chess.com'].enabled}
                onChange={(e) => setChessAccounts(prev => ({
                  ...prev,
                  'chess.com': {
                    ...prev['chess.com'],
                    enabled: e.target.checked
                  }
                }))}
              />
              Chess.com Account
            </label>
            {chessAccounts['chess.com'].enabled && (
              <div className="platform-input">
                <input
                  type="text"
                  placeholder="Chess.com username"
                  value={chessAccounts['chess.com'].username}
                  onChange={(e) => setChessAccounts(prev => ({
                    ...prev,
                    'chess.com': {
                      ...prev['chess.com'],
                      username: e.target.value
                    }
                  }))}
                />
                <button 
                  type="button"
                  className="fetch-button"
                  onClick={fetchChessComRating}
                  disabled={isLoading}
                >
                  Fetch Rating
                </button>
                {chessAccounts['chess.com'].rating && (
                  <div className="rating-display">
                    Rating: {chessAccounts['chess.com'].rating}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Lichess Rating */}
          <div className="rating-option">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={chessAccounts.lichess.enabled}
                onChange={(e) => setChessAccounts(prev => ({
                  ...prev,
                  lichess: {
                    ...prev.lichess,
                    enabled: e.target.checked
                  }
                }))}
              />
              Lichess Account
            </label>
            {chessAccounts.lichess.enabled && (
              <div className="platform-input">
                <input
                  type="text"
                  placeholder="Lichess username"
                  value={chessAccounts.lichess.username}
                  onChange={(e) => setChessAccounts(prev => ({
                    ...prev,
                    lichess: {
                      ...prev.lichess,
                      username: e.target.value
                    }
                  }))}
                />
                <button 
                  type="button"
                  className="fetch-button"
                  onClick={fetchLichessRating}
                  disabled={isLoading}
                >
                  Fetch Rating
                </button>
                {chessAccounts.lichess.rating && (
                  <div className="rating-display">
                    Rating: {chessAccounts.lichess.rating}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>
      <p>
      Already have an account? <Link href="/login">Login</Link>
      </p>
    </div>
  );
};

export default SignupForm;