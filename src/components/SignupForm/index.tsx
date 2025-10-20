// src/components/SignupForm/index.tsx
import { FC, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth, db } from '../../utils/firebase';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Eye, EyeOff } from 'lucide-react'; 
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
  const [pronoun, setPronoun] = useState(''); // Keep for backward compatibility
  const [selectedPronouns, setSelectedPronouns] = useState<string[]>([]);
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
  const [verificationSent, setVerificationSent] = useState(false); //authentication of email

  // VARIABLES TO SEE PASSWORD EYE
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  

  const router = useRouter();

  // Chess Categories for manual rating changed 
  const manualRatingOptions = [
    { label: "Beginner (ELO: 0-500)", range: "0 - 500", value: "beginner" },
    { label: "Apprentice (ELO: 500-1000)", range: "500 - 1000", value: "apprentice" }, 
    { label: "Intermediate (ELO: 1000-1500)", range: "1000 - 1500", value: "intermediate" },
    { label: "Advanced (ELO: 1500-2000)", range: "1500 - 2000", value: "advanced" },
    { label: "Expert (ELO: 2000+)", range: "over 2000", value: "expert" }
  ];
  // const manualRatingOptions = [
  //   { label: "Beginner ♟️", range: "0 - 500", value: "pawn" },
  //   { label: "Intermediate ♞", range: "500 - 1000", value: "tourist" },
  //   { label: "Advanced ♝", range: "1000 - 1500", value: "strategist" },
  //   { label: "Expert ♜", range: "1500 - 2000", value: "ninja" },
  //   { label: "Master ♛", range: "over 2000", value: "dj" }
  // ];

  const pronounOptions = [
    { value: 'she/her', label: 'she/her' },
    { value: 'they/them', label: 'they/them' },
    { value: 'he/him', label: 'he/him' },
    { value: 'any', label: 'any pronouns' },
    { value: 'prefer-not-to-share', label: 'prefer not to share' }
  ];

  const queerOptions = [
    { value: 'yes', label: 'Yes' },
    { value: 'no', label: 'No' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' }
  ];

  const handlePronounChange = (value: string) => {
    if (value === 'any' || value === 'prefer-not-to-share') {
      // If "any pronouns" or "prefer not to share" is selected, only keep that selection
      setSelectedPronouns([value]);
    } else {
      // For other pronouns (she/her, they/them, he/him)
      setSelectedPronouns(prev => {
        // Remove "any" and "none" if they were previously selected
        const filtered = prev.filter(p => p !== 'any' && p !== 'prefer-not-to-share');
        
        // Toggle the current selection
        if (filtered.includes(value)) {
          return filtered.filter(p => p !== value);
        } else {
          return [...filtered, value];
        }
      });
    }
  };

  const getLegacyPronoun = (pronouns: string[]): string => {
    if (pronouns.length === 0) return '';
    if (pronouns.length === 1) return pronouns[0];
    return pronouns[0]; // Default to first selected
  };

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
    if (selectedPronouns.length === 0) {
      alert('Please select at least one pronoun option.');
      return;
    }
    setIsLoading(true);
  
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      // Send email verification
      await sendEmailVerification(user);
      setVerificationSent(true); // Don't automatically redirect to profile yet

  
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
        //pronoun: getLegacyPronoun(selectedPronouns), // Backward compatibility
        pronouns: selectedPronouns, // New field
        queer: queer,
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
      //router.push('/profile');
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
          placeholder="Insert an alias"
          value={alias}
          onChange={(e) => setAlias(e.target.value)}
          required
        />
        <div className="pronoun-selection">
          <label className="form-label">Select your pronoun(s)</label>
          <p className="helper-text">Pronouns help everyone talk to each other in the way that feels right.</p>
          <div className="checkbox-group">
            {pronounOptions.map(option => (
              <label key={option.value} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedPronouns.includes(option.value)}
                  onChange={() => handlePronounChange(option.value)}
                  className="checkbox-input"
                />
                <span className="checkbox-text">{option.label}</span>
              </label>
            ))}
          </div>
          {selectedPronouns.length === 0 && (
            <span className="error-text">Please select at least one pronoun option</span>
          )}
        </div>
        <div className="queer-selection">
          <label className="form-label">Are you queer?</label>
          <p className="helper-text">'Queer' in the LGBTQIA+ sense —helps us prioritize inclusive matching.</p>
          <div className="checkbox-group">
            {queerOptions.map(option => (
              <label key={option.value} className="checkbox-label">
                <input
                  type="radio"
                  name="queer"
                  value={option.value}
                  checked={queer === option.value}
                  onChange={(e) => setQueer(e.target.value)}
                  className="checkbox-input"
                />
                <span className="checkbox-text">{option.label}</span>
              </label>
            ))}
          </div>
          {!queer && (
            <span className="error-text">Please select an option</span>
          )}
        </div>

        {/* Chess Experience Section */}
        <div className="chess-experience-selection">
          <label className="form-label">Share your Chess Level</label>
          <p className="helper-text">Select your level manually or add your Chess.com/Lichess username.</p>
          
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
              Select it manually
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
                    {option.label} {/* ({option.range}) */}
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
              Share your Chess.com username
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
              Share your Lichess username
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

        {/* ADD SECTION - SET YOUR CREDENTIALS */}
        {/* <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        /> */}
        {/* See password: */}
        <div className="password-input-container">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            aria-label="Toggle password visibility"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Add this new confirm password field: */}
        <div className="password-input-container">
          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            aria-label="Toggle confirm password visibility"
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>




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