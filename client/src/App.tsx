import { useNavigate } from "react-router";

function App() {
  const navigate = useNavigate();
  return (
    <div className="relative h-screen">
      <div className="flex flex-col items-center justify-center h-full">
        <form
          className="flex flex-col items-center border rounded p-4"
          onSubmit={(evt) => {
            const formData = new FormData(evt.target);
            const room = formData.get("room") as string;
            if (!room.trim()) return;
            navigate(`/${room}`);
          }}
        >
          <label htmlFor="room" className="self-start">
            Room Name
          </label>
          <input
            id="room"
            type="text"
            title="room"
            className="border rounded p-2 mb-2"
          />
          <button
            type="submit"
            className="border rounded px-4 py-2 cursor-pointer hover:bg-green-400 bg-green-300  dark:text-black"
          >
            Join
          </button>
        </form>
      </div>
      <a
        href="https://github.com/KiranNamawar/demo-webrtc"
        className="absolute bottom-4 left-1/2 -translate-x-1/2 text-blue-500"
      >
        Source Code
      </a>
    </div>
  );
}

export default App;
