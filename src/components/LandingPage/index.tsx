// src/components/LandingPage/index.tsx
'use client'

import Link from 'next/link';
import './styles.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
        {/* Universal Header */}
        <header className="site-header">
        <div className="header-container">
            <div className="header-logo-section">
            <div className="header-horse-logo"></div>
            <div className="header-brand-text">ChessnKaffe</div>
            </div>
            <nav className="header-nav">
            <Link href="/signup" className="header-cta-primary">
                Join ChessnKaffe
            </Link>
            <Link href="/login" className="header-cta-secondary">
                Sign In
            </Link>
            </nav>
        </div>
        </header>

        {/* Hero Section - now without logo and buttons */}
        <section className="hero-section">
        <div className="hero-container">
            <div className="hero-content">
            <div className="hero-text">
                <h1 className="hero-title">
                <span className="hero-highlight"> An inclusive </span>  
                <br /> and collaborative <br />
                <span className="hero-highlight"> Chess Community</span>
                </h1>
                <p className="hero-tagline">
                ChessnKaffe is a community space created for people of all genders and skill levels to feel welcome, respected, and included while learning and playing chess.
                <br /> <br /> We aim to make chess more accessible and welcoming for everyone, inviting those who share values of respect, openness, and inclusion to join us in building a supportive and connected environment.
                <br /> <br /> Whether you&apos;re just learning or a long-time player, you&apos;re invited to join our newly chess platform to connect with fellow enthusiasts and set casual chess meetups in cafés around Copenhagen. It&apos;s free to join.
                <br /> <br /> Come play, connect, and build community. Because chess belongs to all of us.
                </p>
                
                <div className="hero-buttons">
                <Link href="/signup" className="cta-primary">
                    Join ChessnKaffe Platform
                    <span className="button-icon icon-arrow"></span>
                </Link>
                <Link href="/login" className="cta-secondary">
                    Already a member? Sign In
                </Link>
                </div>
            </div>
            <img src="/chessnkaffe_about.jpg" alt="ChessnKaffe Community" style={{width: '100%', height: '300px', objectFit: 'cover', borderRadius: '16px'}} />
            </div>
        </div>
        </section>

      
      
      {/* Hero Section */}
      {/* <section className="hero-section">
        <div className="hero-container">
          <div className="hero-buttons-top-right">
            <Link href="/signup" className="cta-primary">
              Join ChessnKaffe Platform
              <span className="button-icon icon-arrow"></span>
            </Link>
            <Link href="/login" className="cta-secondary">
              Already a member? Sign In
            </Link>
          </div>
          <div className="hero-content">
            <div className="hero-text">
              <div className="logo-section">
                <div className="horse-logo"></div>
                <div className="brand-text">ChessnKaffe</div>
              </div>
              <h1 className="hero-title">
                <span className="hero-highlight"> An inclusive </span>  
                <br /> and collaborative <br />
                <span className="hero-highlight"> Chess Community</span>
              </h1>
              <p className="hero-tagline">
                ChessnKaffe is a community space created for people of all genders and skill levels to feel welcome, respected, and included while learning and playing chess.
                <br /> <br /> We aim to make chess more accessible and welcoming for everyone, inviting those who share values of respect, openness, and inclusion to join us in building a supportive and connected environment.
                <br /> <br /> Whether you&apos;re just learning or a long-time player, you&apos;re invited to join our newly chess platform to connect with fellow enthusiasts and set casual chess meetups in cafés around Copenhagen. It&apos;s free to join.
                <br /> <br /> Come play, connect, and build community. Because chess belongs to all of us.
              </p>
              
              <div className="hero-buttons">
                <Link href="/signup" className="cta-primary">
                  Join ChessnKaffe Platform
                  <span className="button-icon icon-arrow"></span>
                </Link>
                <Link href="/login" className="cta-secondary">
                  Already a member? Sign In
                </Link>
              </div>
            </div>
            <img src="/chessnkaffe_about.jpg" alt="ChessnKaffe Community" style={{width: '100%', height: '300px', objectFit: 'cover', borderRadius: '16px'}} />
          </div>
        </div>
      </section> */}

      {/* Our Community Section */}
      <section className="our-community-section">
        <div className="our-community-container">
          <h2>Our Community</h2>
          <p className="community-description">
            ChessnKaffe brings together chess enthusiasts from all walks of life in Copenhagen. 
            From beginners taking their first steps to experienced players sharing their knowledge, 
            our community thrives on inclusivity, learning, and the shared love of chess.
          </p>
          
          <div className="community-gallery">
            <div className="gallery-row">
              <img src="/chessnkaffe_community_01_women.jpg" alt="Women ChessnKaffe event for beginners" className="gallery-img" />
              <img src="/chessnkaffe_community_02_summer.jpg" alt="ChessnKaffe at Den Sorte Plads" className="gallery-img" />
              <img src="/chessnkaffe_community_03_chess.jpg" alt="ChessnKaffe Community gathering" className="gallery-img" />
            </div>
            <div className="gallery-row">
              <img src="/chessnkaffe_community_04_cafe.jpg" alt="ChessnKaffe cozy cafe candles" className="gallery-img" />
              <img src="/chessnkaffe_community_05_queer.jpg" alt="ChessnKaffe learning inclusive" className="gallery-img" />
              <img src="/chessnkaffe_community_06_park.jpg" alt="ChessnKaffe Norrebro park" className="gallery-img" />
            </div>
            <div className="gallery-row">
              <img src="/chessnkaffe_community_07_beginners.jpg" alt="ChessnKaffe lessons beginners" className="gallery-img" />
              <img src="/chessnkaffe_community_08_den_sorte_plads.jpg" alt="ChessnKaffe at Den Sorte Plads Summer" className="gallery-img" />
              <img src="/chessnkaffe_community_09_learn.jpg" alt="ChessnKaffe community" className="gallery-img" />
            </div>
          </div>
        </div>
      </section>

      {/* Community Values Section */}
      <section className="values-section">
        <div className="values-container">
          <div className="values-header">
            <h2 className="values-title">Our Community Values</h2>
            <p className="values-intro">
              ChessnKaffe community is built on <strong>inclusivity, respect, and a shared love for the game</strong>. 
              Every meetup should reflect these values, creating a safe and welcoming space for everyone—regardless of experience, background, or identity.
            </p>
            <p className="values-commitment">
              We believe chess should be enjoyed by all. That&apos;s why we ask every member to uphold the following values:
            </p>
          </div>
          
          <div className="values-grid">
            <div className="value-card">
              <div className="value-header">
                <div className="value-emoji">💛</div>
                <h3 className="value-title">Inclusivity</h3>
              </div>
              <p className="value-description">
                Everyone is welcome—regardless of gender, identity, background, or chess level. 
                We celebrate diversity and strive to make each game table a space of belonging.
              </p>
            </div>
            
            <div className="value-card">
              <div className="value-header">
                <div className="value-emoji">🫱🏽‍🫲🏼</div>
                <h3 className="value-title">Respect</h3>
              </div>
              <p className="value-description">
                Treat others with kindness, both on and off the board. Ask about pronouns, 
                listen openly, and honor each person&apos;s individuality.
              </p>
            </div>
            
            <div className="value-card">
              <div className="value-header">
                <div className="value-emoji">📚</div>
                <h3 className="value-title">Sharing</h3>
              </div>
              <p className="value-description">
                If you&apos;re a more experienced player, share your knowledge warmly. 
                Teaching and learning should feel inspiring, never intimidating.
              </p>
            </div>
            
            <div className="value-card zero-tolerance">
              <div className="value-header">
                <div className="value-emoji">🛡️</div>
                <h3 className="value-title">Zero Tolerance for Discrimination</h3>
              </div>
              <p className="value-description">
                There is no room in our community for racism, sexism, homophobia, transphobia, 
                biphobia, femmephobia, or any form of discrimination. Violations of this principle will not be tolerated.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-container">
          <h2 className="features-title">How ChessnKaffe Platform Works</h2>
          <p className="features-subtitle">
            Beyond our community events, we now offer personalized chess partner matching 
            to help you connect and play more often with fellow enthusiasts and set up cozy chess games around Copenhagen cafes.
          </p>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Smart Matching</h3>
              <p>
                Find chess partners based on your skill level, queerness, preferred areas in Copenhagen, and availability.
                Our algorithm suggests compatible players so you can enjoy games that are both fun and challenging.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">☕️</div>
              <h3>Café Meetups</h3>
              <p>
                Play in Copenhagen&apos;s chess-friendly cafés, chosen for their welcoming vibe and great coffee.
                Schedule matches at convenient times and locations creating nice atmosphere for chess and conversation.
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🤝</div>
              <h3>Community Values</h3>
              <p>
                Every member commits to our values of inclusivity and respect. 
                Connect with like-minded players in a supportive environment where everyone feels welcome.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="community-section">
        <div className="community-container">
          <div className="community-content">
            <div className="community-text">
              <h2>Part of Something Bigger</h2>
              <p>
                When you join our matching platform, you&apos;re not just finding someone to play with 
                —you&apos;re helping build a more welcoming, diverse, and inclusive chess culture in Copenhagen.
                <br /> <br /> At ChessnKaffe, we believe chess belongs to everyone. Together, over coffee and conversation, 
                we&apos;re reshaping this science-sport into a space where all genders, levels, and backgrounds feel at home.
              </p>
            </div>
            <img src="/chessnkaffe_community_fun_chess.jpg" alt="ChessnKaffe Community" style={{width: '100%', height: '300px', objectFit: 'cover', borderRadius: '16px'}} />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2>Ready to Find Your Chess Partner?</h2>
          <p>
            Join the ChessnKaffe matching platform and discover your next favorite opponent. 
            Connect with our inclusive community and start playing more chess today.
          </p>
          <Link href="/signup" className="cta-final">
            Start Matching Today
            <span className="button-icon icon-arrow"></span>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-section">
              <h3>ChessnKaffe Platform</h3>
              <p>Connecting chess enthusiasts <br /> across Copenhagen</p>
            </div>
            <div className="footer-section">
              <h4>ChessnKaffe Community</h4>
              <Link href="/signup">Join Us</Link>
              <Link href="/login">Sign In</Link>
            </div>
            <div className="footer-section">
              <h4>ChessnKaffe Social Media</h4>
              <a href="https://www.instagram.com/chessnkaffe" target="_blank" rel="noopener noreferrer">Instagram</a>
              <a href="https://www.facebook.com/chessnkaffe" target="_blank" rel="noopener noreferrer">Facebook</a>
            </div>
            <div className="footer-section">
              <h4>ChessnKaffe Contact</h4>
              <a href="https://signal.me/#eu/+4520906050" target="_blank" rel="noopener noreferrer">Signal</a>
              <p>Email: chessnkaffe@gmail.com</p>
              <p>Copenhagen, Denmark</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 ChessnKaffe Copenhagen. Made with ♟️ in Copenhagen.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;