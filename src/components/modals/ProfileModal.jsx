import Modal from "../ui/Modal";
import ProfilePanel from "../panels/ProfilePanel";

export default function ProfileModal({ me, onSave, onClose }) {
  return (
    <Modal title="Profile & Settings" subtitle="Update your photo and personal details. Changes save immediately." onClose={onClose}>
      <ProfilePanel me={me} onSave={onSave} />
    </Modal>
  );
}