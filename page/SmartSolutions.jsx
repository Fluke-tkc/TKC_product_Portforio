import React from "react";
import { useNavigate } from "react-router-dom"; // ใช้ useNavigate
import styles from "./SmartSolutions.module.css";

export const SmartSolutions = () => {
  return (
    <section className={styles.container}>
      <div className={styles.header}>
        Smart Solutions
      </div>
      <div className={styles.gridContainer}>
        <div>
          <button>
            Smart Solutions
          </button>
          <button>
            Smart Solutions
          </button>
          <button>
            Smart Solutions
          </button>
          <button>
            Smart Solutions
          </button>
        </div>
      </div>
      <div className={styles.gridContainer}>
        <div>
          <button>
            Smart Solutions
          </button>
          <button>
            Smart Solutions
          </button>
          <button>
            Smart Solutions
          </button>
          <button>
            Smart Solutions
          </button>
        </div>
      </div>
    </section>
  );
};

export default SmartSolutions;
