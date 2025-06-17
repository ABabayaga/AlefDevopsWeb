import { useTranslation } from 'next-i18next'

const Footer: React.FC = () => {

  const { t } = useTranslation('common')

  return (
    <footer style={{ marginTop: "30px", textAlign: "center" }}>
      <hr className="mt-5 mb-4" />
      <p className="text-muted center ">
      © 2025 Alef Devops.{t('allfooter')}.
      </p>
    </footer>
  );
};

export default Footer;
