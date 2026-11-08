import { useState } from 'react'

const Dashboard = ({ userEmail, onLogout }) => {
  const [targetJob, setTargetJob] = useState('');

  const handleGenerateRoadmap = () => {
    alert(`Generating Reverse Roadmap for: ${targetJob}`);
  };

  return (
    <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#1a73e8' }}>Success Route Dashboard</h1>
        <button 
          onClick={onLogout} 
          style={{ padding: '10px 20px', backgroundColor: '#f44336', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
          Logout
        </button>
      </div>
      
      <div style={{ backgroundColor: '#f8f9fa', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        <h2>Welcome, {userEmail}</h2>
        <p style={{ color: '#666' }}>Enter your desired job role below to begin the <strong>Reverse Methodology</strong> process.</p>
        
        <div style={{ display: 'flex', gap: '15px', marginTop: '25px' }}>
          <input 
            type="text" 
            placeholder="e.g. Data Scientist, AI Engineer, Project Manager" 
            value={targetJob}
            onChange={(e) => setTargetJob(e.target.value)}
            style={{ flex: 3, padding: '15px', borderRadius: '5px', border: '1px solid #ccc', fontSize: '16px' }}
          />
          <button 
            onClick={handleGenerateRoadmap}
            style={{ flex: 1, backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Generate Roadmap
          </button>
        </div>
      </div>

      <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>AI Resume Analyzer</h3>
          <p style={{ fontSize: '14px', color: '#555' }}>Upload your resume to get an ATS-friendly score and AI optimization.</p>
          <button style={{ padding: '8px 15px', cursor: 'pointer' }}>Upload PDF</button>
        </div>
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>Market Trends</h3>
          <p style={{ fontSize: '14px', color: '#555' }}>View salary ranges and experience expectations based on 2025 tech datasets.</p>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const handleLogin = (e) => {
    e.preventDefault();
    if (email && password) {
      setIsLoggedIn(true);
    } else {
      alert("Please fill in all fields");
    }
  };

  return (
    <>
      {isLoggedIn ? (
        <Dashboard userEmail={email} onLogout={() => setIsLoggedIn(false)} />
      ) : (
        <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial, sans-serif' }}>
          
          {/* LEFT SIDE: FORM */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
            <div style={{ width: '380px', padding: '20px' }}>
              <h2 style={{ color: '#1a73e8', fontSize: '28px', marginBottom: '10px' }}>
                {isLogin ? "Welcome Back" : "Create Account"}
              </h2>
              <p style={{ color: '#666', marginBottom: '30px' }}>
                {isLogin ? "Log in to access your career roadmap." : "Sign up to start mapping your future."}
              </p>
              
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Email Address</label>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ddd' }}
                    placeholder="johndoe@gmail.com"
                    required 
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  <label style={{ fontWeight: 'bold', fontSize: '14px' }}>Password</label>
                  <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ddd' }}
                    placeholder="••••••••"
                    required 
                  />
                </div>

                <button type="submit" style={{ 
                  backgroundColor: '#1a73e8', color: 'white', padding: '14px', border: 'none', 
                  borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' 
                }}>
                  {isLogin ? "Sign In" : "Register"}
                </button>
              </form>

              <p style={{ marginTop: '25px', textAlign: 'center', fontSize: '14px' }}>
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <span 
                  onClick={() => setIsLogin(!isLogin)} 
                  style={{ color: '#1a73e8', cursor: 'pointer', marginLeft: '5px', fontWeight: 'bold' }}
                >
                  {isLogin ? "Create one" : "Login here"}
                </span>
              </p>
            </div>
          </div>

          <div style={{ 
            flex: 1.2, backgroundColor: '#1a73e8', color: 'white', 
            display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px' 
          }}>
            <h1 style={{ fontSize: '42px', marginBottom: '20px' }}>Success Route</h1>
            <p style={{ fontSize: '18px', lineHeight: '1.6', marginBottom: '30px', opacity: '0.9' }}>
              Our <strong>Reverse Methodology</strong> identifies exactly what is required for success 
              in your chosen profession and systematically maps out the pathway to achieve it.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '10px' }}>
                <h4 style={{ margin: '0 0 10px 0' }}>🎯 Goal-Oriented Planning</h4>
                <p style={{ margin: 0, fontSize: '14px', opacity: '0.8' }}>We start with the end target and work backward to determine educational and certification needs.</p>
              </div>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '10px' }}>
                <h4 style={{ margin: '0 0 10px 0' }}>📄 AI Resume Evaluation</h4>
                <p style={{ margin: 0, fontSize: '14px', opacity: '0.8' }}>Integrated ATS-friendly scoring and intelligent reconstruction to align with modern standards.</p>
              </div>
              <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '10px' }}>
                <h4 style={{ margin: '0 0 10px 0' }}>📈 2025 Market Data</h4>
                <p style={{ margin: 0, fontSize: '14px', opacity: '0.8' }}>Utilizing real-world datasets for accurate skill mapping and salary expectations.</p>
              </div>
            </div>
          </div>

        </div>
      )}
    </>
  )
}

export default App