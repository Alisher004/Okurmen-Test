import { useI18n } from "../i18n";
import { useNavigate } from "react-router-dom";

function LevelSelect() {
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <div>
      <h2>{t("pages.level.choose")}</h2>
      <button onClick={() => navigate("/test")}>{t("app.start")}</button>
    </div>
  );
}

export default LevelSelect;