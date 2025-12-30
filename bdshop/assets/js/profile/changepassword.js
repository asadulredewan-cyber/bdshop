import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


const changePasswordBtn = document.getElementById("changePassword");
const passwordModal = document.getElementById("passwordModal");

const currentPassword = document.getElementById("currentPassword");
const newPassword = document.getElementById("newPassword");
const confirmPassword = document.getElementById("confirmPassword");

const cancelPasswordChange = document.getElementById("cancelPasswordChange");
const savePasswordChange = document.getElementById("savePasswordChange");
changePasswordBtn.onclick = () => {
  passwordModal.classList.add("active");
};

cancelPasswordChange.onclick = () => {
  passwordModal.classList.remove("active");
};
savePasswordChange.onclick = async () => {
  const user = auth.currentUser;

  if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
    alert("All fields are required");
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    alert("New passwords do not match");
    return;
  }

  if (newPassword.value.length < 6) {
    alert("Password must be at least 6 characters");
    return;
  }

  try {
    const credential = EmailAuthProvider.credential(
      user.email,
      currentPassword.value
    );

    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword.value);

    alert("Password updated successfully");
    passwordModal.classList.remove("active");

    currentPassword.value = "";
    newPassword.value = "";
    confirmPassword.value = "";

  } catch (err) {
    alert(err.message || "Password update failed");
  }
};
