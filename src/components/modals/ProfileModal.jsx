import Modal from "../ui/Modal";
import ProfilePanel from "../panels/ProfilePanel";

export default function ProfileModal({ me, email, latestSurveyStatus, latestSurvey, onSave, onClose }) {
  return (
    <Modal title="Profile & Settings" subtitle="Update your photo and personal details. Changes save immediately." onClose={onClose}>
      <ProfilePanel me={me} email={email} latestSurveyStatus={latestSurveyStatus} latestSurvey={latestSurvey} onSave={onSave} />
    </Modal>
  );
}