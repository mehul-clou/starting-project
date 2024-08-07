import {
  Link,
  Outlet,
  useNavigate,
  useParams,
} from "react-router-dom";

import Header from "../Header.jsx";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchEvent, deleteEvent } from "../../Util/http.js";
import ErrorBlock from "../UI/ErrorBlock.jsx";
import { queryClient } from "../../Util/http.js";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, isError, isPending, error } = useQuery({
    queryKey: ["events", id],
    queryFn: ({ signal }) => fetchEvent({ id, signal }),
    staleTime: 2000,
  });

  const { mutate, isPending: mutationIsPending } = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events"],
        refetchType: "none",
      });

      navigate("/events");
    },
  });

  function handleDelete() {
    mutate({ id });
  }

  return (
    <>
      <Outlet />
      <Header>
        <Link to="/events" className="nav-item">
          ALL EVENTS
        </Link>
      </Header>
      {isError && (
        <ErrorBlock
          title="Failed to fetch event"
          message={
            error.info?.message ||
            "Failed to fetch event.Please try again later"
          }
        />
      )}

      {isPending && <LoadingIndicator />}

      {data && (
        <article id="event-details">
          <header>
            <h1>{data?.title}</h1>
            <nav>
              <button onClick={handleDelete}>
                {mutationIsPending ? "processing" : "Delete"}
              </button>
              <Link to="edit">Edit</Link>
            </nav>
          </header>
          <div id="event-details-content">
            <img
              src={`http://localhost:3000/${data?.image}`}
              alt={data?.title}
            />
            <div id="event-details-info">
              <div>
                <p id="event-details-location">{data?.location}</p>
                <time dateTime={`Todo-DateT$Todo-Time`}>
                  {data?.date} @ {data?.time}
                </time>
              </div>
              <p id="event-details-description">{data?.description}</p>
            </div>
          </div>
        </article>
      )}
    </>
  );
}
