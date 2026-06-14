import { useNavigate } from "react-router";

function App() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center">
      <form
        onSubmit={(evt) => {
          const formData = new FormData(evt.target);
          const room = formData.get("room") as string;
          if (!room.trim()) return;
          navigate(`/${room}`);
        }}
      >
        <label htmlFor="room">Room Name</label>
        <input id="room" type="text" title="room" />
        <button type="submit">Join</button>
      </form>
    </div>
  );
}

export default App;
