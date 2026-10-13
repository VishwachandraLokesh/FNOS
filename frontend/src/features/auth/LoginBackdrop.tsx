import avocado from '../../assets/login/avocado.png';
import lemon from '../../assets/login/lemon.png';
import tomato from '../../assets/login/tomato.png';
import watermelon from '../../assets/login/watermelon.png';
import waves from '../../assets/login/waves.svg';
import styles from './LoginBackdrop.module.css';

// Rounded diamond used for the three green dots in the Login mockup (login.svg, 1366×768).
const DOT_PATH =
  'M1007.5 91.5C1009.21 89.7861 1010.07 88.9291 1010.96 88.4092C1013.46 86.9485 1016.54 86.9485 1019.04 88.4092C1019.93 88.9291 1020.79 89.7861 1022.5 91.5C1024.21 93.2139 1025.07 94.0709 1025.59 94.9592C1027.05 97.4551 1027.05 100.545 1025.59 103.041C1025.07 103.929 1024.21 104.786 1022.5 106.5C1020.79 108.214 1019.93 109.071 1019.04 109.591C1016.54 111.051 1013.46 111.051 1010.96 109.591C1010.07 109.071 1009.21 108.214 1007.5 106.5C1005.79 104.786 1004.93 103.929 1004.41 103.041C1002.95 100.545 1002.95 97.4551 1004.41 94.9592C1004.93 94.0709 1005.79 93.2139 1007.5 91.5Z';

/** Decorative fruit and shapes behind the Login card. Hidden from assistive technology. */
export function LoginBackdrop() {
  return (
    <div className={styles.backdrop} aria-hidden="true">
      <img className={styles.waves} src={waves} alt="" width={445} height={383} />
      <img className={styles.avocado} src={avocado} alt="" />
      <img className={styles.watermelon} src={watermelon} alt="" />
      <img className={styles.lemon} src={lemon} alt="" />
      <img className={styles.tomato} src={tomato} alt="" />
      <Dot className={styles.dotMint} />
      <Dot className={styles.dotFaint} />
      <Dot className={styles.dotGreen} />
      <svg className={styles.triangle} viewBox="1267 636 41 35" focusable="false">
        <path d="M1305.25 662.75C1307.18 666.083 1304.77 670.25 1300.92 670.25L1274.08 670.25C1270.23 670.25 1267.82 666.083 1269.75 662.75L1283.17 639.5C1285.09 636.166 1289.91 636.166 1291.83 639.5L1305.25 662.75Z" />
      </svg>
      <svg className={styles.halfCircle} viewBox="63 226 29 29" focusable="false">
        <path d="M63.5 249.5C66.55 252.55 70.6867 254.263 75 254.263C79.3133 254.263 83.45 252.55 86.5 249.5C89.55 246.45 91.2635 242.313 91.2635 238C91.2635 233.687 89.55 229.55 86.5 226.5L75 238L63.5 249.5Z" />
      </svg>
    </div>
  );
}

function Dot({ className }: { className: string | undefined }) {
  return (
    <svg className={className} viewBox="1002.9 86.9 24.2 24.2" focusable="false">
      <path d={DOT_PATH} />
    </svg>
  );
}
