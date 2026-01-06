import { useI18n } from "../i18n";

function Auth() {
  const { t } = useI18n();
  return (
    <div>
      <h2>{t("pages.auth.login")}</h2>
      <p>Simple auth placeholder</p>
    </div>
  );
}

export default Auth;