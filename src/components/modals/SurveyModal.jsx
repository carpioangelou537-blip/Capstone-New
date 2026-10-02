import Modal from "../ui/Modal";
import SurveyFormPanel from "../panels/SurveyFormPanel";

export default function SurveyModal({ me, onSubmit, onClose }) {
  return (
    <Modal title="Complete Your Alumni Info" onClose={onClose}>
      <p className="modal-sub">A few quick details so we can match you with relevant openings and analytics. You can always update this later from "Complete the Alumni Survey" in the sidebar.</p>
      <SurveyFormPanel me={me} onSubmit={onSubmit} submitLabel="Save & continue" />
    </Modal>
  );
}