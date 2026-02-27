import { useNavigate } from "react-router-dom";

const ErrorPage = () => {
  const navigate = useNavigate();

  return (
    <div className="pg md:flex md:justify-center md:items-center gap-6 bg-grey-200 font-[500]">
      <div>
        <p className="text-2xl">Error 404</p>
        <p>The page you are looking for dosent exist</p>
        <button
          type="button"
          className="btn w-max h-max mt-6 p-3 tap"
          onClick={() => navigate("/")}
        >
          Go Home
        </button>
      </div>
      <img
        src="https://cdn.pixabay.com/photo/2017/03/09/12/31/error-2129569__340.jpg"
        alt=""
        width={500}
        height={250}
      />
    </div>
  );
};

export default ErrorPage;
