import { useNavigate } from "react-router-dom";

const ErrorPage = () => {
  const navigate = useNavigate();

  return (
    <div className="pg min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Page not found</h1>
        <p className="text-slate-600 mb-8">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <button
          type="button"
          className="btn-primary max-w-xs"
          onClick={() => navigate("/")}
        >
          Go to home
        </button>
      </div>
    </div>
  );
};

export default ErrorPage;
