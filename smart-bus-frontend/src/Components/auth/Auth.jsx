import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Lock, Phone, MapPin, CreditCard,
  Eye, EyeOff, ArrowRight, UserPlus, LogIn, Scan
} from 'lucide-react';
import PropTypes from 'prop-types';
import api from '../../utils/apiClient';
import FaceCapture from '../faceAuth/FaceCapture';

const AnimatedBackground = () => {
  const blobRefs = useRef([]);
  
  useEffect(() => {
    const initialPositions = [
      { x: -4, y: 0 },
      { x: -4, y: 0 },
      { x: 20, y: -8 },
      { x: 20, y: -8 },
    ];
    let requestId;

    const handleScroll = () => {
      const newScroll = window.pageYOffset;

      blobRefs.current.forEach((blob, index) => {
        if (blob) {
          const initialPos = initialPositions[index];
          const xOffset = Math.sin(newScroll / 100 + index * 0.5) * 340;
          const yOffset = Math.cos(newScroll / 100 + index * 0.5) * 40;
          const x = initialPos.x + xOffset;
          const y = initialPos.y + yOffset;

          blob.style.transform = `translate(${x}px, ${y}px)`;
          blob.style.transition = "transform 1.4s ease-out";
        }
      });

      requestId = requestAnimationFrame(handleScroll);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(requestId);
    };
  }, []);

  return (
    <div className="fixed inset-0 animated-bg">
      <div className="absolute inset-0">
        <div
          ref={(ref) => (blobRefs.current[0] = ref)}
          className="absolute top-0 -left-4 md:w-96 md:h-96 w-72 h-72 bg-cyan-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 md:opacity-15"
        />
        <div
          ref={(ref) => (blobRefs.current[1] = ref)}
          className="absolute top-0 -right-4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 md:opacity-15 hidden sm:block"
        />
        <div
          ref={(ref) => (blobRefs.current[2] = ref)}
          className="absolute -bottom-8 left-[-40%] md:left-20 w-96 h-96 bg-cyan-700 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 md:opacity-15"
        />
        <div
          ref={(ref) => (blobRefs.current[3] = ref)}
          className="absolute -bottom-10 right-20 w-96 h-96 bg-gray-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 md:opacity-10 hidden sm:block"
        />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f10_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f10_1px,transparent_1px)] bg-[size:24px_24px]" />
    </div>
  );
};

// Input Field Component
const InputField = ({ icon: Icon, type, placeholder, value, onChange, required = false, options = null }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  if (options) {
    return (
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
          <Icon className="h-5 w-5 text-gray-400 group-focus-within:text-cyan-400 transition-colors duration-300" />
        </div>
        <select
          value={value}
          onChange={onChange}
          required={required}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full pl-10 pr-4 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300 hover:border-cyan-400/30"
        >
          <option value="" disabled className="bg-gray-800 text-gray-400">
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-gray-800 text-white">
              {option.label}
            </option>
          ))}
        </select>
        <div className={`absolute inset-0 rounded-lg border-2 transition-all duration-300 pointer-events-none ${
          isFocused ? 'border-cyan-400/50 shadow-lg shadow-cyan-500/20' : 'border-transparent'
        }`} />
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
  <Icon className="h-5 w-5 text-gray-400 group-focus-within:text-cyan-400 transition-colors duration-300" />
      </div>
      <input
        type={type === 'password' && showPassword ? 'text' : type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
  className="w-full pl-10 pr-12 py-3 bg-gray-800/50 backdrop-blur-sm border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300 hover:border-cyan-400/30"
      />
      {type === 'password' && (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-cyan-400 transition-colors duration-300"
        >
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      )}
      <div className={`absolute inset-0 rounded-lg border-2 transition-all duration-300 pointer-events-none ${
  isFocused ? 'border-cyan-400/50 shadow-lg shadow-cyan-500/20' : 'border-transparent'
      }`} />
    </div>
  );
};

