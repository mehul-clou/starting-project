import { Link, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";

import Modal from "../UI/Modal.jsx";
import EventForm from "./EventForm.jsx";
import { fetchEvent, updateEvent, queryClient } from "../../Util/http.js";
import LoadingIndicator from "../UI/LoadingIndicator.jsx";
import ErrorBlock from "../UI/ErrorBlock.jsx";

export default function EditEvent() {
  const navigate = useNavigate();
  const { id } = useParams();

  const { data, isError, error, isPending } = useQuery({
    queryKey: ["events", id],
    queryFn: ({ signal }) => fetchEvent({ signal, id }),
  });

  const { mutate } = useMutation({
    mutationFn: updateEvent,
    onMutate: async (data) => {

      await queryClient.cancelQueries({queryKey : ["events", id]});

      const previousEvent = queryClient.getQueryData(["events", id]);

      queryClient.setQueryData(["events", id], data.event);

      return {previousEvent}
    },
    onError:(data,error,context)=>{
      queryClient.setQueryData(["events", id],context.previousEvent)
    },

    onSettled:()=>{
      queryClient.invalidateQueries({ queryKey: ["events", id]})
    }
    
  });

  let content;
  function handleSubmit(formData) {
    mutate({ id, event: formData });
    navigate("../");
  }

  function handleClose() {
    navigate("../");
  }

  if (isPending) {
    content = (
      <>
        <div className="center">
          <LoadingIndicator />
        </div>
      </>
    );
  }

  if (isError) {
    content = (
      <>
        <ErrorBlock
          title="Failed to load data"
          message={error.info?.message || "failed to fetch data"}
        />
        <div className="form-actions">
          <Link to="../" className="button">
            Okay
          </Link>
        </div>
      </>
    );
  }

  if (data) {
    content = (
      <EventForm inputData={data} onSubmit={handleSubmit}>
        <Link to="../" className="button-text">
          Cancel
        </Link>
        <button type="submit" className="button">
          Update
        </button>
      </EventForm>
    );
  }

  return <Modal onClose={handleClose}>{content}</Modal>;
}
