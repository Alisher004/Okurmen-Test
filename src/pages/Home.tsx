import { Link } from "react-router-dom";
import { useI18n } from "../i18n";

function Home() {
  const { t } = useI18n();
  return (
    <div>
      <h2>{t("pages.home.welcome")}</h2>
      <Link to="/auth">{t("pages.auth.login")}</Link>
      <br />
      <Link to="/level">{t("pages.level.choose")}</Link>
    </div>
  );
}

export default Home;