import 'bootstrap/dist/css/bootstrap.min.css';

export default function Signup() {
  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        background: 'linear-gradient(135deg, #7e0c0c, #5a5a5a, #ffffff)',
      }}
    >
      <div
        className="p-5 rounded-4 shadow-lg text-white"
        style={{
          width: '100%',
          maxWidth: '400px',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(15px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        <h2 className="text-center fw-bold mb-4 text-2xl">Create an account</h2>
        <form>
          <div className="mb-3">
            <label className="form-label text-white">First Name</label>
            <input
              type="text"
              className="form-control bg-transparent border-white text-white"
              placeholder="Enter your first name"
              required
              minLength={2}
            />
          </div>

          <div className="mb-3">
            <label className="form-label text-white">Last Name</label>
            <input
              type="text"
              className="form-control bg-transparent border-white text-white"
              placeholder="Enter your last name"
              required
              minLength={2}
            />
          </div>

          <div className="mb-3">
            <label className="form-label text-white">Email Address</label>
            <input
              type="email"
              className="form-control bg-transparent border-white text-white"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label text-white">Personal ID</label>
            <input
              type="text"
              className="form-control bg-transparent border-white text-white"
              placeholder="Enter your ID"
              required
              pattern="[A-Za-z0-9]{5,}"
              title="At least 5 alphanumeric characters"
            />
          </div>

          <div className="mb-3">
            <label className="form-label text-white">Phone Numbers</label>
            <input
              type="tel"
              className="form-control bg-transparent border-white text-white"
              placeholder="Enter your phone number"
              required
              pattern="^\+?[0-9]{8,15}$"
              title="Enter a valid phone number (8 to 15 digits)"
            />
          </div>

          <div className="mb-4">
            <label className="form-label text-white">Password</label>
            <input
              type="password"
              className="form-control bg-transparent border-white text-white"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button className="btn btn-outline-light w-100 fw-semibold" type="submit">
            Sign up
          </button>
        </form>
      </div>
    </div>
  );
}
