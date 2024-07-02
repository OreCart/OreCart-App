import { forwardRef, useImperativeHandle, useRef } from "react";
import { Route } from "../../api/types";
import { RouteEditFormRef, RouteEditProps } from "./route-types";
const EditRouteForm = forwardRef<RouteEditFormRef, RouteEditProps>(
  ({ onSubmit, onDelete, onCancel }, ref) => {
    const nameRef = useRef<HTMLInputElement>(null);
    const kmlRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      onSubmit(formData);
    };

    const setData = (data: Route) => {
      if (nameRef.current && kmlRef.current) {
        nameRef.current.value = data.name;
      }
    };

    const clearForm = () => {
      nameRef.current!.value = "";
      kmlRef.current!.value = "";
    };

    useImperativeHandle(ref, () => ({
      setData,
      clearForm,
    }));

    return (
      <form className="edit-form" onSubmit={handleSubmit}>
        <h2>Edit Route</h2>
        <label htmlFor="name">Name</label>
        <input type="text" id="name" name="name" ref={nameRef} />
        <br />
        <label htmlFor="kml">KML File</label>
        <input type="file" id="kml" name="kml" ref={kmlRef} />
        <br />
        <button type="submit">Submit</button>
        <button type="button" onClick={onDelete}>
          Delete
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </form>
    );
  }
);

export default EditRouteForm;
