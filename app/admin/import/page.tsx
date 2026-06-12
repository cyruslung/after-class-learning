import { BackLink } from "@/components/BackLink";
import { PageTitle } from "@/components/PageTitle";
import { ImportForm } from "@/components/admin/ImportForm";

export default function ImportPage() {
  return (
    <div>
      <BackLink href="/admin" label="回管理頁" />
      <PageTitle emoji="📥" title="匯入題庫" subtitle="貼上 JSON 格式題庫資料" />
      <ImportForm />
    </div>
  );
}
