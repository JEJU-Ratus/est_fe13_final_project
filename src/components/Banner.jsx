import Image from "next/image";
import styles from "./Banner.module.scss";

const DEFAULT_IMAGE_SRC = "/images/이벤트 광고.jpg";
const DEFAULT_ALT = "프론트엔드 스킬업 이벤트";

export default function Banner({ imageSrc = DEFAULT_IMAGE_SRC, alt = DEFAULT_ALT }) {
  return (
    <div className={styles["banner"]}>
      <Image
        className={styles["banner-image"]}
        src={imageSrc}
        alt={alt}
        width={1322}
        height={358}
        sizes="100vw"
      />
    </div>
  );
}
