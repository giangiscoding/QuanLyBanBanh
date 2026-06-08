import { Empty, Typography } from 'antd';

// Trang tam cho cac module chua lam. Moi nguoi thay bang trang that cua module minh.
export default function PlaceholderPage({ title, owner }: { title: string; owner?: string }) {
  return (
    <div>
      <Typography.Title level={3}>{title}</Typography.Title>
      <Empty
        description={
          <span>
            Module dang phat trien{owner ? ` — phu trach: ${owner}` : ''}
          </span>
        }
      />
    </div>
  );
}