// Sign In Component
const SignInComponent = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showFaceCapture, setShowFaceCapture] = useState(false);
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' or 'face'

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await api.login(formData.email || formData.username, formData.password);
      // backend returns { token }
      const token = data?.token;
      if (!token) throw new Error('Login failed: no token returned');
      localStorage.setItem('token', token);
      // fetch user info and store minimal profile
      try {
        const me = await api.me(token);
        localStorage.setItem('userId', me.id);
        localStorage.setItem('userRole', me.role);
        localStorage.setItem('username', me.name || me.email || '');
      } catch (err) {
        // me may fail if token invalid but we keep token
        console.warn('Could not fetch /auth/me', err);
      }
      onSubmit({ token });
    } catch (error) {
      console.error('Login error:', error);
      alert(error.message);
    }
  };

  const handleFaceLogin = () => {
    setShowFaceCapture(true);
  };

  const handleFaceCapture = async (imageBase64) => {
    setShowFaceCapture(false);
    try {
      const data = await api.loginWithFace(imageBase64);
      const token = data?.token;
      if (!token) throw new Error('Face login failed: no token returned');
      
      localStorage.setItem('token', token);
      // fetch user info
      try {
        const me = await api.me(token);
        localStorage.setItem('userId', me.id);
        localStorage.setItem('userRole', me.role);
        localStorage.setItem('username', me.name || me.email || '');
      } catch (err) {
        console.warn('Could not fetch /auth/me', err);
      }
      onSubmit({ token });
    } catch (error) {
      console.error('Face login error:', error);
      alert(error.message || 'Face not recognized. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Login Method Tabs */}
      <div className="flex gap-2 bg-gray-800/50 rounded-lg p-1">
        <button
          onClick={() => setLoginMethod('password')}
          className={`flex-1 py-2 px-4 rounded-md transition-all ${
            loginMethod === 'password'
              ? 'bg-cyan-500 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Lock className="w-4 h-4 inline mr-2" />
          Password
        </button>
        <button
          onClick={() => setLoginMethod('face')}
          className={`flex-1 py-2 px-4 rounded-md transition-all ${
            loginMethod === 'face'
              ? 'bg-cyan-500 text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Scan className="w-4 h-4 inline mr-2" />
          Face ID
        </button>
      </div>

      {loginMethod === 'password' ? (
        <>
          <InputField 
            icon={User} 
            type="text" 
            placeholder="Email or Username" 
            value={formData.username} 
            onChange={e => handleInputChange('username', e.target.value)} 
            required 
          />
          <InputField 
            icon={Lock} 
            type="password" 
            placeholder="Password" 
            value={formData.password} 
            onChange={e => handleInputChange('password', e.target.value)} 
            required 
          />
          <button 
            onClick={handlePasswordLogin} 
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg flex items-center justify-center gap-2"
          >
            Sign In <ArrowRight className="w-4 h-4" />
          </button>
        </>
      ) : (
        <div className="text-center space-y-4 py-8">
          <div className="w-24 h-24 mx-auto bg-cyan-500/10 rounded-full flex items-center justify-center">
            <Scan className="w-12 h-12 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold mb-2">Face Authentication</h3>
            <p className="text-gray-400 text-sm">Click below to scan your face</p>
          </div>
          <button
            onClick={handleFaceLogin}
            className="py-3 px-8 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg inline-flex items-center justify-center gap-2"
          >
            <Scan className="w-5 h-5" />
            Scan Face to Login
          </button>
        </div>
      )}

      {showFaceCapture && (
        <FaceCapture
          onCapture={handleFaceCapture}
          onCancel={() => setShowFaceCapture(false)}
          title="Face Login"
        />
      )}
    </div>
  );
};



// Sign Up Component
const SignUpComponent = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    user_type: 'user',  // Changed from 'passenger' to 'user' to match database ENUM
    first_name: '',
    last_name: '',
    cin: '',
    email: '',
    phone_num: '',
    birth_date: '',
    password: '',
    confirm_password: '',
  });
  const [enableFaceReg, setEnableFaceReg] = useState(false);
  const [showFaceCapture, setShowFaceCapture] = useState(false);
  const [faceImage, setFaceImage] = useState(null);

  const handleInputChange = (field, value) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const handleFaceCapture = (imageBase64) => {
    setFaceImage(imageBase64);
    setShowFaceCapture(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) return alert('Passwords do not match');
    
    const payload = { ...formData };
    delete payload.confirm_password;

    try {
      // Backend always registers users with 'user' role, no need to send role parameter
      const data = await api.register({ 
        name: `${formData.first_name} ${formData.last_name}`, 
        email: formData.email, 
        password: formData.password,
        face_image: faceImage // Optional face registration
      });
      onSubmit(data);
    } catch (error) {
      alert("Registration failed:\n" + error.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <InputField icon={User} type="text" placeholder="First Name" value={formData.first_name} onChange={e => handleInputChange('first_name', e.target.value)} required />
        <InputField icon={User} type="text" placeholder="Last Name" value={formData.last_name} onChange={e => handleInputChange('last_name', e.target.value)} required />
      </div>
      <InputField icon={CreditCard} type="text" placeholder="Card Number" value={formData.cin} onChange={e => handleInputChange('cin', e.target.value)} required />
      <InputField icon={Mail} type="email" placeholder="Email" value={formData.email} onChange={e => handleInputChange('email', e.target.value)} required />
      <InputField icon={Phone} type="tel" placeholder="Phone" value={formData.phone_num} onChange={e => handleInputChange('phone_num', e.target.value)} required />
      <InputField icon={MapPin} type="date" placeholder="Birth Date" value={formData.birth_date} onChange={e => handleInputChange('birth_date', e.target.value)} required />
      <InputField icon={Lock} type="password" placeholder="Password" value={formData.password} onChange={e => handleInputChange('password', e.target.value)} required />
      <InputField icon={Lock} type="password" placeholder="Confirm Password" value={formData.confirm_password} onChange={e => handleInputChange('confirm_password', e.target.value)} required />
      
      {/* Optional Face Registration */}
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Scan className="w-5 h-5 text-cyan-400" />
            <span className="text-white font-medium">Enable Face Login (Optional)</span>
          </div>
          <button
            type="button"
            onClick={() => setEnableFaceReg(!enableFaceReg)}
            className={`w-12 h-6 rounded-full transition-colors relative ${enableFaceReg ? 'bg-cyan-500' : 'bg-gray-600'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${enableFaceReg ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
          </button>
        </div>
        {enableFaceReg && (
          <div className="space-y-3">
            <p className="text-gray-400 text-sm">Register your face now for quick login later</p>
            {!faceImage ? (
              <button
                type="button"
                onClick={() => setShowFaceCapture(true)}
                className="w-full py-2 px-4 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Scan className="w-4 h-4" />
                Capture Face
              </button>
            ) : (
              <div className="flex items-center justify-between bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                <span className="text-green-400 text-sm">✓ Face captured</span>
                <button
                  type="button"
                  onClick={() => setFaceImage(null)}
                  className="text-gray-400 hover:text-white text-sm"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <button onClick={handleSubmit} className="w-full py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg flex items-center justify-center gap-2">
        Create Account <ArrowRight className="w-4 h-4" />
      </button>

      {showFaceCapture && (
        <FaceCapture
          onCapture={handleFaceCapture}
          onCancel={() => setShowFaceCapture(false)}
          title="Register Your Face"
        />
      )}
    </div>
  );
};

// Main Auth Page Container
const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  const handleToggle = () => setIsSignUp(!isSignUp);

  
  const handleSignInSubmit = () => {
    // SignInComponent stores minimal profile in localStorage after successful login
    const userRole = (localStorage.getItem('userRole') || 'user').toLowerCase();
    // Redirect normal clients to the client dashboard
    if (userRole === 'user' || userRole === 'passenger') {
      navigate('/client');
      return;
    }
    if (userRole === 'conductor') {
      navigate('/ConductorDashboard');
      return;
    }
    if (userRole === 'admin') {
      navigate('/AdminDashboard');
      return;
    }
    if (userRole === 'operator') {
      navigate('/operator');
      return;
    }
    if (userRole === 'controller') {
      navigate('/controller');
      return;
    }
    // Fallback
    navigate('/');
  };



  const handleSignUpSubmit = () => {
    navigate('/auth');
  };

// Prop types for components
InputField.propTypes = {
  icon: PropTypes.any.isRequired,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.any,
  onChange: PropTypes.func,
  required: PropTypes.bool,
  options: PropTypes.array,
};

SignInComponent.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

SignUpComponent.propTypes = {
  onSubmit: PropTypes.func.isRequired,
};

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <AnimatedBackground />
      <div className="z-10 relative w-full max-w-md">
        <div className="text-center mb-8">
          <div>
                    <img data-aos="fade-in" 
                      data-aos-delay="100" 
                      className="inline-block px-2 bg-gradient-to-r from-cyan-600 to-cyan-400 bg-clip-text text-transparent"
                      src="src/assets/media/text.png" 
                      alt="Smart Bus RFID"
                      loading="lazy"
                      />

                  </div>
          
        </div>
        <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-lg">
          <div className="flex bg-gray-800/50 rounded-t-2xl overflow-hidden">
            <button onClick={() => !isSignUp && handleToggle()} className={`flex-1 py-4 px-6 ${!isSignUp ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white' : 'text-gray-400'}`}> <LogIn className="w-4 h-4" /> Sign In </button>
            <button onClick={() => isSignUp && handleToggle()} className={`flex-1 py-4 px-6 ${isSignUp ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white' : 'text-gray-400'}`}> <UserPlus className="w-4 h-4" /> Sign Up </button>
          </div>
          <div className="p-8">
            {isSignUp ? <SignUpComponent onSubmit={handleSignUpSubmit} /> : <SignInComponent onSubmit={handleSignInSubmit} />}
          </div>
        </div>
        <div className="text-center mt-8 text-gray-400">
          <p>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button onClick={handleToggle} className="text-cyan-400 font-semibold">{isSignUp ? 'Sign In' : 'Sign Up'}</button>
          </p>
        </div>
      </div>
    </div>
  );
};
export default AuthPage;