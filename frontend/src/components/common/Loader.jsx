const Loader = ({ size = "medium", fullScreen = false }) => {
  const sizeClass = {
    small: "loader-small",
    medium: "loader-medium",
    large: "loader-large",
  }[size];

  const loader = (
    <div className={`loader ${sizeClass}`}>
      <div className="spinner"></div>
    </div>
  );

  if (fullScreen) {
    return <div className="loader-fullscreen">{loader}</div>;
  }

  return loader;
};

export default Loader;
