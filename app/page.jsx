import styles from "@/app/ui/login/login.module.css";
import dynamic from 'next/dynamic'
const LoginForm = dynamic(() => import("./ui/login/loginForm/loginForm"))
const LoginPage = async () => {
  return (
    <div
     className={styles.container}
     >
      <LoginForm/>
    </div>
  );
};

export default LoginPage;
