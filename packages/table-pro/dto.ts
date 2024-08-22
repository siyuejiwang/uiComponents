import type { ColumnsType } from 'antd/es/table';
type ITableProps = {
    title?: string;
    columns: ColumnsType<any>;
    dataSource: object[];
}

export default ITableProps;