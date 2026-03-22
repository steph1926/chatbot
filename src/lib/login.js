// ============= LOGIN & REGISTRATION LOGIC =============
import { state, MOCK_USERS, registeredStudents } from './state.js';

let isRegistering = false;

export function initLogin(onLoginSuccess) {
  const loginForm = document.getElementById('login-form');
  const loginId = document.getElementById('login-id');
  const loginPassword = document.getElementById('login-password');
  const loginError = document.getElementById('login-error');
  const togglePasswordBtn = document.getElementById('toggle-password');
  const toggleFormBtn = document.getElementById('toggle-form-btn');
  const toggleFormText = document.getElementById('toggle-form-text');
  const formTitle = document.getElementById('form-title');
  const formSubtitle = document.getElementById('form-subtitle');
  const submitBtn = document.getElementById('login-submit-btn');
  const regFields = document.getElementById('registration-fields');

  togglePasswordBtn.addEventListener('click', () => {
    state.showPassword = !state.showPassword;
    loginPassword.type = state.showPassword ? 'text' : 'password';
    togglePasswordBtn.innerHTML = state.showPassword
      ? '<i data-lucide="eye-off" class="h-4 w-4"></i>'
      : '<i data-lucide="eye" class="h-4 w-4"></i>';
    lucide.createIcons();
  });

  toggleFormBtn.addEventListener('click', () => {
    isRegistering = !isRegistering;
    loginError.classList.add('hidden');
    if (isRegistering) {
      formTitle.textContent = 'Create Account';
      formSubtitle.textContent = 'Register as a new student';
      submitBtn.textContent = 'Register';
      toggleFormText.innerHTML = 'Already have an account? <button id="toggle-form-btn-inner" class="text-primary font-semibold hover:underline">Log In</button>';
      regFields.classList.remove('hidden');
      loginId.placeholder = 'Student Number (e.g. 2024-00001)';
      document.getElementById('login-id-label').textContent = 'Student Number';
    } else {
      formTitle.textContent = 'Welcome Back';
      formSubtitle.textContent = 'Log in to continue';
      submitBtn.textContent = 'Log In';
      toggleFormText.innerHTML = 'Don\'t have an account? <button id="toggle-form-btn-inner" class="text-primary font-semibold hover:underline">Register</button>';
      regFields.classList.add('hidden');
      loginId.placeholder = 'Student Number or Admin Email';
      document.getElementById('login-id-label').textContent = 'Student Number / Email';
    }
    // Re-bind the inner toggle button
    document.getElementById('toggle-form-btn-inner')?.addEventListener('click', () => toggleFormBtn.click());
  });

  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const id = loginId.value.trim();
    const password = loginPassword.value.trim();

    if (isRegistering) {
      // Registration flow
      const fullName = document.getElementById('reg-fullname').value.trim();
      const program = document.getElementById('reg-program').value.trim();

      if (!fullName || !id || !program || !password) {
        loginError.textContent = 'Please fill in all fields.';
        loginError.classList.remove('hidden');
        return;
      }

      // Check if student number already exists
      if (registeredStudents.find(s => s.studentNumber === id)) {
        loginError.textContent = 'This student number is already registered.';
        loginError.classList.remove('hidden');
        return;
      }

      // Register the student
      const newStudent = { studentNumber: id, password, name: fullName, program, role: 'student' };
      registeredStudents.push(newStudent);

      loginError.classList.add('hidden');
      state.currentUser = newStudent;
      onLoginSuccess(newStudent);
    } else {
      // Login flow
      if (!id || !password) {
        loginError.textContent = 'Please fill in all fields.';
        loginError.classList.remove('hidden');
        return;
      }

      // Check admin (by email)
      const admin = MOCK_USERS.find(u => u.email === id && u.password === password);
      if (admin) {
        loginError.classList.add('hidden');
        state.currentUser = admin;
        onLoginSuccess(admin);
        return;
      }

      // Check registered students (by student number)
      const student = registeredStudents.find(s => s.studentNumber === id && s.password === password);
      if (student) {
        loginError.classList.add('hidden');
        state.currentUser = student;
        onLoginSuccess(student);
        return;
      }

      loginError.textContent = 'Invalid credentials. Please check your student number/email and password.';
      loginError.classList.remove('hidden');
    }
  });
}
