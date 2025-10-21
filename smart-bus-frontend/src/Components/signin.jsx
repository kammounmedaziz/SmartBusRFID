import 'bootstrap/dist/css/bootstrap.min.css';

export default function Sign() {
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
        <h2 className="text-center fw-bold mb-4 text-2xl">Welcome Back</h2>
        <form>
          
          <div className="mb-3">
            <label className="form-label text-white">Personal ID</label>
            <div className="input-group">
              <span className="input-group-text bg-transparent border-white text-white">
                <i className="bi bi-envelope"></i>
              </span>
              <input
                className="form-control bg-transparent border-white text-white"
                placeholder="Enter your ID"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="form-label text-white">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-transparent border-white text-white">
                <i className="bi bi-lock"></i>
              </span>
              <input
                type="password"
                className="form-control bg-transparent border-white text-white"
                placeholder="••••••••"
              />
            </div>
          </div>
          <button className="btn btn-outline-light w-100 fw-semibold" type="submit">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
