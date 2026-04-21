import '../styles/Loader.css';

export default function Loader() {
  return (
    <div className="loader-container" id="loader">
      <div className="loader-spinner">
        <div className="loader-ring"></div>
        <div className="loader-ring"></div>
        <div className="loader-ring"></div>
      </div>
      <p className="loader-text">Loading your portfolio...</p>
    </div>
  );
}
