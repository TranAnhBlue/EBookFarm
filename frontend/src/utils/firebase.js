import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

// Cấu hình Firebase từ người dùng cung cấp
const firebaseConfig = {
  apiKey: "AIzaSyBB1T7NSMWow0TBeA9HpfH1vU1BzT57zM0",
  authDomain: "gen-lang-client-0961678619.firebaseapp.com",
  projectId: "gen-lang-client-0961678619",
  storageBucket: "gen-lang-client-0961678619.firebasestorage.app",
  messagingSenderId: "246444284347",
  appId: "1:246444284347:web:c1f132494f873ac76ccc9e",
  measurementId: "G-QS1GN1V0L9"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Thiết lập ngôn ngữ Tiếng Việt cho SMS và Captcha
auth.languageCode = 'vi';

export { auth, RecaptchaVerifier, signInWithPhoneNumber };
