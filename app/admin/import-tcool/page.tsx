import { BackLink } from "@/components/BackLink";
import { PageTitle } from "@/components/PageTitle";
import { TcoolImportClient } from "@/components/admin/TcoolImportClient";

export default function ImportTcoolPage() {
  return (
    <div>
      <BackLink href="/admin" label="回管理頁" />
      <PageTitle emoji="📄" title="tcool 考卷匯入" subtitle="從中小學題庫網 PDF 匯入段考題目" />
      <TcoolImportClient />
    </div>
  );
}
