import { useLocation, useNavigate } from "react-router-dom";
import ProgressBar from "../components/ProgressBar";
import { useI18n } from "../i18n";

function Result() {
  const { state } = useLocation() as any;
  const navigate = useNavigate();
  const { t } = useI18n();

  if (!state) {
    return (
      <div>
        <p>No results available</p>
        <button onClick={() => navigate("/")}>Home</button>
      </div>
    );
  }

  const { score, percent } = state;

  const level = percent < 40 ? t("resultLevels.weak") : percent < 70 ? t("resultLevels.medium") : t("resultLevels.high");

  return (
    <div>
      <h2>{t("pages.result.score")} : {score}</h2>
      <p>{t("pages.result.percent")} : {Math.round(percent)}%</p>
      <p>Level: {level}</p>
      <ProgressBar percent={percent} />
    </div>
  );
}

export default Result;