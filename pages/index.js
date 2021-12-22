import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMap } from "@fortawesome/free-solid-svg-icons";

export default function Home() {
  return (
    <div>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header className={styles.navWrap}>
        <div className={styles.nav}>
          <div className={styles.navLogo}>
            <FontAwesomeIcon icon={faMap} className={styles.navLogoIcon} /> Img
            Guide
          </div>
          <ul>
            {/* <li>Showcase</li> */}
            <li>Docs</li>
            <li>GitHub</li>
            <li>FAQ</li>
            <li>Pricing</li>
            <li>Demo</li>
            <li>Login</li>
            <li className={styles.navButton}>Create a Guide →</li>
          </ul>
        </div>
      </header>
      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.title}>
            Create beautiful instructional guides in seconds
          </h1>
        </main>
      </div>
      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Made with ❤ in San Francisco
        </a>
      </footer>
    </div>
  );
}
